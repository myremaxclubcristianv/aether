'use server';

import { createClient } from '@/lib/supabase/server';
import { UserProfile, ProofWithProfile, DbProfile } from '@/types';
import { notifyFollow } from '@/lib/telegram';

/**
 * Follow another user. Checks checks are handled via DB RLS & constraints.
 */
export async function followUser(followerId: string, followingId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('follows') as any)
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    return { success: false, error: error.message };
  }

  // Non-blocking Telegram follow notification
  (async () => {
    try {
      const { data: profiles } = (await supabase
        .from('profiles')
        .select('id, username')
        .in('id', [followerId, followingId])) as { data: { id: string; username: string }[] | null };

      const follower = profiles?.find((p) => p.id === followerId)?.username || 'user';
      const following = profiles?.find((p) => p.id === followingId)?.username || 'user';
      await notifyFollow({ follower, following });
    } catch {
      // Non-critical side-effect
    }
  })();

  return { success: true, error: null };
}

/**
 * Unfollow another user.
 */
export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('follows') as any)
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

/**
 * Check if followerId follows followingId.
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('follows') as any)
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  return !!data && !error;
}

/**
 * Get all followers (users following the specified user)
 */
export async function getFollowers(userId: string): Promise<UserProfile[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: followsData, error: followsError } = (await (supabase.from('follows') as any)
    .select('follower_id')
    .eq('following_id', userId)) as { data: { follower_id: string }[] | null; error: unknown };

  if (followsError || !followsData || followsData.length === 0) return [];

  const followerIds = followsData.map((f) => f.follower_id);
  const { data: profilesData, error: profilesError } = (await supabase
    .from('profiles')
    .select('*')
    .in('id', followerIds)
    .order('flex_score', { ascending: false })) as { data: DbProfile[] | null; error: unknown };

  if (profilesError || !profilesData) return [];

  return profilesData.map((p) => ({
    id: p.id,
    username: p.username,
    avatarUrl: p.avatar_url,
    bio: p.bio,
    flexScore: p.flex_score,
    streak: p.streak,
    createdAt: p.created_at,
  }));
}

/**
 * Get users the specified user is following
 */
export async function getFollowing(userId: string): Promise<UserProfile[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: followsData, error: followsError } = (await (supabase.from('follows') as any)
    .select('following_id')
    .eq('follower_id', userId)) as { data: { following_id: string }[] | null; error: unknown };

  if (followsError || !followsData || followsData.length === 0) return [];

  const followingIds = followsData.map((f) => f.following_id);
  const { data: profilesData, error: profilesError } = (await supabase
    .from('profiles')
    .select('*')
    .in('id', followingIds)
    .order('flex_score', { ascending: false })) as { data: DbProfile[] | null; error: unknown };

  if (profilesError || !profilesData) return [];

  return profilesData.map((p) => ({
    id: p.id,
    username: p.username,
    avatarUrl: p.avatar_url,
    bio: p.bio,
    flexScore: p.flex_score,
    streak: p.streak,
    createdAt: p.created_at,
  }));
}

/**
 * Get proofs created by users followed by the specified user
 */
export async function getCircleFeed(userId: string, limit = 50): Promise<ProofWithProfile[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: followsData, error: followsError } = (await (supabase.from('follows') as any)
    .select('following_id')
    .eq('follower_id', userId)) as { data: { following_id: string }[] | null; error: unknown };

  if (followsError || !followsData || followsData.length === 0) return [];

  const followingIds = followsData.map((f) => f.following_id);

  const { data: proofsData, error: proofsError } = (await supabase
    .from('proofs')
    .select('*, profiles(*)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .limit(limit)) as { data: any[] | null; error: unknown };

  if (proofsError || !proofsData) return [];

  return proofsData
    .filter((p) => p.profiles)
    .map((p) => ({
      id: p.id,
      userId: p.user_id,
      imageUrl: p.image_url,
      category: p.category,
      caption: p.caption,
      points: p.points,
      createdAt: p.created_at,
      profile: {
        id: p.profiles.id,
        username: p.profiles.username,
        avatarUrl: p.profiles.avatar_url,
        bio: p.profiles.bio,
        flexScore: p.profiles.flex_score,
        streak: p.profiles.streak,
        createdAt: p.profiles.created_at,
      },
    }));
}

/**
 * Suggest users to follow (excluding current user and already followed users).
 */
export async function getSuggestedUsers(userId: string): Promise<UserProfile[]> {
  const supabase = await createClient();
  
  // Get currently followed IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: followsData } = (await (supabase.from('follows') as any)
    .select('following_id')
    .eq('follower_id', userId)) as { data: { following_id: string }[] | null; error: unknown };

  const followedIds = (followsData || []).map((f) => f.following_id);

  const query = supabase
    .from('profiles')
    .select('*')
    .neq('id', userId);

  if (followedIds.length > 0) {
    query.not('id', 'in', `(${followedIds.join(',')})`);
  }

  const { data: profilesData, error } = (await query
    .order('flex_score', { ascending: false })
    .limit(10)) as { data: DbProfile[] | null; error: unknown };

  if (error || !profilesData) return [];

  return profilesData.map((p) => ({
    id: p.id,
    username: p.username,
    avatarUrl: p.avatar_url,
    bio: p.bio,
    flexScore: p.flex_score,
    streak: p.streak,
    createdAt: p.created_at,
  }));
}
