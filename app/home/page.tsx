import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserProfile, ProofRecord, DbProfile, DbProof } from '@/types';
import { HomeDashboard } from '@/components/home/home-dashboard';
import { AppShell } from '@/components/layout/app-shell';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home • Aether',
  description: 'Your progress and circle activity on Aether.',
};

export default async function HomePage() {
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

  if (!rawProfile || !rawProfile.username) {
    redirect('/onboarding');
  }

  const userProfile: UserProfile = {
    id: rawProfile.id,
    username: rawProfile.username,
    avatarUrl: rawProfile.avatar_url || null,
    bio: rawProfile.bio || null,
    flexScore: rawProfile.flex_score ?? 0,
    streak: rawProfile.streak ?? 0,
    createdAt: rawProfile.created_at,
  };

  // Fetch User's Proofs
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

  // Fetch Circle Preview (Followed users & their latest proofs)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: followsData } = (await (supabase.from('follows') as any)
    .select('following_id')
    .eq('follower_id', user.id)) as { data: { following_id: string }[] | null };

  const followingIds = (followsData || []).map((f) => f.following_id);

  let followedUsers: UserProfile[] = [];
  let circleProofs: { proof: ProofRecord; author: UserProfile }[] = [];

  if (followingIds.length > 0) {
    const { data: circleProfiles } = (await supabase
      .from('profiles')
      .select('*')
      .in('id', followingIds)
      .order('flex_score', { ascending: false })
      .limit(4)) as { data: DbProfile[] | null };

    if (circleProfiles) {
      followedUsers = circleProfiles.map((p) => ({
        id: p.id,
        username: p.username,
        avatarUrl: p.avatar_url || null,
        bio: p.bio || null,
        flexScore: p.flex_score ?? 0,
        streak: p.streak ?? 0,
        createdAt: p.created_at,
      }));
    }

    const { data: latestProofs } = (await supabase
      .from('proofs')
      .select('*')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(3)) as { data: DbProof[] | null };

    if (latestProofs && latestProofs.length > 0) {
      const authorIds = [...new Set(latestProofs.map((p) => p.user_id))];
      const { data: authorProfiles } = (await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds)) as { data: DbProfile[] | null };

      const profMap = new Map((authorProfiles || []).map((pr) => [pr.id, pr]));

      circleProofs = latestProofs.map((p) => {
        const author = profMap.get(p.user_id);
        return {
          proof: {
            id: p.id,
            userId: p.user_id,
            imageUrl: p.image_url,
            category: p.category,
            caption: p.caption,
            points: p.points,
            createdAt: p.created_at,
          },
          author: {
            id: author?.id || p.user_id,
            username: author?.username || 'user',
            avatarUrl: author?.avatar_url || null,
            bio: author?.bio || null,
            flexScore: author?.flex_score ?? 0,
            streak: author?.streak ?? 0,
            createdAt: author?.created_at || p.created_at,
          },
        };
      });
    }
  }

  return (
    <AppShell initialUser={userProfile}>
      <HomeDashboard
        userProfile={userProfile}
        initialProofs={proofs}
        followedUsers={followedUsers}
        circleProofs={circleProofs}
      />
    </AppShell>
  );
}
