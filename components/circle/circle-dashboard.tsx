'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, ProofWithProfile, DbProfile } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { ProofCard } from '@/components/proof/proof-card';
import { followUser, unfollowUser } from '@/lib/circle';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CircleDashboardProps {
  initialFeed: ProofWithProfile[];
  initialSuggestions: UserProfile[];
  currentUserId: string;
}

export const CircleDashboard: React.FC<CircleDashboardProps> = ({
  initialFeed,
  initialSuggestions,
  currentUserId,
}) => {
  const supabase = createClient();
  const [feed, setFeed] = useState<ProofWithProfile[]>(initialFeed);
  const [suggestions] = useState<UserProfile[]>(initialSuggestions);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Interaction State
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => {
    // Current suggestions are by definition unfollowed, but we will track any follows in this view
    return new Set<string>();
  });
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = (await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${searchQuery.trim()}%`)
          .neq('id', currentUserId)
          .limit(5)) as { data: DbProfile[] | null; error: unknown };

        if (!error && data) {
          const mappedResults: UserProfile[] = data.map((p) => ({
            id: p.id,
            username: p.username,
            avatarUrl: p.avatar_url,
            bio: p.bio,
            flexScore: p.flex_score,
            streak: p.streak,
            createdAt: p.created_at,
          }));
          
          const { data: followsData } = (await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId)
            .in('following_id', mappedResults.map((r) => r.id))) as { data: { following_id: string }[] | null; error: unknown };

          const curFollowed = new Set((followsData || []).map((f) => f.following_id));
          
          // Update followed IDs set
          setFollowedIds((prev) => {
            const next = new Set(prev);
            curFollowed.forEach((id) => next.add(id));
            return next;
          });

          setSearchResults(mappedResults);
        }
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, supabase]);

  const handleFollowSuggestion = async (targetId: string) => {
    if (pendingIds.has(targetId)) return;
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    const isFollowing = followedIds.has(targetId);

    try {
      if (isFollowing) {
        const res = await unfollowUser(currentUserId, targetId);
        if (res.success) {
          setFollowedIds((prev) => {
            const next = new Set(prev);
            next.delete(targetId);
            return next;
          });
          // Remove from feed locally if unfollowed
          setFeed((prev) => prev.filter((p) => p.userId !== targetId));
        }
      } else {
        const res = await followUser(currentUserId, targetId);
        if (res.success) {
          setFollowedIds((prev) => {
            const next = new Set(prev);
            next.add(targetId);
            return next;
          });
          // Pull new items for this user to feed dynamically
          const { data: newProofs } = (await supabase
            .from('proofs')
            .select('*, profiles(*)')
            .eq('user_id', targetId)
            .order('created_at', { ascending: false })) as {
              data: {
                id: string;
                user_id: string;
                image_url: string | null;
                category: string;
                caption: string;
                points: number;
                created_at: string;
                profiles: {
                  id: string;
                  username: string;
                  avatar_url: string | null;
                  bio: string | null;
                  flex_score: number;
                  streak: number;
                  created_at: string;
                };
              }[] | null;
              error: unknown;
            };

          if (newProofs) {
            const mappedNew: ProofWithProfile[] = newProofs.map((p) => ({
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
            setFeed((prev) => {
              const combined = [...mappedNew, ...prev];
              return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
          }
        }
      }
    } catch (err) {
      console.error('Follow request error:', err);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl font-medium tracking-tight text-white select-none">
          Circle
        </h1>
        <p className="text-xs font-mono text-zinc-550 mt-1 select-none">
          People you follow.
        </p>
      </div>

      {/* 2. Live Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950/40 border border-zinc-900 focus:border-zinc-800 rounded-full px-5 py-2 text-xs font-mono placeholder:text-zinc-600 text-white outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-2 text-[10px] font-mono text-zinc-500 hover:text-white"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* 3. Search Results Overlay List */}
      {searchQuery.trim() !== '' && (
        <div className="border border-zinc-900 bg-zinc-950/90 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-550 mb-1 select-none">
            Search Results
          </h3>
          {isSearching ? (
            <div className="py-4 text-center">
              <span className="text-[10px] font-mono text-zinc-550">searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-4 text-center">
              <span className="text-[10px] font-mono text-zinc-550">no users found</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {searchResults.map((user) => {
                const isFollowed = followedIds.has(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between py-1">
                    <Link href={`/@${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Avatar src={user.avatarUrl || undefined} fallback={user.username} size="sm" />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium text-white">@{user.username}</span>
                        <span className="text-[10px] font-mono text-zinc-500">Flex: {user.flexScore}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollowSuggestion(user.id)}
                      disabled={pendingIds.has(user.id)}
                      className={`px-3 py-1 rounded-full text-[9px] font-mono tracking-wider border select-none transition-all ${
                        isFollowed
                          ? 'border-zinc-800 text-zinc-400 hover:text-white bg-transparent'
                          : 'bg-white text-black border-white hover:bg-zinc-200'
                      }`}
                    >
                      {isFollowed ? 'UNFOLLOW' : 'FOLLOW'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Latest proofs circle feed */}
      <div>
        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4 select-none">
          Latest Proofs
        </h2>

        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-905 rounded-2xl px-6">
            <span className="text-xl mb-3 select-none">🕳️</span>
            <p className="text-xs font-mono text-zinc-400 max-w-[240px] leading-relaxed">
              Your Circle is empty. Follow people whose achievements inspire you.
            </p>
            <button
              onClick={() => {
                // Focus on search or scroll to suggestions
                const element = document.getElementById('suggestions-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mt-5 px-5 py-1.5 rounded-full text-[10px] font-mono tracking-wider bg-white text-black border border-white hover:bg-zinc-200 transition-all select-none"
            >
              DISCOVER PEOPLE
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {feed.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))}
          </div>
        )}
      </div>

      {/* 5. Suggested People */}
      <div id="suggestions-section" className="border-t border-zinc-950 pt-6">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4 select-none">
          Suggested People
        </h2>

        {suggestions.length === 0 ? (
          <p className="text-[10px] font-mono text-zinc-550 py-2 select-none">
            No suggestions available.
          </p>
        ) : (
          <div className="flex flex-col gap-4 bg-zinc-950/20 border border-zinc-900/60 rounded-2xl p-4">
            {suggestions.map((user) => {
              const isFollowed = followedIds.has(user.id);
              return (
                <div key={user.id} className="flex items-center justify-between py-1">
                  <Link href={`/@${user.username}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                    <Avatar src={user.avatarUrl || undefined} fallback={user.username} size="sm" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-medium text-white">@{user.username}</span>
                      <span className="text-[10px] font-mono text-zinc-500">Flex Score: {user.flexScore}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollowSuggestion(user.id)}
                    disabled={pendingIds.has(user.id)}
                    className={`px-3 py-1 rounded-full text-[9px] font-mono tracking-wider border select-none transition-all ${
                      isFollowed
                        ? 'border-zinc-800 text-zinc-400 hover:text-white bg-transparent'
                        : 'bg-white text-black border-white hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowed ? 'UNFOLLOW' : 'FOLLOW'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default CircleDashboard;
