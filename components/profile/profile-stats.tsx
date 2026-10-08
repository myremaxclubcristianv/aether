import React from 'react';

interface ProfileStatsProps {
  flexScore: number;
  streak: number;
  proofCount: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  flexScore,
  streak,
  proofCount,
}) => {
  return (
    <div className="flex flex-col items-center py-6 text-center border-b border-zinc-950">
      {/* Large visual Flex Score */}
      <div className="flex flex-col items-center">
        <span className="text-6xl font-extralight text-white tracking-tighter select-none">
          {flexScore}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-550 mt-2 select-none">
          Flex Score
        </span>
      </div>

      {/* Streak and Proof counts */}
      <div className="flex gap-8 mt-6 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-white">🔥</span>
          <span>{streak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white">●</span>
          <span>{proofCount} proofs</span>
        </div>
      </div>
    </div>
  );
};
