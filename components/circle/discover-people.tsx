'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Flame, Award, Users, Sparkles, Check, UserPlus } from 'lucide-react';
import { DiscoveredUser } from '@/lib/circle/discover';
import { Avatar } from '@/components/ui/avatar';
import { followUser, unfollowUser } from '@/lib/circle';

interface DiscoverPeopleProps {
  initialUsers: DiscoveredUser[];
  currentUserId: string;
}

export const DiscoverPeople: React.FC<DiscoverPeopleProps> = ({
  initialUsers,
  currentUserId,
}) => {
  const [users, setUsers] = useState<DiscoveredUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'shared' | 'mutuals'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setUsers(initialUsers);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setUsers(initialUsers);
    setIsSearching(false);
  };

  // Debounced search effect
  useEffect(() => {
    const clean = searchQuery.trim().replace(/^@+/, '');
    if (!clean) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/circle/discover?q=${encodeURIComponent(clean)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.users)) {
            setUsers(data.users);
          }
        }
      } catch (err) {
        console.error('Discover search failed:', err);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleFollowToggle = async (targetId: string, currentStatus: boolean) => {
    if (pendingIds.has(targetId)) return;

    setPendingIds((prev) => new Set(prev).add(targetId));

    // Optimistic toggle
    setUsers((prev) =>
      prev.map((u) =>
        u.profile.id === targetId ? { ...u, isFollowing: !currentStatus } : u
      )
    );

    try {
      const res = currentStatus
        ? await unfollowUser(currentUserId, targetId)
        : await followUser(currentUserId, targetId);

      if (!res.success) {
        console.warn('[AETHER DISCOVER] Follow action rejected by server:', res.error);
        // Revert optimistic toggle on server rejection
        setUsers((prev) =>
          prev.map((u) =>
            u.profile.id === targetId ? { ...u, isFollowing: currentStatus } : u
          )
        );
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      // Revert on unexpected exception
      setUsers((prev) =>
        prev.map((u) =>
          u.profile.id === targetId ? { ...u, isFollowing: currentStatus } : u
        )
      );
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'shared') return u.sharedCategories.length > 0;
    if (activeFilter === 'mutuals') return u.followedByMutuals.length > 0;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search builders by username..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              activeFilter === 'all'
                ? 'bg-zinc-800 border-zinc-700 text-white font-medium'
                : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Suggestions ({users.length})
          </button>
          <button
            onClick={() => setActiveFilter('shared')}
            className={`px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${
              activeFilter === 'shared'
                ? 'bg-zinc-800 border-zinc-700 text-white font-medium'
                : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Shared Interests</span>
          </button>
          <button
            onClick={() => setActiveFilter('mutuals')}
            className={`px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${
              activeFilter === 'mutuals'
                ? 'bg-zinc-800 border-zinc-700 text-white font-medium'
                : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Circle Connections</span>
          </button>
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
        <span>{isSearching ? 'Searching builders...' : `${filteredUsers.length} people discovered`}</span>
        <span className="text-[10px] text-zinc-600 uppercase">Ranked by mutual discipline</span>
      </div>

      {/* Discovered Users List */}
      {filteredUsers.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/60 rounded-2xl border border-zinc-850 p-6">
          <Users className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-sm font-semibold text-white">No builders found</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              {searchQuery
                ? `No builders matched "${searchQuery}". Try another username.`
                : 'Explore more categories and log proofs to unlock deeper circle recommendations.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline transition-colors"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredUsers.map((item) => {
            const { profile, isFollowing, proofCount, sharedCategories, followedByMutuals } = item;
            const isPending = pendingIds.has(profile.id);

            return (
              <div
                key={profile.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col gap-3 group shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* User Avatar & Info */}
                  <Link
                    href={`/${profile.username}`}
                    className="flex items-start gap-3 min-w-0 flex-1 hover:opacity-90 transition-opacity"
                  >
                    <Avatar
                      src={profile.avatarUrl || undefined}
                      fallback={profile.username}
                      size="lg"
                      className="border border-zinc-800 shrink-0 mt-0.5"
                    />

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight truncate group-hover:text-zinc-200">
                          @{profile.username}
                        </span>
                      </div>

                      {profile.bio && (
                        <p className="text-xs text-zinc-400 line-clamp-2 font-light leading-relaxed">
                          {profile.bio}
                        </p>
                      )}

                      {/* Stat Metrics */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Award className="w-3 h-3 text-zinc-500" />
                          <span>{proofCount} proofs</span>
                        </span>
                        <span>•</span>
                        <span>Flex: {profile.flexScore}</span>
                        {profile.streak > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-400/90 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" />
                              <span>{profile.streak}d streak</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollowToggle(profile.id, isFollowing)}
                    disabled={isPending}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all shrink-0 inline-flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-900/60'
                        : 'bg-white text-black hover:bg-zinc-200 shadow-sm'
                    } disabled:opacity-50`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Shared Interest & Mutual Tags Footer */}
                {(sharedCategories.length > 0 || followedByMutuals.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/80 text-[10px] font-mono">
                    {sharedCategories.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Shared interest: {sharedCategories.slice(0, 2).join(', ')}</span>
                      </span>
                    )}

                    {followedByMutuals.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                        <Users className="w-2.5 h-2.5 text-zinc-500" />
                        <span>Followed by @{followedByMutuals[0]}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
