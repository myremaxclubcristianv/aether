'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const RIGHT_TYPES = [
  { id: 'ACCESS', label: 'Request Access (Copy of Personal Data)', article: 'GDPR Art. 15' },
  { id: 'RECTIFICATION', label: 'Request Correction / Update', article: 'GDPR Art. 16' },
  { id: 'ERASURE', label: 'Request Deletion / Erasure', article: 'GDPR Art. 17' },
  { id: 'RESTRICTION', label: 'Restrict Processing', article: 'GDPR Art. 18' },
  { id: 'PORTABILITY', label: 'Data Portability Export', article: 'GDPR Art. 20' },
  { id: 'OBJECTION', label: 'Object to Processing', article: 'GDPR Art. 21' },
  { id: 'INQUIRY', label: 'General Privacy Question / Assistance', article: 'General Privacy' },
];

export default function DataRightsPage() {
  const [selectedType, setSelectedType] = useState<string>('ACCESS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/legal/data-rights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: selectedType,
          name,
          email,
          username,
          details,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        setMessage(data.message || 'Your request has been received.');
        setName('');
        setEmail('');
        setUsername('');
        setDetails('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit request. Please try direct email.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please contact cristianvaduva@duck.com directly.');
    }
  };

  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          GDPR / RGPD SELF-SERVICE PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          YOUR DATA. YOUR RIGHTS.
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
          Under European data protection law (GDPR), you hold enforceable legal rights over your personal data. Use this portal to submit a formal Data Subject Request.
        </p>
      </div>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {RIGHT_TYPES.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedType === item.id
                ? 'bg-zinc-900 border-white text-white'
                : 'bg-zinc-950/70 border-zinc-850 text-zinc-400 hover:border-zinc-700'
            }`}
            onClick={() => setSelectedType(item.id)}
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                {item.article}
              </span>
              <span className="text-xs font-semibold text-white">
                {item.label}
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              {selectedType === item.id ? '✓ Selected' : 'Select Right →'}
            </span>
          </div>
        ))}
      </section>

      {/* Interactive Request Form */}
      <section className="bg-zinc-950/90 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
            SUBMIT DATA SUBJECT REQUEST
          </span>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Selected: {RIGHT_TYPES.find((r) => r.id === selectedType)?.label}
          </h2>
        </div>

        {status === 'success' ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 text-sm">
              ✓
            </div>
            <h3 className="text-base font-semibold text-white">Request Registered</h3>
            <p className="text-xs text-zinc-400 font-light max-w-sm leading-relaxed">
              {message}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline uppercase"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="h-10 px-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-10 px-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  AETHER Username (optional)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="h-10 px-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Request Details & Specifications
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Specify details to help us locate and process your request quickly..."
                className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-900">
              <span className="text-[11px] text-zinc-500 font-light">
                Statutory response timeframe: 30 days pursuant to GDPR Art. 12(3).
              </span>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="h-10 px-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-mono text-xs uppercase font-semibold disabled:opacity-50"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400 font-mono text-center">{message}</p>
            )}
          </form>
        )}
      </section>

      {/* Account Deletion Shortcut */}
      <section className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white">Looking for Immediate Account & Data Deletion?</span>
          <span className="text-xs text-zinc-400 font-light">You can execute a direct self-service account purge if you are currently logged in.</span>
        </div>
        <Link
          href="/legal/delete-account"
          className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 font-mono text-xs uppercase whitespace-nowrap text-center"
        >
          Account Deletion Portal →
        </Link>
      </section>
    </article>
  );
}
