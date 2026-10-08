'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Flame, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { UserProfile, ProofRecord } from '@/types';
import { ProofCard } from '@/components/proof/proof-card';
import { Avatar } from '@/components/ui/avatar';
import { TodayModule } from '@/components/today/today-module';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

const CATEGORIES = ['All', 'Fitness', 'Learning', 'Creating', 'Building', 'Lifestyle', 'Achievement'];

interface HomeDashboardProps {
  userProfile: UserProfile;
  initialProofs: ProofRecord[];
  followedUsers: UserProfile[];
  circleProofs: { proof: ProofRecord; author: UserProfile }[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  initialProofs,
  followedUsers,
  circleProofs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const todayProofs = initialProofs.filter((p) => new Date(p.createdAt) >= todayMidnight);

  const filteredProofs = initialProofs.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const nextMilestone = Math.max(1000, Math.ceil((userProfile.flexScore + 1) / 1000) * 1000);
  const progressPercent = Math.min(100, Math.round((userProfile.flexScore / nextMilestone) * 100));

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 py-6 sm:py-8">
      {/* =========================================================================
          1. HERO HEADER
         ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">
            PERSONAL RECORD
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Good {getTimeOfDayGreeting()},{' '}
            <span className="text-zinc-300 font-normal">@{userProfile.username}</span>
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            Keep building your proof.
          </p>
        </div>

        <Link
          href="/progress"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all w-fit"
        >
          <span>Progress Record</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* =========================================================================
          2. TODAY ACTION MODULE
         ========================================================================= */}
      <TodayModule userProfile={userProfile} todayProofs={todayProofs} />

      {/* =========================================================================
          3. FLEX SCORE HERO MODULE
         ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-3xl bg-zinc-950/60 border border-zinc-850 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
              FLEX SCORE
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white">
                {userProfile.flexScore}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                / {nextMilestone} goal
              </span>
            </div>
          </div>

          {/* Streak Indicator */}
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-orange-400 font-mono text-xs font-medium">
              <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
              <span>{userProfile.streak > 0 ? `${userProfile.streak} DAY STREAK` : 'START STREAK'}</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 mt-1">
              Consistency compounds.
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>{userProfile.flexScore === 0 ? 'Your first proof starts here' : `${progressPercent}% to ${nextMilestone}`}</span>
            <Link href="/progress" className="hover:text-zinc-300 underline transition-colors">
              {initialProofs.length} Proofs Logged &bull; View Progress &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRIMARY CTA — CREATE PROOF
         ========================================================================= */}
      <Link
        href="/proof"
        className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.99] select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight uppercase font-mono">
              Create Proof
            </span>
            <span className="text-xs text-zinc-700 font-light">
              Show what you actually did.
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* =========================================================================
          4. YOUR PROOFS FEED
         ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">
              Your Proofs
            </h2>
            <p className="text-[11px] font-light text-zinc-500">
              A record of what you&apos;ve actually done.
            </p>
          </div>

          {/* Category Filter Tabs */}
          {initialProofs.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredProofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase mb-1">
              {selectedCategory !== 'All' ? `${selectedCategory.toUpperCase()} PROOFS` : 'YOUR PROOF STARTS HERE'}
            </span>
            <h3 className="text-sm font-medium text-white">
              {selectedCategory !== 'All' ? `No ${selectedCategory} proofs yet.` : 'Nothing is recorded yet.'}
            </h3>
            <p className="text-xs text-zinc-400 font-light mt-1 max-w-[240px] leading-relaxed">
              {selectedCategory !== 'All' ? `Record your first ${selectedCategory.toLowerCase()} accomplishment.` : 'Do something worth remembering.'}
            </p>
            <Link
              href="/proof"
              className="mt-4 px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono tracking-wider font-semibold transition-all shadow-md"
            >
              CREATE PROOF
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. CIRCLE SOCIAL PREVIEW
         ========================================================================= */}
      <section className="flex flex-col gap-4 border-t border-zinc-900/80 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white">
              Your Circle
            </h2>
            <p className="text-[11px] font-light text-zinc-500">
              See what the people around you are actually doing.
            </p>
          </div>
          <Link
            href="/circle"
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {followedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
            <Compass className="w-6 h-6 text-zinc-600 mb-2" />
            <h4 className="text-xs font-medium text-zinc-300">Your Circle is empty.</h4>
            <p className="text-[11px] text-zinc-500 font-light mt-1 max-w-[220px]">
              Find people whose real achievements inspire your own momentum.
            </p>
            <Link
              href="/circle"
              className="mt-3.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[10px] font-mono tracking-wider transition-all"
            >
              Find People
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Followed Profiles Pill Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {followedUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/${user.username}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-colors shrink-0 group"
                >
                  <Avatar src={user.avatarUrl || undefined} fallback={user.username} size="sm" />
                  <span className="text-xs text-zinc-300 group-hover:text-white font-medium">
                    @{user.username}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {user.flexScore}
                  </span>
                </Link>
              ))}
            </div>

            {/* Latest Proofs from Circle */}
            {circleProofs.length > 0 && (
              <div className="flex flex-col gap-3 mt-1">
                {circleProofs.map(({ proof, author }) => (
                  <ProofCard key={proof.id} proof={proof} author={author} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
