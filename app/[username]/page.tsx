import { createClient } from '@/lib/supabase/server';
import { PublicProfile } from '@/components/profile/public-profile';
import { UserProfile, ProofRecord, DbProfile, DbProof } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const RESERVED_USERNAMES = new Set([
  'founder',
  'api',
  'admin',
  'circle',
  'home',
  'proof',
  'login',
  'onboarding',
  'profile',
]);

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let username = decodeURIComponent(resolvedParams?.username || '').trim();
  if (username.startsWith('@')) {
    username = username.slice(1);
  }
  username = username.trim();

  if (!username || RESERVED_USERNAMES.has(username.toLowerCase())) {
    return {
      title: 'Profile • Aether',
      description: 'Track real achievements and verified proofs on Aether.',
    };
  }

  const supabase = await createClient();
  const { data: profile } = (await supabase
    .from('profiles')
    .select('username, bio, flex_score, streak')
    .ilike('username', username)
    .maybeSingle()) as { data: DbProfile | null };

  const flexScore = profile?.flex_score ?? 0;
  const streak = profile?.streak ?? 0;
  const description = profile?.bio 
    ? `${profile.bio} • ${flexScore} Flex Score • ${streak > 0 ? `${streak}d streak • ` : ''}Aether`
    : `@${username} has earned ${flexScore} Flex Score on Aether. Track real achievements and verified proofs.`;

  return {
    title: `@${username} (${flexScore} Flex Score) • Aether`,
    description,
    openGraph: {
      title: `@${username} • Aether`,
      description,
      type: 'profile',
      url: `https://aether-sable-delta.vercel.app/${username}`,
    },
    twitter: {
      card: 'summary',
      title: `@${username} • Aether`,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  let username = decodeURIComponent(resolvedParams?.username || '').trim();
  if (username.startsWith('@')) {
    username = username.slice(1);
  }
  username = username.trim();

  if (!username || RESERVED_USERNAMES.has(username.toLowerCase())) {
    notFound();
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
  let viewerId: string | null = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    viewerId = authUser?.id || null;
  } catch (err) {
    console.error('Error resolving viewer user:', err);
  }

  // Resolve if viewer follows this profile
  let initialIsFollowing = false;
  if (viewerId && viewerId !== profileData.id) {
    try {
      const { data: followRecord } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', viewerId)
        .eq('following_id', profileData.id)
        .maybeSingle();
      initialIsFollowing = !!followRecord;
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  }

  // Fetch follower/following counts safely
  let followersCount = 0;
  let followingCount = 0;
  try {
    const [{ count: fCount }, { count: flwCount }] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', profileData.id)
        .limit(0),
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', profileData.id)
        .limit(0),
    ]);
    followersCount = fCount ?? 0;
    followingCount = flwCount ?? 0;
  } catch (err) {
    console.error('Error querying follower counts:', err);
  }

  const profile: UserProfile = {
    id: profileData.id,
    username: profileData.username,
    avatarUrl: profileData.avatar_url || null,
    bio: profileData.bio || null,
    flexScore: profileData.flex_score ?? 0,
    streak: profileData.streak ?? 0,
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

  // Resolve viewer profile if authenticated
  let viewerProfile: UserProfile | null = null;
  if (viewerId) {
    if (viewerId === profileData.id) {
      viewerProfile = profile;
    } else {
      try {
        const { data: vData } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewerId)
          .maybeSingle()) as { data: DbProfile | null };
        if (vData) {
          viewerProfile = {
            id: vData.id,
            username: vData.username,
            avatarUrl: vData.avatar_url || null,
            bio: vData.bio || null,
            flexScore: vData.flex_score ?? 0,
            streak: vData.streak ?? 0,
            createdAt: vData.created_at,
          };
        }
      } catch (err) {
        console.error('Error fetching viewer profile:', err);
      }
    }
  }

  return (
    <PublicProfile
      profile={profile}
      proofs={proofs}
      viewerId={viewerId}
      viewerProfile={viewerProfile}
      initialIsFollowing={initialIsFollowing}
      initialFollowersCount={followersCount}
      followingCount={followingCount}
    />
  );
}
