import React from 'react';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  user: UserProfile;
  proofCount?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, proofCount = 0 }) => {
  // Format username nicely for display if displayName is not in schema
  const displayTitle = user.username.charAt(0).toUpperCase() + user.username.slice(1);

  return (
    <div className="flex flex-col items-center pt-8 pb-6 border-b border-zinc-950">
      {/* Avatar & Identifiers */}
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={user.avatarUrl || undefined}
          fallback={user.username}
          size="xl"
          className="mb-4 border-zinc-900"
        />
        <h1 className="text-xl font-medium tracking-tight text-white">{displayTitle}</h1>
        <p className="text-xs font-mono text-zinc-500 mt-1">@{user.username}</p>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-zinc-400 text-center max-w-sm mt-4 px-4 leading-relaxed font-light">
          {user.bio}
        </p>
      )}

      {/* Premium Stat Board */}
      <div className="grid grid-cols-3 w-full max-w-sm mt-8 border border-zinc-900 rounded-lg bg-zinc-950/20 divide-x divide-zinc-900 overflow-hidden">
        <div className="flex flex-col items-center py-3.5 px-2">
          <span className="text-lg font-light text-white tracking-tight">{user.flexScore}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Flex Score</span>
        </div>
        <div className="flex flex-col items-center py-3.5 px-2">
          <span className="text-lg font-light text-white tracking-tight">{user.streak}d</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Streak</span>
        </div>
        <div className="flex flex-col items-center py-3.5 px-2">
          <span className="text-lg font-light text-white tracking-tight">{proofCount}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Proofs</span>
        </div>
      </div>
    </div>
  );
};
