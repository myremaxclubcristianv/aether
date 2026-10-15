'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, Users, Clock, ArrowRight, UserPlus } from 'lucide-react';
import { ChallengeWithDetails } from '@/types';
import { Avatar } from '@/components/ui/avatar';

interface ChallengeCardProps {
  challenge: ChallengeWithDetails;
  currentUserId?: string;
  onJoinSuccess?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  currentUserId,
  onJoinSuccess,
}) => {
  const [isJoining, setIsJoining] = useState(false);
  const [participation, setParticipation] = useState(challenge.userParticipation);

  const isJoined = participation?.status === 'joined' || participation?.status === 'completed';
  const isCompleted = participation?.status === 'completed' || challenge.status === 'completed';

  const [daysRemaining] = useState(() => {
    const now = Date.now();
    const endsAt = new Date(challenge.endsAt).getTime();
    return Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)));
  });

  const proofsCount = participation?.proofsCount || 0;
  const target = challenge.targetProofCount || 7;
  const progressPercent = Math.min(100, Math.round((proofsCount / target) * 100));

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isJoining || isJoined) return;

    setIsJoining(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });

      if (res.ok) {
        setParticipation({
          id: 'temp',
          challengeId: challenge.id,
          userId: currentUserId || '',
          status: 'joined',
          proofsCount: 0,
          joinedAt: new Date().toISOString(),
          completedAt: null,
        });
        if (onJoinSuccess) onJoinSuccess();
      }
    } catch (err) {
      console.error('Failed to join challenge:', err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 transition-all flex flex-col justify-between gap-4 group shadow-xl hover:shadow-2xl"
    >
      {/* Top Header */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300">
              {challenge.category}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900/60">
              {challenge.durationDays}d sprint
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span>
              {daysRemaining > 0 ? `${daysRemaining}d left` : 'Sprint closed'}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors tracking-tight line-clamp-1">
            {challenge.title}
          </h3>
          <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>
        </div>
      </div>

      {/* Progress & Target Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 text-[11px] flex items-center gap-1">
            <Target className="w-3 h-3 text-zinc-500" />
            <span>Target: {target} verified proofs</span>
          </span>

          {isJoined && (
            <span
              className={`font-semibold text-[11px] ${
                isCompleted ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {isCompleted ? 'Accomplished!' : `${proofsCount} / ${target}`}
            </span>
          )}
        </div>

        {/* Progress Bar (if user joined) */}
        {isJoined && (
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Footer: Creator, Participants & Action Button */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-900/80">
        <div className="flex items-center gap-2 min-w-0">
          {challenge.creator && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar
                src={challenge.creator.avatarUrl || undefined}
                fallback={challenge.creator.username}
                size="sm"
                className="border border-zinc-800"
              />
              <span className="text-[11px] font-mono text-zinc-400 truncate">
                by @{challenge.creator.username}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 shrink-0 ml-1">
            <Users className="w-3 h-3 text-zinc-600" />
            <span>{challenge.participantsCount}</span>
          </div>
        </div>

        {/* Join or View Action */}
        {!isJoined ? (
          <button
            onClick={handleJoin}
            disabled={isJoining || daysRemaining === 0}
            className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-mono font-medium hover:bg-zinc-200 transition-all shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <UserPlus className="w-3 h-3" />
            <span>{isJoining ? 'Joining...' : 'Join Sprint'}</span>
          </button>
        ) : (
          <div className="text-xs font-mono text-zinc-400 group-hover:text-white transition-colors inline-flex items-center gap-1 shrink-0">
            <span>View Progress</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </Link>
  );
};
