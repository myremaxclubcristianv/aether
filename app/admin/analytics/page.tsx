import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProductAnalytics } from '@/lib/analytics';
import { notifySecurityEvent } from '@/lib/telegram';
import { Metadata } from 'next';
import { 
  Users, 
  Flame, 
  Sparkles, 
  Clock, 
  Image as ImageIcon, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  Activity,
  AlertCircle 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Product Analytics • Aether Admin',
  description: 'Deterministic behavior intelligence and activation funnel telemetry.',
};

interface PageProps {
  searchParams: Promise<{ window?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin/analytics');
  }

  // Admin Access Verification (Strict Fail-Closed)
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const allowedEmails = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = (user.email || '').toLowerCase();

  if (allowedEmails.length === 0 || !allowedEmails.includes(userEmail)) {
    await notifySecurityEvent({
      eventTitle: 'Unauthorized admin dashboard access attempt',
      endpoint: '/admin/analytics',
      authStatus: 'Forbidden (Non-admin User)',
      result: 'Rendered Access Restricted',
      user: user.email || 'unknown',
    });

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-1">Access Restricted</h1>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          Your account ({user.email || 'unknown'}) does not have administrative privileges to view internal product intelligence.
        </p>
        <Link
          href="/home"
          className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-white border border-zinc-800 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const timeWindow = (resolvedParams.window === '7d' || resolvedParams.window === '30d')
    ? resolvedParams.window
    : 'all';

  const analytics = await getProductAnalytics(timeWindow);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto flex flex-col gap-10">
      {/* Header & Back Navigation */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="p-1.5 rounded-lg border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">
              INTERNAL INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
            Product Analytics & Behavior
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Real production telemetry measuring action, activation, and retention velocity.
          </p>
        </div>

        {/* Time Window Filter Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-850 w-fit">
          <Link
            href="/admin/analytics?window=all"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors ${
              timeWindow === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All Time
          </Link>
          <Link
            href="/admin/analytics?window=30d"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors ${
              timeWindow === '30d' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Last 30d
          </Link>
          <Link
            href="/admin/analytics?window=7d"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors ${
              timeWindow === '7d' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Last 7d
          </Link>
        </div>
      </header>

      {/* Early Data Notice Banner if small sample */}
      {analytics.isEarlyData && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-850 text-left">
          <Activity className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-zinc-200">
              Early Cohort Stage ({analytics.totalUsers} registered users)
            </span>
            <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
              Metrics reflect deterministic production records. Statistical significance will compound as user volume expands.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. TOP-LEVEL KPI METRIC CARDS
         ========================================================================= */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> USERS
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1">
            {analytics.totalUsers}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {analytics.onboardedUsers} Onboarded
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> ACTIVATED
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {analytics.activatedUsers}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {analytics.onboardedUsers > 0 ? `${Math.round((analytics.activatedUsers / analytics.onboardedUsers) * 100)}% Activation` : '—'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> 2ND PROOF
          </span>
          <span className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {analytics.retainedUsers}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {analytics.activatedUsers > 0 ? `${Math.round((analytics.retainedUsers / analytics.activatedUsers) * 100)}% Retained` : '—'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> PROOFS
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1">
            {analytics.totalProofs}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {analytics.activatedUsers > 0 ? `${(analytics.totalProofs / analytics.activatedUsers).toFixed(1)} / user` : '0 / user'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 1ST PROOF TIME
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1">
            {analytics.timeToFirstProof.formattedMedian}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Avg: {analytics.timeToFirstProof.formattedAverage}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-1">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> PHOTO PROOFS
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1">
            {analytics.imageProofPercentage}%
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {analytics.imageProofCount} / {analytics.totalProofs} total
          </span>
        </div>
      </section>

      {/* =========================================================================
          2. CORE PRODUCT FUNNEL VISUALIZATION
         ========================================================================= */}
      <section className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
            CONVERSION FUNNEL
          </span>
          <h2 className="text-lg font-semibold text-white">
            Action & Retention Funnel
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            Tracking user progression from initial signup through first proof, second proof, and social activation.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {analytics.funnel.map((step, idx) => {
            const widthPercent = Math.max(8, step.conversionFromTop);
            return (
              <div key={step.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500">0{idx + 1}</span>
                    <span className="font-medium text-white">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-white font-semibold">{step.count} users</span>
                    <span className="text-zinc-500">({step.conversionFromTop}%)</span>
                    {step.conversionFromPrevious !== null && (
                      <span className="text-emerald-400 hidden sm:inline">
                        • {step.conversionFromPrevious}% step conversion
                      </span>
                    )}
                    {step.dropoffPercentage !== null && step.dropoffPercentage > 0 && (
                      <span className="text-red-400/80 hidden sm:inline">
                        ({step.dropoffPercentage}% drop)
                      </span>
                    )}
                  </div>
                </div>

                {/* Funnel Progress Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. CATEGORY & VISUAL PROOF BREAKDOWN
         ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
              CATEGORY BREAKDOWN
            </span>
            <h3 className="text-base font-semibold text-white mt-0.5">
              Proof Category Distribution
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {analytics.categoryDistribution.map((cat) => (
              <div key={cat.category} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">{cat.category}</span>
                  <span className="text-zinc-500">{cat.count} proofs ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 rounded-full"
                    style={{ width: `${Math.max(3, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Metrics (Time to 1st & 2nd proof) */}
        <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
              ACTIVATION VELOCITY
            </span>
            <h3 className="text-base font-semibold text-white mt-0.5">
              Time to Milestone
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850/80 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">
                Signup → First Proof
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">
                  {analytics.timeToFirstProof.formattedMedian}
                </span>
                <span className="text-xs font-mono text-zinc-500">(Median)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Average duration: {analytics.timeToFirstProof.formattedAverage}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850/80 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">
                First Proof → Second Proof (Retention)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">
                  {analytics.timeToSecondProof.formattedMedian}
                </span>
                <span className="text-xs font-mono text-zinc-500">(Median)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Average duration: {analytics.timeToSecondProof.formattedAverage}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. COHORT ANALYSIS TABLE
         ========================================================================= */}
      {analytics.cohorts.length > 0 && (
        <section className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
              COHORT RETENTION
            </span>
            <h3 className="text-base font-semibold text-white mt-0.5">
              Weekly Signup Cohorts
            </h3>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] uppercase">
                  <th className="py-2.5 pr-4">Cohort</th>
                  <th className="py-2.5 px-4">Signups</th>
                  <th className="py-2.5 px-4">Onboarded</th>
                  <th className="py-2.5 px-4">1st Proof</th>
                  <th className="py-2.5 px-4">2nd Proof</th>
                  <th className="py-2.5 pl-4">Follow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {analytics.cohorts.map((cohort) => (
                  <tr key={cohort.cohortKey} className="text-zinc-300">
                    <td className="py-3 pr-4 font-medium text-white">{cohort.cohortKey}</td>
                    <td className="py-3 px-4">{cohort.signups}</td>
                    <td className="py-3 px-4">{cohort.onboardedPercent}%</td>
                    <td className="py-3 px-4 text-emerald-400">{cohort.firstProofPercent}%</td>
                    <td className="py-3 px-4 text-orange-400">{cohort.secondProofPercent}%</td>
                    <td className="py-3 pl-4">{cohort.socialPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          5. WHAT TO WATCH (DETERMINISTIC OBSERVATIONS)
         ========================================================================= */}
      <section className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-white">
            What to Watch • Deterministic Observations
          </h3>
        </div>

        <ul className="flex flex-col gap-2">
          {analytics.observations.map((obs, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <span>Source: Authoritative Supabase Production Database</span>
          <span>Last computed: {new Date(analytics.diagnostics.lastUpdatedUtc).toUTCString()}</span>
        </div>
      </section>
    </div>
  );
}
