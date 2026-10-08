import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { ProofForm } from '@/components/proof/proof-form';
import { DbProfile } from '@/types';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Log Proof • Aether',
  description: 'Document what you actually accomplished.',
};

export default async function ProofPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = rawProfile as DbProfile | null;

  if (!profile || !profile.username) {
    redirect('/onboarding');
  }

  const userProfile = {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    flexScore: profile.flex_score,
    streak: profile.streak,
    createdAt: profile.created_at,
  };

  return (
    <AppShell initialUser={userProfile}>
      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        <header className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">
            NEW RECORD
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Create Proof
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            Make it count. Actions over appearances.
          </p>
        </header>

        <main className="pt-2">
          <ProofForm 
            userId={user.id} 
            username={userProfile.username} 
            isFirstProof={userProfile.flexScore === 0} 
          />
        </main>
      </div>
    </AppShell>
  );
}
