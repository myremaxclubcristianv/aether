import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCircleFeed, getSuggestedUsers } from '@/lib/circle';
import { CircleDashboard } from '@/components/circle/circle-dashboard';
import { Navigation } from '@/components/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Circle • Aether',
  description: 'Track real achievements from people who inspire you.',
};

export default async function CirclePage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch initial circle feed and suggestion list on the server side (0 N+1)
  const initialFeed = await getCircleFeed(user.id);
  const initialSuggestions = await getSuggestedUsers(user.id);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black pb-28">
      {/* Circle Feed and dashboard container */}
      <main className="flex-1 px-5 pt-8">
        <CircleDashboard
          initialFeed={initialFeed}
          initialSuggestions={initialSuggestions}
          currentUserId={user.id}
        />
      </main>

      {/* Floating Bottom Navigation */}
      <Navigation />
    </div>
  );
}
