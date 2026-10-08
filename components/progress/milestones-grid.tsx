'use client';

import React from 'react';
import { Check, Lock } from 'lucide-react';
import { MilestoneItem } from '@/lib/progress';

interface MilestonesGridProps {
  milestones: MilestoneItem[];
}

export const MilestonesGrid: React.FC<MilestonesGridProps> = ({ milestones }) => {
  const earnedCount = milestones.filter((m) => m.isEarned).length;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
            ACHIEVEMENT LAYER
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">
            MILESTONES
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {earnedCount} OF {milestones.length} UNLOCKED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {milestones.map((m) => {
          return (
            <div
              key={m.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                m.isEarned
                  ? 'bg-zinc-900/90 border-zinc-700 shadow-md'
                  : 'bg-zinc-950/40 border-zinc-850/60 opacity-60'
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                    {m.category}
                  </span>
                  {m.isEarned ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
                      <Check className="w-3 h-3" />
                      <span>EARNED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{m.progressText || 'LOCKED'}</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                  {m.title}
                </h4>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-600">
                <span>Deterministic milestone</span>
                {m.earnedAt && (
                  <span className="text-zinc-500">
                    {new Date(m.earnedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
