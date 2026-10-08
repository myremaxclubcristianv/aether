'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, ProofRecord, DbProfile, DbProof } from '@/types';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProofList } from '@/components/proof/proof-list';
import { Navigation } from '@/components/navigation';


export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }

        const { data: profile } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()) as { data: DbProfile | null };

        if (!profile || !profile.username) {
          // Profile not yet created/configured, push to onboarding
          router.push('/onboarding');
          return;
        }

        const mappedProfile: UserProfile = {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          flexScore: profile.flex_score,
          streak: profile.streak,
          createdAt: profile.created_at,
        };
        setUserProfile(mappedProfile);

        const { data: dbProofs, error: proofsError } = (await supabase
          .from('proofs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })) as { data: DbProof[] | null; error: unknown };

        if (proofsError) throw proofsError;

        if (dbProofs && dbProofs.length > 0) {
          const mappedProofs: ProofRecord[] = dbProofs.map((p) => ({
            id: p.id,
            userId: p.user_id,
            imageUrl: p.image_url,
            category: p.category,
            caption: p.caption,
            points: p.points,
            createdAt: p.created_at,
          }));
          setProofs(mappedProofs);
        } else {
          setProofs([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch profile insights.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  const filteredProofs = proofs.filter((proof) => {
    if (filter === 'all') return true;
    if (filter === 'verified') return proof.points > 0;
    if (filter === 'pending') return proof.points === 0;
    return true;
  });

  const verifiedCount = proofs.filter((p) => p.points > 0).length;
  const pendingCount = proofs.filter((p) => p.points === 0).length;

  if (loading) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 pb-28 min-h-screen bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-950">
        <span className="font-mono text-xs tracking-[0.25em] text-zinc-400 select-none">
          A E T H E R
        </span>
        <button
          onClick={() => router.push('/proof/create')}
          aria-label="Create new proof"
          className="flex items-center justify-center h-7 w-7 rounded-full border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all select-none"
        >
          <svg
            className="h-4 w-4 stroke-[1.75]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </header>

      {/* Main Profile Info Section */}
      <main className="flex-1 px-5 flex flex-col gap-6">
        {error && (
          <div className="text-[11px] font-mono text-red-450 bg-red-950/10 border border-red-900/20 px-3 py-2.5 rounded-md mt-4">
            {error}
          </div>
        )}

        <ProfileHeader user={userProfile} proofCount={proofs.length} />

        {/* Filters/Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mt-2">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`text-[10px] font-mono tracking-wider transition-colors select-none ${
                filter === 'all' ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              ALL PROOFS
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`text-[10px] font-mono tracking-wider transition-colors select-none ${
                filter === 'verified' ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              VERIFIED ({verifiedCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`text-[10px] font-mono tracking-wider transition-colors select-none ${
                filter === 'pending' ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              PENDING ({pendingCount})
            </button>
          </div>
        </div>

        {/* Proofs Feed */}
        <div className="mt-2">
          <ProofList proofs={filteredProofs} />
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <Navigation />
    </div>
  );
}
