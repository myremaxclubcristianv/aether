'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Plus, Search } from 'lucide-react';
import { ChallengeWithDetails } from '@/types';
import { ChallengeCard } from './challenge-card';

const CATEGORIES = ['All', 'Fitness', 'Learning', 'Building', 'Creating', 'Lifestyle', 'Achievement'];

interface ChallengeListProps {
  initialChallenges: ChallengeWithDetails[];
  currentUserId?: string;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  initialChallenges,
  currentUserId,
}) => {
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>(initialChallenges);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = challenges.filter((c) => {
    // Tab filter
    if (activeTab === 'joined') {
      const isJoined = c.userParticipation?.status === 'joined';
      if (!isJoined) return false;
    } else if (activeTab === 'completed') {
      const isCompleted =
        c.userParticipation?.status === 'completed' || c.status === 'completed';
      if (!isCompleted) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
              PROOF-BASED SPRINTS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              {challenges.length} AVAILABLE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            SOCIAL CHALLENGES
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            Turn commitments into verified proof. Join sprints with other builders.
          </p>
        </div>

        <Link
          href="/challenges/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-mono font-medium hover:bg-zinc-200 transition-all self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Challenge</span>
        </Link>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Pills */}
        <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-850 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Sprints
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'joined'
                ? 'bg-zinc-800 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            My Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-zinc-800 text-white font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sprints..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all font-mono"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full border transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-zinc-800 border-zinc-700 text-white font-medium'
                : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/60 rounded-2xl border border-zinc-850 p-6">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            <Trophy className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-sm font-semibold text-white">No challenges found</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              {activeTab === 'joined'
                ? 'You have not joined any active sprints yet.'
                : activeTab === 'completed'
                ? 'No completed challenges recorded yet.'
                : 'No challenges match your selected filters.'}
            </p>
          </div>
          <Link
            href="/challenges/create"
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-mono font-medium hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create a Challenge</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              currentUserId={currentUserId}
              onJoinSuccess={() => {
                // Refresh local challenge list
                fetch('/api/challenges')
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.ok && Array.isArray(data.challenges)) {
                      setChallenges(data.challenges);
                    }
                  })
                  .catch(() => {});
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
