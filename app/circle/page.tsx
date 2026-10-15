import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCircleFeed, getSuggestedUsers } from '@/lib/circle';
import { DbProfile } from '@/types';
import { CircleDashboard } from '@/components/circle/circle-dashboard';
import { AppShell } from '@/components/layout/app-shell';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Circle • AETHER',
  description: 'Track real achievements from people who inspire you.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CirclePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
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

  // Fetch initial circle feed and suggestion list on the server side
  const initialFeed = await getCircleFeed(user.id);
  const initialSuggestions = await getSuggestedUsers(user.id);

  return (
    <AppShell initialUser={userProfile}>
      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        <CircleDashboard
          initialFeed={initialFeed}
          initialSuggestions={initialSuggestions}
          currentUserId={user.id}
        />
      </div>
    </AppShell>
  );
}
