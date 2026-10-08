'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';
import { MonthlyTimelineBucket } from '@/lib/progress';

interface TimelineArchiveProps {
  timeline: MonthlyTimelineBucket[];
}

export const TimelineArchive: React.FC<TimelineArchiveProps> = ({ timeline }) => {
  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
            CHRONOLOGICAL ARCHIVE
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">
            PROGRESS TIMELINE
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {timeline.length} ACTIVE {timeline.length === 1 ? 'MONTH' : 'MONTHS'} RECORDED
        </span>
      </div>

      {timeline.length === 0 ? (
        <div className="py-8 flex flex-col items-center text-center gap-2 text-zinc-500">
          <CalendarDays className="w-8 h-8 stroke-[1.5] text-zinc-600" />
          <p className="text-xs font-mono">No historical monthly records yet.</p>
          <p className="text-[11px] text-zinc-600">Your monthly milestones will automatically populate here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {timeline.map((bucket) => (
            <div
              key={bucket.monthKey}
              className="bg-zinc-900/60 border border-zinc-850 hover:border-zinc-750 transition-all rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center font-mono shrink-0">
                  <span className="text-[9px] text-zinc-500 uppercase">{bucket.monthName.slice(0, 3)}</span>
                  <span className="text-xs font-bold text-white">{bucket.year}</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-white uppercase">
                    {bucket.monthName}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-0.5">
                    <span>{bucket.proofCount} Proofs</span>
                    <span>&bull;</span>
                    <span>{bucket.activeDays} active days</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">+{bucket.flexScoreGained} Flex</span>
                  </div>
                </div>
              </div>

              {/* Category tags for month */}
              <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                {bucket.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat.name}
                    className="px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                  >
                    {cat.name} ({cat.count})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
