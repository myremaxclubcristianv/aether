'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { WeeklyRecapData } from '@/lib/progress';

interface WeeklyRecapProps {
  recap: WeeklyRecapData;
}

export const WeeklyRecap: React.FC<WeeklyRecapProps> = ({ recap }) => {
  const { currentWeek, previousWeek, growthPercent } = recap;
  const hasCurrentActivity = currentWeek.proofCount > 0;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
              WEEKLY CADENCE
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({currentWeek.startDate} – {currentWeek.endDate})
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">
            YOUR WEEK IN PROOF
          </h3>
        </div>

        {growthPercent !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
            {growthPercent >= 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+{growthPercent}% vs last week</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-medium">{growthPercent}% vs last week</span>
              </>
            )}
          </div>
        )}
      </div>

      {!hasCurrentActivity ? (
        <div className="py-6 flex flex-col items-center text-center gap-2 text-zinc-500">
          <Clock className="w-8 h-8 stroke-[1.5] text-zinc-600" />
          <p className="text-xs font-mono">Your week in proof is just beginning.</p>
          <p className="text-[11px] text-zinc-600">Show up today to record your first weekly achievement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">WEEKLY PROOFS</span>
            <span className="text-2xl font-bold font-mono text-white">
              {currentWeek.proofCount}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {previousWeek.proofCount} previous week
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">ACTIVE DAYS</span>
            <span className="text-2xl font-bold font-mono text-white">
              {currentWeek.activeDays} / 7
            </span>
            <span className="text-[10px] font-mono text-zinc-500">days showing up</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">FLEX GAINED</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              +{currentWeek.flexScoreGained}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">+{previousWeek.flexScoreGained} prior</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">DOMINANT VERTICAL</span>
            <span className="text-base font-bold text-white truncate">
              {currentWeek.topCategory}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{currentWeek.categoriesCount} categories</span>
          </div>
        </div>
      )}
    </section>
  );
};
