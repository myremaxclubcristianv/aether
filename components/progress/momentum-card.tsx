'use client';

import React from 'react';
import { Zap, TrendingUp, Minus, RotateCcw } from 'lucide-react';
import { PersonalMomentum } from '@/lib/progress';

interface MomentumCardProps {
  momentum: PersonalMomentum;
}

export const MomentumCard: React.FC<MomentumCardProps> = ({ momentum }) => {
  const { state, title, description, recent7DaysCount, previous7DaysCount, activeDaysLast7 } = momentum;

  const stateConfig = {
    BUILDING: {
      badgeBg: 'bg-emerald-950/60 border-emerald-800 text-emerald-400',
      icon: TrendingUp,
      statusLabel: 'VELOCITY ACCELERATING',
    },
    STEADY: {
      badgeBg: 'bg-zinc-900 border-zinc-750 text-white',
      icon: Minus,
      statusLabel: 'CONSISTENT CADENCE',
    },
    RESETTING: {
      badgeBg: 'bg-amber-950/40 border-amber-900/60 text-amber-400',
      icon: RotateCcw,
      statusLabel: 'NEEDS ATTENTION',
    },
    STARTING: {
      badgeBg: 'bg-zinc-900 border-zinc-800 text-zinc-400',
      icon: Zap,
      statusLabel: 'ESTABLISHING RECORD',
    },
  }[state];

  const Icon = stateConfig.icon;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500">
            PERSONAL MOMENTUM
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase font-semibold ${stateConfig.badgeBg}`}>
            {stateConfig.statusLabel}
          </span>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <Icon className="w-5 h-5 text-zinc-300 shrink-0" />
          <span>{title}</span>
        </h3>

        <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md">
          {description}
        </p>
      </div>

      {/* 7-Day Velocity Statistics */}
      <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 shrink-0 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase">PAST 7 DAYS</span>
          <span className="text-base font-bold text-white">{recent7DaysCount} Proofs</span>
          <span className="text-[10px] text-zinc-500">{activeDaysLast7} active days</span>
        </div>
        <div className="w-px h-8 bg-zinc-800" />
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase">PRIOR 7 DAYS</span>
          <span className="text-base font-bold text-zinc-400">{previous7DaysCount} Proofs</span>
          <span className="text-[10px] text-zinc-600">comparison</span>
        </div>
      </div>
    </section>
  );
};
