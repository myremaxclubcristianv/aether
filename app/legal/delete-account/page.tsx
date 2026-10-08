'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const CONFIRMATION_TARGET = 'DELETE_MY_ACCOUNT_PERMANENTLY';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationInput !== CONFIRMATION_TARGET) {
      setErrorMessage(`Please type exactly: ${CONFIRMATION_TARGET}`);
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/legal/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmationInput }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to execute deletion. Please ensure you are logged in.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error occurred. Please contact privacy support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-red-400 font-semibold">
          PERMANENT ACCOUNT & DATA ERASURE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          ACCOUNT & DATA DELETION
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
          Learn how account deletion works on AETHER, what data is purged, and execute a permanent self-service account deletion.
        </p>
      </div>

      {/* Consequences & Technical Flow */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          WHAT HAPPENS WHEN YOU DELETE YOUR ACCOUNT
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">1. Profile Purged</span>
            <p className="text-zinc-400 text-[11px]">
              Your profile, bio, avatar, and unique handle (@username) are permanently deleted from database records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">2. Proofs & Scores Cleared</span>
            <p className="text-zinc-400 text-[11px]">
              All your submitted Proofs, uploaded proof media, Flex Score calculations, and consistency streaks are purged.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">3. Social Graph Removed</span>
            <p className="text-zinc-400 text-[11px]">
              Your following and follower connections are severed across the entire Circle social layer.
            </p>
          </div>
        </div>
      </section>

      {/* Self-Service Deletion Form */}
      <section className="bg-zinc-950/90 border border-red-950/60 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-red-400 font-semibold">
            PERMANENT ACTION • CANNOT BE UNDONE
          </span>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Execute Self-Service Deletion
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            You must be currently logged in to your account. To prevent accidental clicks, type the confirmation string below.
          </p>
        </div>

        {status === 'success' ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 text-sm">
              ✓
            </div>
            <h3 className="text-base font-semibold text-white">Account Successfully Deleted</h3>
            <p className="text-xs text-zinc-400 font-light max-w-sm leading-relaxed">
              Your profile and proofs have been removed. Redirecting you to the home page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400">
                Type <code className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/40">{CONFIRMATION_TARGET}</code> to confirm:
              </label>
              <input
                type="text"
                required
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={CONFIRMATION_TARGET}
                className="h-10 px-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder:text-zinc-700 text-xs font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-900">
              <Link
                href="/legal/data-rights"
                className="text-xs font-mono text-zinc-500 hover:text-zinc-300 underline"
              >
                Or submit a manual erasure request →
              </Link>

              <button
                type="submit"
                disabled={loading || confirmationInput !== CONFIRMATION_TARGET}
                className="h-10 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all font-mono text-xs uppercase font-semibold disabled:opacity-40 disabled:hover:bg-red-600"
              >
                {loading ? 'Purging Account...' : 'Permanently Delete Account'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400 font-mono text-center">{errorMessage}</p>
            )}
          </form>
        )}
      </section>
    </article>
  );
}
