'use client';

import React, { useState } from 'react';
import { UserProfile, ProofRecord } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { ProfileStats } from './profile-stats';
import { ProfileProofGrid } from './profile-proof-grid';
import { followUser, unfollowUser } from '@/lib/circle';

interface PublicProfileProps {
  profile: UserProfile;
  proofs: ProofRecord[];
  viewerId: string | null;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  followingCount: number;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  profile,
  proofs,
  viewerId,
  initialIsFollowing,
  initialFollowersCount,
  followingCount,
}) => {
  const [isFollowingState, setIsFollowingState] = useState(initialIsFollowing);
  const [followersCountState, setFollowersCountState] = useState(initialFollowersCount);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayTitle = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);

  const handleFollowToggle = async () => {
    if (!viewerId) return;
    setIsPending(true);
    setError(null);

    // Optimistic Update
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
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Operation failed.';
      setError(errorMessage);
      // Rollback
      setIsFollowingState(!nextFollowingState);
      setFollowersCountState((prev) => (nextFollowingState ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* 1. Header Profile block */}
      <div className="flex flex-col items-center pt-8 text-center px-4">
        <Avatar
          src={profile.avatarUrl || undefined}
          fallback={profile.username}
          size="xl"
          className="mb-4 border-zinc-900"
        />
        <h1 className="text-xl font-medium tracking-tight text-white">
          {displayTitle}
        </h1>
        <p className="text-xs font-mono text-zinc-550 mt-1">
          @{profile.username}
        </p>

        {/* Social Graph Stats counters */}
        <div className="flex gap-4 mt-3.5 text-[11px] font-mono text-zinc-500 select-none">
          <span>
            <strong className="text-white font-normal">{followersCountState}</strong> followers
          </span>
          <span>•</span>
          <span>
            <strong className="text-white font-normal">{followingCount}</strong> following
          </span>
        </div>

        {/* Follow toggle button for viewers */}
        {viewerId && viewerId !== profile.id && (
          <button
            onClick={handleFollowToggle}
            disabled={isPending}
            className={`mt-4 px-6 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all select-none border ${
              isFollowingState
                ? 'border-zinc-800 text-zinc-400 hover:text-white bg-transparent'
                : 'bg-white text-black border-white hover:bg-zinc-200'
            }`}
          >
            {isFollowingState ? 'UNFOLLOW' : 'FOLLOW'}
          </button>
        )}

        {error && (
          <p className="text-[10px] font-mono text-red-500 mt-2">
            {error}
          </p>
        )}
        
        {profile.bio && (
          <p className="text-sm text-zinc-400 text-center max-w-sm mt-5 leading-relaxed font-light">
            {profile.bio}
          </p>
        )}
      </div>

      {/* 2. Stats Dashboard Deck */}
      <ProfileStats
        flexScore={profile.flexScore}
        streak={profile.streak}
        proofCount={proofs.length}
      />

      {/* 3. Achievements Proof List Feed */}
      <div className="px-5">
        <ProfileProofGrid proofs={proofs} />
      </div>
    </div>
  );
};
export default PublicProfile;
