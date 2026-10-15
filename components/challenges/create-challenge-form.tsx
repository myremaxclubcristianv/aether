'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/avatar';

const CATEGORIES = ['All', 'Fitness', 'Learning', 'Building', 'Creating', 'Lifestyle', 'Achievement'];
const DURATIONS = [
  { days: 7, label: '7 Days', desc: 'Sprint' },
  { days: 14, label: '14 Days', desc: 'Focus' },
  { days: 30, label: '30 Days', desc: 'Habit' },
];

interface CreateChallengeFormProps {
  followingUsers: UserProfile[];
}

export const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({ followingUsers }) => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('All');
  const [durationDays, setDurationDays] = useState(7);
  const [targetProofCount, setTargetProofCount] = useState(7);
  const [selectedInviteIds, setSelectedInviteIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInvite = (userId: string) => {
    setSelectedInviteIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setError('Description must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          durationDays,
          targetProofCount,
          isPublic: true,
          inviteUserIds: Array.from(selectedInviteIds),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to create challenge.');
      }

      router.push(`/challenges/${data.challengeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Challenges</span>
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
          NEW PROOF SPRINT
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
          CREATE A SOCIAL CHALLENGE
        </h1>
        <p className="text-xs text-zinc-400 font-light mt-0.5">
          Establish clear completion criteria. Proof-based accountability with your circle.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-zinc-300 font-medium">
          CHALLENGE TITLE <span className="text-zinc-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 7-Day Deep Work Sprint, 30 Days of Mobility"
          maxLength={100}
          required
          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
        />
      </div>

      {/* Description & Completion Criteria */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-zinc-300 font-medium">
          COMPLETION CRITERIA & RULES <span className="text-zinc-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what counts as a valid proof for this sprint..."
          rows={3}
          maxLength={1000}
          required
          className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors font-mono leading-relaxed"
        />
      </div>

      {/* Category Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-zinc-300 font-medium">
          CATEGORY VERTICAL
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all ${
                category === cat
                  ? 'bg-zinc-800 border-zinc-700 text-white font-medium shadow-sm'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-zinc-300 font-medium">
          SPRINT DURATION
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((dur) => (
            <button
              type="button"
              key={dur.days}
              onClick={() => {
                setDurationDays(dur.days);
                if (targetProofCount > dur.days) setTargetProofCount(dur.days);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                durationDays === dur.days
                  ? 'bg-zinc-800 border-zinc-750 text-white font-medium shadow-sm'
                  : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-sm font-bold font-mono">{dur.label}</span>
              <span className="text-[10px] font-mono text-zinc-500">{dur.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Proof Count */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-zinc-300 font-medium">
            REQUIRED VERIFIED PROOFS
          </label>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {targetProofCount} {targetProofCount === 1 ? 'proof' : 'proofs'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={durationDays * 2}
          value={targetProofCount}
          onChange={(e) => setTargetProofCount(parseInt(e.target.value, 10))}
          className="w-full accent-white bg-zinc-800 cursor-pointer h-1.5 rounded-lg"
        />
        <span className="text-[10px] font-mono text-zinc-500">
          Participants must log {targetProofCount} proof{targetProofCount > 1 ? 's' : ''} in{' '}
          {category === 'All' ? 'any category' : `the ${category} vertical`} to accomplish this sprint.
        </span>
      </div>

      {/* Invite Friends from Circle (if any) */}
      {followingUsers.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
          <label className="text-xs font-mono text-zinc-300 font-medium flex items-center justify-between">
            <span>INVITE FROM CIRCLE ({selectedInviteIds.size} selected)</span>
            <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
          </label>
          <div className="flex flex-col divide-y divide-zinc-900 bg-zinc-950/70 rounded-xl border border-zinc-850 max-h-48 overflow-y-auto">
            {followingUsers.map((u) => {
              const isSelected = selectedInviteIds.has(u.id);

              return (
                <div
                  key={u.id}
                  onClick={() => toggleInvite(u.id)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={u.avatarUrl || undefined}
                      fallback={u.username}
                      size="sm"
                      className="border border-zinc-800"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        @{u.username}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Flex Score: {u.flexScore}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-white border-white text-black'
                        : 'border-zinc-800 bg-zinc-900 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 border-t border-zinc-900">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-white text-black text-xs font-mono font-bold tracking-wider hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'LAUNCHING SPRINT...' : 'LAUNCH SOCIAL CHALLENGE'}
        </button>
      </div>
    </form>
  );
};
