'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Window30DaysMetrics } from '@/lib/progress';

interface Window30DaysProps {
  metrics: Window30DaysMetrics;
}

export const Window30Days: React.FC<Window30DaysProps> = ({ metrics }) => {
  const { proofCount, activeDays, categoriesCount, flexScoreGained, proofsPerActiveDay, topCategory } = metrics;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
            ROLLING 30-DAY WINDOW
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">
            YOUR LAST 30 DAYS
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {proofCount > 0 ? `${proofCount} actions recorded` : 'No activity in this window'}
        </span>
      </div>

      {proofCount === 0 ? (
        <div className="py-6 flex flex-col items-center text-center gap-2 text-zinc-500">
          <Calendar className="w-8 h-8 stroke-[1.5] text-zinc-600" />
          <p className="text-xs font-mono">Not enough history in the last 30 days.</p>
          <p className="text-[11px] text-zinc-600">Submit proofs to establish your 30-day baseline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">PROOFS LOGGED</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {proofCount}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">past 30 days</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">ACTIVE DAYS</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {activeDays}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{proofsPerActiveDay} proofs / active day</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">FLEX GAINED</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              +{flexScoreGained}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">score delta</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">TOP FOCUS</span>
            <span className="text-lg sm:text-xl font-bold text-white truncate">
              {topCategory}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{categoriesCount} categories used</span>
          </div>
        </div>
      )}
    </section>
  );
};
