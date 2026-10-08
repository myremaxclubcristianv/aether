'use client';

import React from 'react';
import { Flame, Award, Calendar, Layers } from 'lucide-react';
import { UserProgressData } from '@/lib/progress';

interface ProgressOverviewProps {
  progress: UserProgressData;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ progress }) => {
  const { totalProofs, flexScore, activeDays, currentStreak, bestStreak, categoryBreakdown } = progress;

  return (
    <div className="flex flex-col gap-6">
      {/* Editorial Statement Header */}
      <section className="flex flex-col gap-2 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-semibold">
          PERSONAL IDENTITY &amp; RECORD
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-sans leading-tight">
          DON&apos;T LOOK AT YOUR FEED.<br />
          <span className="text-zinc-400 italic font-serif">LOOK AT YOUR LIFE.</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-lg mt-1">
          A real-world archive of what you have built, completed and proven over time.
          {progress.dailyActionsCount > 0 && (
            <span className="block text-zinc-300 font-mono text-[11px] mt-1.5">
              &bull; {progress.dailyActionsCount} Aether Daily development actions completed.
            </span>
          )}
        </p>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Proofs */}
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">TOTAL PROOFS</span>
            <Award className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {totalProofs}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
              Verified actions
            </span>
          </div>
        </div>

        {/* Flex Score */}
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">FLEX SCORE</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">SCORE</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {flexScore}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
              Accumulated power
            </span>
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">ACTIVE DAYS</span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {activeDays}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
              Days showing up
            </span>
          </div>
        </div>

        {/* Current & Best Streak */}
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">STREAK</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                {currentStreak}d
              </span>
              {bestStreak > currentStreak && (
                <span className="text-[10px] font-mono text-zinc-500">
                  (Best: {bestStreak}d)
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
              Consecutive days
            </span>
          </div>
        </div>
      </section>

      {/* Category Distribution Bar & List */}
      {categoryBreakdown.length > 0 && (
        <section className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                CATEGORY COMPOSITION
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              {categoryBreakdown.length} ACTIVE VERTICALS
            </span>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden flex">
            {categoryBreakdown.map((cat, idx) => {
              const colors = ['bg-white', 'bg-zinc-400', 'bg-zinc-600', 'bg-zinc-700', 'bg-zinc-800'];
              return (
                <div
                  key={cat.name}
                  className={`h-full ${colors[idx % colors.length]} transition-all`}
                  style={{ width: `${Math.max(4, cat.percent)}%` }}
                  title={`${cat.name}: ${cat.count} proofs (${cat.percent}%)`}
                />
              );
            })}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2 text-xs font-mono"
              >
                <span className="text-white font-medium">{cat.name}</span>
                <span className="text-zinc-500">{cat.count} proofs</span>
                <span className="text-emerald-400 font-medium">+{cat.points}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
