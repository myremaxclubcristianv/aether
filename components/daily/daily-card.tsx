'use client';

import React, { useState } from 'react';
import { Clock, Check, ArrowRight, X, Sparkles } from 'lucide-react';
import { DailyTask } from '@/lib/daily/tasks';
import { UserProfile, ProofRecord } from '@/types';
import { createProof } from '@/lib/proof';
import { useRouter } from 'next/navigation';

interface DailyCardProps {
  task: DailyTask;
  userProfile: UserProfile;
  todayProofs: ProofRecord[];
  onProofCreated?: (newProof: ProofRecord) => void;
}

type DailyState = 'AVAILABLE' | 'IN_PROGRESS' | 'REFLECTING' | 'SKIPPED' | 'COMPLETED';

export const DailyCard: React.FC<DailyCardProps> = ({
  task,
  userProfile,
  todayProofs,
  onProofCreated,
}) => {
  const router = useRouter();
  const storageKey = `aether_daily_${userProfile.id}_${task.id}_${new Date().toISOString().slice(0, 10)}`;

  // Determine if already completed in todayProofs
  const existingCompletion = todayProofs.some(
    (p) =>
      p.caption.toLowerCase().includes(task.title.toLowerCase()) ||
      p.caption.toLowerCase().includes(`[daily: ${task.category.toLowerCase()}]`)
  );

  const [clientState, setClientState] = useState<DailyState>(() => {
    if (typeof window === 'undefined') return 'AVAILABLE';
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'IN_PROGRESS' || saved === 'REFLECTING' || saved === 'SKIPPED') {
        return saved as DailyState;
      }
    } catch {
      // Ignore localStorage access issues
    }
    return 'AVAILABLE';
  });
  const [reflection, setReflection] = useState('');
  const [skipReason, setSkipReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If completed in database, authoritative status is COMPLETED
  const state: DailyState = existingCompletion ? 'COMPLETED' : clientState;

  const handleStart = () => {
    setClientState('IN_PROGRESS');
    try {
      localStorage.setItem(storageKey, 'IN_PROGRESS');
    } catch {}
  };

  const handleReadyToReflect = () => {
    setClientState('REFLECTING');
    try {
      localStorage.setItem(storageKey, 'REFLECTING');
    } catch {}
  };

  const handleSkip = (reason?: string) => {
    setClientState('SKIPPED');
    if (reason) setSkipReason(reason);
    try {
      localStorage.setItem(storageKey, 'SKIPPED');
    } catch {}
  };

  const handleReset = () => {
    setClientState('AVAILABLE');
    setSkipReason(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      setErrorMsg('Please write a brief reflection before saving.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const fullCaption = `[DAILY: ${task.category}] ${task.title}\n\nReflection:\n${reflection.trim()}`;
      const newProof = await createProof(
        userProfile.id,
        task.proofCategory,
        fullCaption,
        null // reflection/text proof
      );

      setClientState('COMPLETED');
      try {
        localStorage.setItem(storageKey, 'COMPLETED');
      } catch {}
      if (onProofCreated) {
        onProofCreated(newProof);
      }
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to record proof.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-gradient-to-b from-zinc-950 to-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col gap-5">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
            {task.category}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            {task.timeEstimate}
          </span>
        </div>

        <span className="text-[10px] font-mono text-zinc-500">
          AETHER DAILY
        </span>
      </div>

      {/* Task Content */}
      {state === 'COMPLETED' ? (
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>DAILY ACTION COMPLETED &bull; PROOF RECORDED</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {task.title}
          </h3>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            You didn&apos;t just complete a task. You created evidence that you showed up in the real world.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              +10 Flex Score
            </span>
          </div>
        </div>
      ) : state === 'SKIPPED' ? (
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
              Skipped for today
            </span>
            <button
              onClick={handleReset}
              className="text-[10px] font-mono text-zinc-400 hover:text-white underline transition-colors"
            >
              Reopen
            </button>
          </div>
          <p className="text-sm text-zinc-300 font-light">
            No problem. Some days are for rest and focus. Zero score penalty.
          </p>
          {skipReason && (
            <span className="text-[10px] font-mono text-zinc-600">
              Reason: {skipReason}
            </span>
          )}
        </div>
      ) : state === 'REFLECTING' ? (
        <form onSubmit={handleSubmitProof} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 font-semibold">
              TODAY I REALIZED...
            </span>
            <h3 className="text-lg font-bold tracking-tight text-white">
              {task.proofPrompt}
            </h3>
          </div>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write what you noticed, learned, or what surprised you..."
            rows={4}
            className="w-full bg-zinc-900/90 border border-zinc-750 focus:border-white focus:outline-none rounded-2xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 font-sans leading-relaxed resize-none transition-all"
            autoFocus
          />

          {errorMsg && (
            <p className="text-xs text-red-400 font-mono">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setClientState('IN_PROGRESS')}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !reflection.trim()}
              className="h-10 px-6 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 transition-all font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <span>Save Proof</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* AVAILABLE or IN_PROGRESS */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {task.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              {task.action}
            </p>
          </div>

          {/* Why it matters */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850/80 flex flex-col gap-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              WHY IT MATTERS
            </span>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {task.why}
            </p>
          </div>

          {/* Action Row */}
          {state === 'IN_PROGRESS' ? (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-850">
              <span className="text-xs font-mono text-zinc-400 font-medium">
                DID YOU DO IT?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSkip('Not today')}
                  className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all"
                >
                  Not Today
                </button>
                <button
                  type="button"
                  onClick={handleReadyToReflect}
                  className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono tracking-wider font-semibold uppercase transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes — I Did</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => handleSkip('Not relevant today')}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-400 transition-colors text-left flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Skip today</span>
              </button>

              <button
                type="button"
                onClick={handleStart}
                className="h-10 px-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Do This Today</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
