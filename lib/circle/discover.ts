import { createClient } from '@/lib/supabase/server';
import { UserProfile, DbProfile } from '@/types';

export interface DiscoveredUser {
  profile: UserProfile;
  isFollowing: boolean;
  proofCount: number;
  sharedCategories: string[];
  followedByMutuals: string[];
}

/**
 * Deterministically computes discover recommendations based on real Supabase data:
 * 1. Overlapping interests / categories from actual proofs.
 * 2. Followed by connections in the user's circle.
 * 3. Fallback to active eligible real users.
 */
export async function getDiscoveredUsers(
  currentUserId: string,
  searchQuery?: string,
  limit = 30
): Promise<DiscoveredUser[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch current user's categories from their proofs
    const { data: myProofs } = (await supabase
      .from('proofs')
      .select('category')
      .eq('user_id', currentUserId)) as { data: { category: string }[] | null };

    const myCategories = new Set(
      (myProofs || [])
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c) && c !== 'General')
    );

    // 2. Fetch users current user is following
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: myFollows } = (await (supabase.from('follows') as any)
      .select('following_id')
      .eq('follower_id', currentUserId)) as { data: { following_id: string }[] | null };

    const followingIdSet = new Set((myFollows || []).map((f) => f.following_id));
    const followingIds = Array.from(followingIdSet);

    // 3. Find mutual connections: who do my connections follow?
    const mutualsMap = new Map<string, Set<string>>(); // targetUserId -> Set of mutual follower IDs
    if (followingIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: secondDegreeFollows } = (await (supabase.from('follows') as any)
        .select('follower_id, following_id')
        .in('follower_id', followingIds.slice(0, 50))) as {
        data: { follower_id: string; following_id: string }[] | null;
      };

      (secondDegreeFollows || []).forEach((f) => {
        if (f.following_id !== currentUserId) {
          const set = mutualsMap.get(f.following_id) || new Set<string>();
          set.add(f.follower_id);
          mutualsMap.set(f.following_id, set);
        }
      });
    }

    // 4. Query candidate profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId);

    const cleanSearch = (searchQuery || '')
      .trim()
      .replace(/^@+/, '')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 50);

    if (cleanSearch) {
      profilesQuery = profilesQuery.ilike('username', `%${cleanSearch}%`);
    }

    const { data: candidateProfiles, error: profileError } = (await profilesQuery
      .order('flex_score', { ascending: false })
      .limit(Math.min(limit, 50))) as { data: DbProfile[] | null; error: unknown };

    if (profileError || !candidateProfiles || candidateProfiles.length === 0) {
      return [];
    }

    const candidateIds = candidateProfiles.map((p) => p.id);

    // 5. Fetch public proof count and categories for all candidate users
    const { data: candidateProofs } = (await supabase
      .from('proofs')
      .select('user_id, category')
      .in('user_id', candidateIds)) as { data: { user_id: string; category: string }[] | null };

    const proofCountMap = new Map<string, number>();
    const proofCategoriesMap = new Map<string, Set<string>>();

    (candidateProofs || []).forEach((p) => {
      proofCountMap.set(p.user_id, (proofCountMap.get(p.user_id) || 0) + 1);

      if (p.category && p.category !== 'General') {
        const catSet = proofCategoriesMap.get(p.user_id) || new Set<string>();
        catSet.add(p.category.trim());
        proofCategoriesMap.set(p.user_id, catSet);
      }
    });

    // 6. Resolve mutual follower usernames
    const allMutualFollowerIds = new Set<string>();
    mutualsMap.forEach((followerIdsSet) => {
      followerIdsSet.forEach((fid) => allMutualFollowerIds.add(fid));
    });

    let mutualUsernamesMap = new Map<string, string>();
    if (allMutualFollowerIds.size > 0) {
      const { data: mutualProfiles } = (await supabase
        .from('profiles')
        .select('id, username')
        .in('id', Array.from(allMutualFollowerIds).slice(0, 50))) as {
        data: { id: string; username: string }[] | null;
      };

      if (mutualProfiles) {
        mutualUsernamesMap = new Map(mutualProfiles.map((m) => [m.id, m.username]));
      }
    }

    // 7. Assemble discovered users and rank according to requirements
    const discoveredList: DiscoveredUser[] = candidateProfiles.map((p) => {
      const candCategories = proofCategoriesMap.get(p.id) || new Set<string>();
      const sharedCategories = Array.from(candCategories).filter((c) => myCategories.has(c));

      const mutualFollowerIds = mutualsMap.get(p.id);
      const followedByMutuals = mutualFollowerIds
        ? Array.from(mutualFollowerIds)
            .map((fid) => mutualUsernamesMap.get(fid))
            .filter((u): u is string => Boolean(u))
            .slice(0, 3)
        : [];

      return {
        profile: {
          id: p.id,
          username: p.username,
          avatarUrl: p.avatar_url,
          bio: p.bio,
          flexScore: p.flex_score || 0,
          streak: p.streak || 0,
          createdAt: p.created_at,
        },
        isFollowing: followingIdSet.has(p.id),
        proofCount: proofCountMap.get(p.id) || 0,
        sharedCategories,
        followedByMutuals,
      };
    });

    // Rank:
    // 1. Not already followed first
    // 2. Overlapping categories count desc
    // 3. Followed by mutuals count desc
    // 4. Flex score desc
    if (!cleanSearch) {
      discoveredList.sort((a, b) => {
        if (a.isFollowing !== b.isFollowing) {
          return a.isFollowing ? 1 : -1;
        }
        if (a.sharedCategories.length !== b.sharedCategories.length) {
          return b.sharedCategories.length - a.sharedCategories.length;
        }
        if (a.followedByMutuals.length !== b.followedByMutuals.length) {
          return b.followedByMutuals.length - a.followedByMutuals.length;
        }
        return b.profile.flexScore - a.profile.flexScore;
      });
    }

    return discoveredList;
  } catch (err) {
    console.error('[AETHER DISCOVER] Failed to compute discovered users:', err);
    return [];
  }
}
