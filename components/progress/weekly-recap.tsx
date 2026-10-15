'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Clock, Calendar, Plus, Award } from 'lucide-react';
import { WeeklyRecapData } from '@/lib/progress';

interface WeeklyRecapProps {
  recap: WeeklyRecapData;
}

export const WeeklyRecap: React.FC<WeeklyRecapProps> = ({ recap }) => {
  const { currentWeek, previousWeek, growthPercent } = recap;
  const [selectedTab, setSelectedTab] = useState<'current' | 'previous'>('current');

  const activeWeek = selectedTab === 'current' ? currentWeek : previousWeek;
  const hasActivity = activeWeek.proofCount > 0;

  return (
    <section className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
              WEEKLY CADENCE • MONDAY TO SUNDAY
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">
            YOUR WEEK IN PROOF
          </h3>
        </div>

        {/* Week Switcher & Growth Pill */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setSelectedTab('current')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedTab === 'current'
                  ? 'bg-zinc-800 text-white font-medium shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setSelectedTab('previous')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedTab === 'previous'
                  ? 'bg-zinc-800 text-white font-medium shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Prior Week
            </button>
          </div>

          {selectedTab === 'current' && growthPercent !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
              {growthPercent >= 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">+{growthPercent}% vs prior</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-medium">{growthPercent}% vs prior</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Week Date Range Banner */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            {activeWeek.startDate} – {activeWeek.endDate}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500 font-light">
            {selectedTab === 'current' ? 'Ongoing week' : 'Closed week'}
          </span>
        </div>
        {selectedTab === 'current' && (
          <Link
            href="/proof"
            className="text-[11px] text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Proof</span>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500">WEEKLY PROOFS</span>
          <span className="text-2xl font-bold font-mono text-white">
            {activeWeek.proofCount}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {selectedTab === 'current'
              ? `${previousWeek.proofCount} in prior week`
              : `${currentWeek.proofCount} in current week`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500">ACTIVE DAYS</span>
          <span className="text-2xl font-bold font-mono text-white">
            {activeWeek.activeDays} / 7
          </span>
          <span className="text-[10px] font-mono text-zinc-500">days showing up</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500">FLEX GAINED</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            +{activeWeek.flexScoreGained}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">from verified proofs</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-zinc-500">DOMINANT VERTICAL</span>
          <span className="text-base font-bold text-white truncate">
            {activeWeek.topCategory}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">{activeWeek.categoriesCount} categories</span>
        </div>
      </div>

      {/* Category Distribution Pills (if categories exist) */}
      {activeWeek.categories && activeWeek.categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900">
          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Categories:</span>
          {activeWeek.categories.map((c) => (
            <span
              key={c.name}
              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
            >
              {c.name} <span className="text-zinc-500">({c.count})</span>
            </span>
          ))}
        </div>
      )}

      {/* Weekly Proofs List */}
      {!hasActivity ? (
        <div className="py-8 flex flex-col items-center text-center gap-3 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-900">
          <Clock className="w-8 h-8 stroke-[1.5] text-zinc-600" />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-mono text-zinc-300">
              {selectedTab === 'current'
                ? 'Your week in proof is just beginning.'
                : 'No proofs were logged during this prior week.'}
            </p>
            <p className="text-[11px] text-zinc-500">
              {selectedTab === 'current'
                ? 'Create a proof today to establish your consistency baseline.'
                : 'Consistency is built week over week.'}
            </p>
          </div>
          {selectedTab === 'current' && (
            <Link
              href="/proof"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-mono font-medium hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Proof</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 font-semibold">
              PROOFS LOGGED THIS WEEK ({activeWeek.proofs.length})
            </span>
          </div>

          <div className="flex flex-col divide-y divide-zinc-900/80 bg-zinc-900/40 rounded-xl border border-zinc-850 overflow-hidden">
            {activeWeek.proofs.map((proof) => (
              <div
                key={proof.id}
                className="p-3.5 flex items-start justify-between gap-3 hover:bg-zinc-900/80 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {proof.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      <Image
                        src={proof.imageUrl}
                        alt={proof.caption || 'Proof'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                        {proof.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(proof.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                      {proof.caption}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pt-0.5">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{proof.points}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
