import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { getChallengeById } from '@/lib/challenges';
import { ChallengeDetails } from '@/components/challenges/challenge-details';
import { DbProfile, UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return {
      title: 'Sprint Not Found • AETHER',
      description: 'The requested sprint could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const categoryName = challenge.category ? `[${challenge.category}] ` : '';
  return {
    title: `${challenge.title} • Social Sprint • AETHER`,
    description: `${categoryName}${challenge.description || 'Join this sprint on AETHER.'} Target: ${challenge.targetProofCount} proofs in ${challenge.durationDays} days.`,
    robots: { index: false, follow: false },
  };
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  const challenge = await getChallengeById(id, user.id);
  if (!challenge) {
    notFound();
  }

  return (
    <AppShell initialUser={userProfile}>
      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
        <ChallengeDetails
          challenge={challenge}
          currentUserId={user.id}
        />
      </div>
    </AppShell>
  );
}
