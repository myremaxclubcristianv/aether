'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProofForm } from '@/components/proof/proof-form';

export default function ProofCreatePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);
      } catch (err) {
        console.error('Failed to load session:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="flex flex-col flex-1 pb-12 min-h-screen bg-black">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-950">
        <button
          onClick={() => router.push('/home')}
          className="text-xs font-mono tracking-wider text-zinc-550 hover:text-zinc-300 transition-colors flex items-center gap-1 select-none"
        >
          <svg
            className="h-3 w-3 stroke-[2.5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          BACK
        </button>
        <span className="font-mono text-xs tracking-wider text-white select-none">
          SUBMIT PROOF
        </span>
        <div className="w-8 h-4" /> {/* Spacer */}
      </header>

      {/* Form Container */}
      <main className="flex-1 px-5 py-6">
        <ProofForm userId={userId} />
      </main>
    </div>
  );
}
