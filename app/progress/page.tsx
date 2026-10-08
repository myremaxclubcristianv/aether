import React from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { computeUserProgress } from '@/lib/progress';
import { ProgressOverview } from '@/components/progress/progress-overview';
import { MomentumCard } from '@/components/progress/momentum-card';
import { Window30Days } from '@/components/progress/window-30-days';
import { WeeklyRecap } from '@/components/progress/weekly-recap';
import { TimelineArchive } from '@/components/progress/timeline-archive';
import { MilestonesGrid } from '@/components/progress/milestones-grid';
import { DbProfile, DbProof, UserProfile, ProofRecord } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Personal Progress & Archive • AETHER',
  description: 'Your real-world timeline of proofs, consistency streaks, 30-day velocity and milestones.',
};

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 1. Fetch user profile
  const { data: dbProfile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()) as { data: DbProfile | null };

  if (!dbProfile?.username) {
    redirect('/onboarding');
  }

  const userProfile: UserProfile = {
    id: dbProfile.id,
    username: dbProfile.username,
    avatarUrl: dbProfile.avatar_url,
    bio: dbProfile.bio,
    flexScore: dbProfile.flex_score || 0,
    streak: dbProfile.streak || 0,
    createdAt: dbProfile.created_at,
  };

  // 2. Fetch all user proofs ordered by creation
  const { data: dbProofs } = (await supabase
    .from('proofs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })) as { data: DbProof[] | null };

  const proofs: ProofRecord[] = (dbProofs || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    imageUrl: p.image_url,
    category: p.category,
    caption: p.caption,
    points: p.points,
    createdAt: p.created_at,
  }));

  // 3. Fetch followers count for milestones
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id);

  // 4. Deterministic computation
  const progressData = computeUserProgress(userProfile, proofs, followersCount || 0);

  return (
    <AppShell initialUser={userProfile}>
      <div className="flex flex-col gap-8 px-4 sm:px-6 py-6 sm:py-8">
        <ProgressOverview progress={progressData} />
        <MomentumCard momentum={progressData.momentum} />
        <WeeklyRecap recap={progressData.weeklyRecap} />
        <Window30Days metrics={progressData.window30Days} />
        <TimelineArchive timeline={progressData.timeline} />
        <MilestonesGrid milestones={progressData.milestones} />
      </div>
    </AppShell>
  );
}
