import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Cookie Policy | AETHER Legal Center',
  description: 'How AETHER uses essential cookies, authentication tokens and client-side storage technologies.',
};

export default function CookiePolicyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          STORAGE & TRACKING DISCLOSURE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          COOKIE POLICY
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Overview */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — WHAT ARE COOKIES & LOCAL STORAGE?
        </h2>
        <p className="text-sm leading-relaxed font-light">
          Cookies and web storage (such as <code>localStorage</code> and <code>sessionStorage</code>) are small text files or key-value entries stored in your browser when you interact with web applications. They allow services to recognize your session and maintain your authentication state.
        </p>
      </section>

      {/* 02. Technologies Actually Used by AETHER */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — TECHNOLOGIES USED IN AETHER
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER utilizes strictly necessary technical mechanisms required to provide core platform functionality:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-850 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900/80 text-white font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 border-b border-zinc-800">Storage / Cookie Name</th>
                <th className="p-3 border-b border-zinc-800">Type</th>
                <th className="p-3 border-b border-zinc-800">Purpose</th>
                <th className="p-3 border-b border-zinc-800">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-light text-zinc-300">
              <tr>
                <td className="p-3 font-mono text-white">sb-*-auth-token</td>
                <td className="p-3">HTTP Cookie / Essential</td>
                <td className="p-3">Maintains authenticated user session state via Supabase Auth</td>
                <td className="p-3 font-mono text-zinc-400">Session / Configured Auth Lifetime</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-white">aether_visit_*</td>
                <td className="p-3">sessionStorage / Technical</td>
                <td className="p-3">Deduplicates visitor telemetry events across rapid page reloads (5-minute sliding deduplication)</td>
                <td className="p-3 font-mono text-zinc-400">Browser Session</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-white">aether_attr</td>
                <td className="p-3">sessionStorage / Attribution</td>
                <td className="p-3">Stores campaign acquisition parameters (e.g. UTM source) during your active browser tab session</td>
                <td className="p-3 font-mono text-zinc-400">Browser Session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 03. No Third-Party Tracking Pixels */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — NO THIRD-PARTY ADVERTISING COOKIES
        </h2>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs leading-relaxed font-light flex flex-col gap-2">
          <p className="text-white font-medium">
            AETHER does not use third-party advertising cookies, cross-site trackers, Meta Pixel, Google Analytics, or invasive ad-network scripts.
          </p>
          <p className="text-zinc-400">
            All operational telemetry is first-party and processed server-side. Because AETHER uses only strictly necessary cookies and transient session storage for authentication and basic operational integrity, consent under the ePrivacy Directive / GDPR for third-party ad cookies is not applicable.
          </p>
        </div>
      </section>

      {/* 04. Managing Cookies in Your Browser */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          04 — MANAGING COOKIES
        </h2>
        <p className="text-sm leading-relaxed font-light">
          You can configure your web browser to block or alert you about cookies. However, if you disable strictly necessary authentication cookies, you will not be able to log in or access protected features of AETHER.
        </p>
      </section>
    </article>
  );
}
