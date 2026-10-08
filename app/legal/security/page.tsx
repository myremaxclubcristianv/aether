import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Security & Responsible Disclosure | AETHER Legal Center',
  description: 'AETHER security controls, architecture, defense layers and responsible vulnerability disclosure policy.',
};

export default function SecurityPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          DEFENSE IN DEPTH & DISCLOSURE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          SECURITY & RESPONSIBLE DISCLOSURE
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Security Philosophy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — ARCHITECTURAL SECURITY PRINCIPLES
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER employs an adversarial defense-in-depth architecture designed to protect user identity, proof integrity, and infrastructure reliability.
        </p>
      </section>

      {/* 02. Core Protection Layers */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
          <span className="font-mono text-white font-semibold">Row-Level Security (RLS)</span>
          <p className="text-zinc-400 text-[11px]">
            Every database query is gated by PostgreSQL Row-Level Security policies ensuring users can only mutate their own records and access permissible public data.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
          <span className="font-mono text-white font-semibold">Hardened Content Security Policy (CSP)</span>
          <p className="text-zinc-400 text-[11px]">
            Strict HTTP security headers, strict script-src and connect-src directives preventing cross-site scripting (XSS) and unauthorized third-party telemetry injection.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
          <span className="font-mono text-white font-semibold">Sliding-Window Rate Limiting</span>
          <p className="text-zinc-400 text-[11px]">
            All public endpoints, analytics routes, proof submissions, and auth attempts are protected against automated brute-force and DDoS flooding.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
          <span className="font-mono text-white font-semibold">Zero Credential Exposure</span>
          <p className="text-zinc-400 text-[11px]">
            Serverless secrets, Supabase service roles, and Telegram Bot tokens are isolated server-side and never exposed to the client bundle or response payloads.
          </p>
        </div>
      </section>

      {/* 03. Responsible Disclosure */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — RESPONSIBLE VULNERABILITY DISCLOSURE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          We welcome contributions from security researchers and developers to help keep AETHER secure. If you discover a potential vulnerability, we ask that you adhere to responsible disclosure principles:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400 font-light">
          <li>Report the vulnerability privately to our security contact without public disclosure.</li>
          <li>Allow reasonable time for investigation, verification, and deployment of a fix before publishing details.</li>
          <li>Do not access, modify, or exfiltrate another user&apos;s data.</li>
          <li>Do not perform destructive attacks (e.g. DoS or data corruption) against production systems.</li>
        </ul>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs font-mono flex flex-col gap-1 mt-2">
          <span className="text-white font-semibold">Security Contact:</span>
          <span className="text-zinc-300">Email: <a href="mailto:cristianvaduva@duck.com" className="underline text-white">cristianvaduva@duck.com</a></span>
          <span className="text-zinc-500">Subject: [SECURITY] Vulnerability Report — AETHER</span>
        </div>
      </section>
    </article>
  );
}
