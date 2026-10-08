'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Activity, BookOpen, PenTool, Hammer, Trophy } from 'lucide-react';
import { UserProfile, ProofRecord } from '@/types';

interface TodayModuleProps {
  userProfile: UserProfile;
  todayProofs: ProofRecord[];
}

const TODAY_ACTIONS = [
  { label: 'MOVE', category: 'Fitness', icon: Activity, hint: 'Workout, run, training' },
  { label: 'LEARN', category: 'Learning', icon: BookOpen, hint: 'Study, reading, course' },
  { label: 'CREATE', category: 'Creating', icon: PenTool, hint: 'Design, writing, art' },
  { label: 'BUILD', category: 'Building', icon: Hammer, hint: 'Code, startup, project' },
  { label: 'ACHIEVE', category: 'Achievement', icon: Trophy, hint: 'Milestone, goal, result' },
];

export const TodayModule: React.FC<TodayModuleProps> = ({ userProfile, todayProofs }) => {
  const hasProofToday = todayProofs.length > 0;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-3xl p-5 sm:p-7 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
            TODAY &bull; {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            WHAT ARE YOU DOING TODAY?
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            Make today count. Turn action into verified proof.
          </p>
        </div>

        {/* Streak Status */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-orange-400 font-mono text-xs shrink-0">
          <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
          <span>{userProfile.streak > 0 ? `${userProfile.streak}d Streak` : 'Day 1'}</span>
        </div>
      </div>

      {/* Action Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {TODAY_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={`/proof?category=${encodeURIComponent(action.category)}`}
              className="bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all group select-none"
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {action.label}
                </span>
                <span className="text-[10px] text-zinc-500 font-light truncate">
                  {action.hint}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Status & Primary CTA */}
      <div className="pt-3 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span
            className={`w-2 h-2 rounded-full ${
              hasProofToday ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
            }`}
          />
          <span>
            {hasProofToday
              ? `${todayProofs.length} proof${todayProofs.length > 1 ? 's' : ''} logged today`
              : 'No proof logged yet today'}
          </span>
        </div>

        <Link
          href="/proof"
          className="h-10 px-5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-mono text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Create Proof</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
