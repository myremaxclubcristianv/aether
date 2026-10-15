import React from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { getChallenges } from '@/lib/challenges';
import { ChallengeList } from '@/components/challenges/challenge-list';
import { DbProfile, UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Social Challenges • AETHER',
  description: 'Proof-based multi-user sprints. Turn commitments into verified achievements.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChallengesPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  const { data: rawProfile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()) as { data: DbProfile | null };

  if (!rawProfile?.username) {
    redirect('/onboarding');
  }

  const userProfile: UserProfile = {
    id: rawProfile.id,
    username: rawProfile.username,
    avatarUrl: rawProfile.avatar_url,
    bio: rawProfile.bio,
    flexScore: rawProfile.flex_score || 0,
    streak: rawProfile.streak || 0,
    createdAt: rawProfile.created_at,
  };

  const initialChallenges = await getChallenges(user.id);

  return (
    <AppShell initialUser={userProfile}>
      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        <ChallengeList
          initialChallenges={initialChallenges}
          currentUserId={user.id}
        />
      </div>
    </AppShell>
  );
}
