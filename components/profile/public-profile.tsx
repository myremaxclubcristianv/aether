'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Trophy, ArrowLeft } from 'lucide-react';
import { UserProfile, ProofRecord } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { ProofCard } from '@/components/proof/proof-card';
import { followUser, unfollowUser } from '@/lib/circle';
import { AppShell } from '@/components/layout/app-shell';

const CATEGORIES = ['All', 'Fitness', 'Learning', 'Creating', 'Building', 'Lifestyle', 'Achievement'];

interface PublicProfileProps {
  profile: UserProfile;
  proofs: ProofRecord[];
  viewerId: string | null;
  viewerProfile?: UserProfile | null;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  followingCount: number;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  profile,
  proofs,
  viewerId,
  viewerProfile,
  initialIsFollowing,
  initialFollowersCount,
  followingCount,
}) => {
  const [isFollowingState, setIsFollowingState] = useState(initialIsFollowing);
  const [followersCountState, setFollowersCountState] = useState(initialFollowersCount);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  const isOwnProfile = viewerId === profile.id;

  const handleFollowToggle = async () => {
    if (!viewerId) return;
    setIsPending(true);
    setError(null);

    // Optimistic update
    const nextFollowingState = !isFollowingState;
    setIsFollowingState(nextFollowingState);
    setFollowersCountState((prev) => (nextFollowingState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextFollowingState) {
        const res = await followUser(viewerId, profile.id);
        if (!res.success) {
          throw new Error(res.error || 'Failed to follow user.');
        }
      } else {
        const res = await unfollowUser(viewerId, profile.id);
        if (!res.success) {
          throw new Error(res.error || 'Failed to unfollow user.');
        }
      }
    } catch (err: unknown) {
      console.error('Follow toggle error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Operation failed.';
      setError(errorMessage);
      // Rollback
      setIsFollowingState(!nextFollowingState);
      setFollowersCountState((prev) => (nextFollowingState ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setIsPending(false);
    }
  };

  const filteredProofs = proofs.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const nextMilestone = Math.max(1000, Math.ceil((profile.flexScore + 1) / 1000) * 1000);
  const progressPercent = Math.min(100, Math.round((profile.flexScore / nextMilestone) * 100));

  return (
    <AppShell initialUser={viewerProfile || (isOwnProfile ? profile : null)}>
      <div className="flex flex-col gap-7 px-4 sm:px-6 py-6 sm:py-8">
        {/* Top Back Nav if viewing someone else */}
        {!isOwnProfile && (
          <Link
            href="/circle"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-white transition-colors w-fit -mt-2 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO CIRCLE</span>
          </Link>
        )}

        {/* =========================================================================
            1. PROFILE HERO HEADER
           ========================================================================= */}
        <header className="flex flex-col items-center text-center gap-3">
          <Avatar
            src={profile.avatarUrl || undefined}
            fallback={profile.username || 'U'}
            size="xl"
            className="border-2 border-zinc-800 shadow-xl"
          />

          <div className="flex flex-col items-center mt-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              @{profile.username}
            </h1>
            {profile.bio && (
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-2 max-w-sm leading-relaxed px-4">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Social Count Badges */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mt-1">
            <span>
              <strong className="text-white font-medium">{followersCountState}</strong> followers
            </span>
            <span>•</span>
            <span>
              <strong className="text-white font-medium">{followingCount}</strong> following
            </span>
          </div>

          {/* Action Button: Edit Profile or Follow/Unfollow */}
          <div className="mt-2">
            {isOwnProfile ? (
              <Link
                href="/onboarding"
                className="px-5 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition-colors inline-block"
              >
                EDIT PROFILE
              </Link>
            ) : viewerId ? (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={isPending}
                onMouseEnter={() => setIsHoveringFollow(true)}
                onMouseLeave={() => setIsHoveringFollow(false)}
                className={`px-6 py-2 rounded-full text-xs font-mono tracking-wider font-semibold transition-all select-none ${
                  isFollowingState
                    ? isHoveringFollow
                      ? 'bg-red-950/40 border border-red-900 text-red-400'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                    : 'bg-white text-black border border-white hover:bg-zinc-200'
                }`}
              >
                {isFollowingState ? (isHoveringFollow ? 'UNFOLLOW' : 'FOLLOWING') : 'FOLLOW'}
              </button>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold"
              >
                LOG IN TO FOLLOW
              </Link>
            )}
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400 mt-2">{error}</p>
          )}
        </header>

        {/* =========================================================================
            2. REFINED SCORE & MOMENTUM MODULE
           ========================================================================= */}
        <section className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
                FLEX SCORE
              </span>
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white mt-0.5">
                {profile.flexScore}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
                <span>{profile.streak > 0 ? `${profile.streak} DAY STREAK` : '0 STREAK'}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {proofs.length} total proofs
              </span>
            </div>
          </div>

          {/* Progress to next 1000 goal */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Goal: {nextMilestone} Flex Points</span>
              <span>{progressPercent}% Achieved</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. PROOF HISTORY & CATEGORY FILTERING
           ========================================================================= */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">
                Proof History
              </h2>
              <p className="text-[11px] font-light text-zinc-500">
                Chronological timeline of verified actions.
              </p>
            </div>

            {/* Category Filter Pills */}
            {proofs.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProofs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
              <Trophy className="w-6 h-6 text-zinc-600 mb-2" />
              <h4 className="text-xs font-medium text-zinc-300">No proofs found.</h4>
              <p className="text-[11px] text-zinc-500 font-light mt-1">
                {selectedCategory !== 'All' ? `No proofs logged under ${selectedCategory}.` : 'This user hasn’t recorded any proofs yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {filteredProofs.map((proof) => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};
export default PublicProfile;
