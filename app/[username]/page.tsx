import { createClient } from '@/lib/supabase/server';
import { PublicProfile } from '@/components/profile/public-profile';
import { Navigation } from '@/components/navigation';
import { UserProfile, ProofRecord, DbProfile, DbProof } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let username = decodeURIComponent(resolvedParams.username);
  if (username.startsWith('@')) {
    username = username.slice(1);
  }

  return {
    title: `@${username} | Aether`,
    description: `View achievements, proofs and Flex Score on Aether.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  let username = decodeURIComponent(resolvedParams.username);
  if (username.startsWith('@')) {
    username = username.slice(1);
  }

  const supabase = await createClient();

  // Query user profile by username match (case-insensitive)
  const { data: profileData, error: profileError } = (await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()) as { data: DbProfile | null; error: unknown };

  if (profileError || !profileData) {
    notFound();
  }

  // Query public proofs logged by this profile
  const { data: proofsData } = (await supabase
    .from('proofs')
    .select('*')
    .eq('user_id', profileData.id)
    .order('created_at', { ascending: false })) as { data: DbProof[] | null; error: unknown };

  // Resolve authenticated viewer ID
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const viewerId = authUser?.id || null;

  // Resolve if viewer follows this profile
  let initialIsFollowing = false;
  if (viewerId && viewerId !== profileData.id) {
    const { data: followRecord } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', viewerId)
      .eq('following_id', profileData.id)
      .maybeSingle();
    initialIsFollowing = !!followRecord;
  }

  // Fetch follower/following counts via exact head queries
  const { count: followersCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', profileData.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', profileData.id);

  const profile: UserProfile = {
    id: profileData.id,
    username: profileData.username,
    avatarUrl: profileData.avatar_url,
    bio: profileData.bio,
    flexScore: profileData.flex_score,
    streak: profileData.streak,
    createdAt: profileData.created_at,
  };

  const proofs: ProofRecord[] = (proofsData || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    imageUrl: p.image_url,
    category: p.category,
    caption: p.caption,
    points: p.points,
    createdAt: p.created_at,
  }));

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black pb-28">
      {/* Dynamic Profile view */}
      <PublicProfile
        profile={profile}
        proofs={proofs}
        viewerId={viewerId}
        initialIsFollowing={initialIsFollowing}
        initialFollowersCount={followersCount || 0}
        followingCount={followingCount || 0}
      />
      
      {/* Floating Bottom Navigation */}
      <Navigation />
    </div>
  );
}
