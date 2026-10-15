'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Target,
  Users,
  Clock,
  Trophy,
  Plus,
  UserPlus,
  Share2,
  Award,
} from 'lucide-react';
import { ChallengeWithDetails } from '@/types';
import { Avatar } from '@/components/ui/avatar';

interface ChallengeDetailsProps {
  challenge: ChallengeWithDetails;
  currentUserId: string;
}

export const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({
  challenge: initialChallenge,
  currentUserId,
}) => {
  const [challenge, setChallenge] = useState<ChallengeWithDetails>(initialChallenge);
  const [isMutating, setIsMutating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const participation = challenge.userParticipation;
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

  const handleJoin = async () => {
    if (isMutating || isJoined) return;
    setIsMutating(true);

    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });

      if (res.ok) {
        // Refresh details
        const detailRes = await fetch(`/api/challenges/${challenge.id}`);
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data.ok && data.challenge) setChallenge(data.challenge);
        }
      }
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleLeave = async () => {
    if (isMutating || !isJoined) return;
    if (!confirm('Are you sure you want to leave this sprint?')) return;
    setIsMutating(true);

    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      });

      if (res.ok) {
        const detailRes = await fetch(`/api/challenges/${challenge.id}`);
        if (detailRes.ok) {
          const data = await detailRes.json();
          if (data.ok && data.challenge) setChallenge(data.challenge);
        }
      }
    } catch (err) {
      console.error('Failed to leave:', err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Back Button & Share */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Challenges</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
        >
          <Share2 className="w-3 h-3" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Sprint'}</span>
        </button>
      </div>

      {/* Challenge Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-850 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300">
              {challenge.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-900/60">
              {challenge.durationDays}-Day Sprint
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-900/60">
              Target: {target} Proofs
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {challenge.title}
          </h1>

          <p className="text-sm text-zinc-300 font-light leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* Creator & Sprint Dates */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-900 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            {challenge.creator && (
              <Link
                href={`/${challenge.creator.username}`}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Avatar
                  src={challenge.creator.avatarUrl || undefined}
                  fallback={challenge.creator.username}
                  size="sm"
                  className="border border-zinc-800"
                />
                <span>Created by @{challenge.creator.username}</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-600" />
              <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Sprint concluded'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-600" />
              <span>{challenge.participantsCount} participants</span>
            </span>
          </div>
        </div>

        {/* Personal Progress Module */}
        {isJoined ? (
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                  YOUR PARTICIPATION PROGRESS
                </span>
              </div>

              <span
                className={`text-xs font-mono font-bold ${
                  isCompleted ? 'text-amber-300' : 'text-emerald-400'
                }`}
              >
                {isCompleted ? 'Accomplished! 🎉' : `${proofsCount} / ${target} proofs`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isCompleted ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-zinc-500">
                {isCompleted
                  ? 'Criteria satisfied. Verified in public ledger.'
                  : `${target - proofsCount} more ${target - proofsCount === 1 ? 'proof' : 'proofs'} needed to complete.`}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href="/proof"
                  className="px-3 py-1 rounded-full bg-white text-black text-xs font-mono font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log Proof</span>
                </Link>

                <button
                  onClick={handleLeave}
                  disabled={isMutating}
                  className="px-2.5 py-1 rounded-full text-zinc-500 hover:text-red-400 text-xs font-mono transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-white font-semibold">
                READY TO JOIN THIS SPRINT?
              </span>
              <p className="text-xs text-zinc-400 font-light">
                Log {target} verified proofs during the sprint window to record completion.
              </p>
            </div>

            <button
              onClick={handleJoin}
              disabled={isMutating || daysRemaining === 0}
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold hover:bg-zinc-200 transition-all shadow-md shrink-0 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isMutating ? 'JOINING...' : 'JOIN CHALLENGE'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Participants Roster */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              PARTICIPANTS ROSTER ({challenge.participants?.length || 0})
            </h3>
          </div>
        </div>

        {(!challenge.participants || challenge.participants.length === 0) ? (
          <div className="py-8 text-center text-xs font-mono text-zinc-500">
            No participants joined yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {challenge.participants.map((p) => {
              const user = p.user;
              const completed = p.status === 'completed';

              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/${user?.username || ''}`}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
                  >
                    <Avatar
                      src={user?.avatarUrl || undefined}
                      fallback={user?.username || 'U'}
                      size="sm"
                      className="border border-zinc-850"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-white truncate">
                          @{user?.username || 'builder'}
                        </span>
                        {p.userId === currentUserId && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Flex: {user?.flexScore || 0}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {p.proofsCount} / {target}
                    </span>
                    {completed ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {p.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Challenge Proofs Feed */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              SPRINT PROOF FEED ({challenge.proofs?.length || 0})
            </h3>
          </div>
        </div>

        {(!challenge.proofs || challenge.proofs.length === 0) ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2 bg-zinc-950/40 rounded-2xl border border-zinc-900 p-6">
            <Award className="w-7 h-7 text-zinc-600 stroke-[1.5]" />
            <p className="text-xs font-mono text-zinc-400">
              No proofs logged towards this sprint yet.
            </p>
            {isJoined && (
              <Link
                href="/proof"
                className="mt-2 text-xs font-mono text-white underline hover:text-zinc-300 transition-colors"
              >
                Log the first proof
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-900 bg-zinc-950/70 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
            {challenge.proofs.map((proof) => (
              <div
                key={proof.id}
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-zinc-900/40 transition-colors"
              >
                {/* Proof Image / Icon */}
                <div className="shrink-0">
                  {proof.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                      <Image
                        src={proof.imageUrl}
                        alt={proof.caption || 'Proof'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Award className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/${proof.profile.username}`}
                      className="text-xs font-bold text-white hover:text-zinc-200 transition-colors truncate"
                    >
                      @{proof.profile.username}
                    </Link>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {new Date(proof.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed line-clamp-2">
                    {proof.caption}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {proof.category}
                    </span>
                    <span className="text-emerald-400 font-bold">+{proof.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
