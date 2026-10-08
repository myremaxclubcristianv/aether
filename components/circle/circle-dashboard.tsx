'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Users, Flame } from 'lucide-react';
import { UserProfile, ProofWithProfile, DbProfile } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { ProofCard } from '@/components/proof/proof-card';
import { followUser, unfollowUser } from '@/lib/circle';
import { createClient } from '@/lib/supabase/client';

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [feed, setFeed] = useState<ProofWithProfile[]>(initialFeed);
  const [suggestions] = useState<UserProfile[]>(initialSuggestions);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Follow State Management
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set<string>());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [hoveredFollowId, setHoveredFollowId] = useState<string | null>(null);

  // Initialize followed IDs from initial suggestions/feed if applicable
  useEffect(() => {
    async function resolveFollowedState() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: followsData } = (await (supabase.from('follows') as any)
          .select('following_id')
          .eq('follower_id', currentUserId)) as { data: { following_id: string }[] | null };

        if (followsData) {
          setFollowedIds(new Set(followsData.map((f) => f.following_id)));
        }
      } catch (err) {
        console.error('Failed to load followed states:', err);
      }
    }
    resolveFollowedState();
  }, [currentUserId, supabase]);

  // Live search effect with debounce and sanitized queries
  useEffect(() => {
    const cleanQuery = searchQuery.trim().replace(/^@+/, '');
    if (!cleanQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = (await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${cleanQuery}%`)
          .neq('id', currentUserId)
          .order('flex_score', { ascending: false })
          .limit(20)) as { data: DbProfile[] | null; error: unknown };

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

          setSearchResults(mappedResults);
        }
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, supabase]);

  const handleFollowToggle = async (targetUser: UserProfile) => {
    const targetId = targetUser.id;
    if (pendingIds.has(targetId)) return;

    setPendingIds((prev) => new Set(prev).add(targetId));
    const isCurrentlyFollowing = followedIds.has(targetId);

    // Optimistic Update
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) {
        next.delete(targetId);
      } else {
        next.add(targetId);
      }
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        const res = await unfollowUser(currentUserId, targetId);
        if (res.success) {
          setFeed((prev) => prev.filter((p) => p.userId !== targetId));
        } else {
          throw new Error(res.error || 'Failed to unfollow');
        }
      } else {
        const res = await followUser(currentUserId, targetId);
        if (res.success) {
          // Dispatch non-blocking follow telemetry
          fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'FOLLOW',
              follower: currentUserId,
              following: targetUser.username,
            }),
          }).catch(() => {});

          // Pull new items for this user to circle feed dynamically
          const { data: newProofs } = (await supabase
            .from('proofs')
            .select('*, profiles(*)')
            .eq('user_id', targetId)
            .order('created_at', { ascending: false })) as {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: any[] | null;
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
        } else {
          throw new Error(res.error || 'Failed to follow');
        }
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      // Rollback on error
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFollowing) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
        return next;
      });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {/* 1. Header */}
      <header className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">
          SOCIAL LAYER
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Circle
        </h1>
        <p className="text-xs text-zinc-400 font-light mt-0.5">
          People worth keeping up with. Actions over appearances.
        </p>
      </header>

      {/* 2. Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-3 text-zinc-500 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search people by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-zinc-700 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm font-mono placeholder:text-zinc-600 text-white outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 p-0.5 text-zinc-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Search Results Overlay List */}
      {searchQuery.trim() !== '' && (
        <section className="border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Search Results
            </h3>
            <span className="text-[10px] font-mono text-zinc-600">
              {isSearching ? 'Searching...' : `${searchResults.length} found`}
            </span>
          </div>

          {isSearching ? (
            <div className="py-6 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Searching directory...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-6 text-center text-xs font-mono text-zinc-500">
              No users found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-900/60">
              {searchResults.map((user) => {
                const isFollowed = followedIds.has(user.id);
                const isHovered = hoveredFollowId === user.id;

                return (
                  <div key={user.id} className="flex items-center justify-between py-2.5">
                    <Link
                      href={`/${user.username}`}
                      className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0"
                    >
                      <Avatar src={user.avatarUrl || undefined} fallback={user.username} size="sm" />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-xs font-medium text-white truncate">@{user.username}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                          <span>Flex: {user.flexScore}</span>
                          {user.streak > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-orange-400/90 flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5" />
                                {user.streak}d
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleFollowToggle(user)}
                      disabled={pendingIds.has(user.id)}
                      onMouseEnter={() => setHoveredFollowId(user.id)}
                      onMouseLeave={() => setHoveredFollowId(null)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-semibold transition-all select-none shrink-0 ${
                        isFollowed
                          ? isHovered
                            ? 'bg-red-950/40 border border-red-900 text-red-400'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                          : 'bg-white text-black border border-white hover:bg-zinc-200'
                      }`}
                    >
                      {isFollowed ? (isHovered ? 'UNFOLLOW' : 'FOLLOWING') : 'FOLLOW'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. Latest Proofs Circle Feed */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">
              Circle Feed
            </h2>
            <p className="text-[11px] font-light text-zinc-500">
              Latest verified proofs from people you follow.
            </p>
          </div>
        </div>

        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
            <Users className="w-8 h-8 text-zinc-600 mb-3" />
            <h3 className="text-sm font-medium text-white">Your Circle hasn&apos;t started yet.</h3>
            <p className="text-xs text-zinc-500 font-light mt-1 max-w-[240px] leading-relaxed">
              Find people whose real progress you want to follow.
            </p>
            <button
              onClick={() => {
                searchInputRef.current?.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-4 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-mono tracking-wider font-semibold transition-all select-none"
            >
              Find People
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {feed.map((proof) => (
              <ProofCard key={proof.id} proof={proof} author={proof.profile} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Suggested People */}
      {suggestions.length > 0 && (
        <section className="border-t border-zinc-900 pt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">
              Suggested People
            </h2>
            <p className="text-[11px] font-light text-zinc-500">
              Discover people logging active momentum.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-zinc-900/60 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900">
            {suggestions.map((user) => {
              const isFollowed = followedIds.has(user.id);
              const isHovered = hoveredFollowId === user.id;

              return (
                <div key={user.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/${user.username}`}
                    className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0"
                  >
                    <Avatar src={user.avatarUrl || undefined} fallback={user.username} size="sm" />
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-medium text-white truncate">@{user.username}</span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Flex Score: {user.flexScore}
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleFollowToggle(user)}
                    disabled={pendingIds.has(user.id)}
                    onMouseEnter={() => setHoveredFollowId(user.id)}
                    onMouseLeave={() => setHoveredFollowId(null)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-semibold transition-all select-none shrink-0 ${
                      isFollowed
                        ? isHovered
                          ? 'bg-red-950/40 border border-red-900 text-red-400'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                        : 'bg-white text-black border border-white hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowed ? (isHovered ? 'UNFOLLOW' : 'FOLLOWING') : 'FOLLOW'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
export default CircleDashboard;
