import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | AETHER Legal Center',
  description: 'Technical, security and behavioral rules governing acceptable use of the AETHER platform and APIs.',
};

export default function AcceptableUsePolicyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          SECURITY & COMPLIANCE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          ACCEPTABLE USE POLICY
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Purpose */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — PURPOSE & SCOPE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          This Acceptable Use Policy defines the rules governing interactions with AETHER&apos;s infrastructure, endpoints, APIs, and client interfaces. It applies to all users, automated clients, and visitors.
        </p>
      </section>

      {/* 02. Prohibited Technical Actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — PROHIBITED TECHNICAL ACTIVITIES
        </h2>
        <p className="text-sm leading-relaxed font-light">
          You may not directly or indirectly perform any of the following activities:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-medium">Automated Scraping & Crawling</span>
            <p className="text-zinc-400 text-[11px]">
              Extracting user profiles, proofs, images, or telemetry data using automated bots, spiders, or headless browsers without express permission.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-medium">Rate-Limit & API Abuse</span>
            <p className="text-zinc-400 text-[11px]">
              Flooding endpoints, bypassing sliding-window rate limiters, or attempting denial-of-service (DoS/DDoS) attacks against AETHER servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-medium">Unauthorized Access & Probing</span>
            <p className="text-zinc-400 text-[11px]">
              Attempting to access administrative interfaces, bypass Row-Level Security (RLS), probe endpoints for vulnerabilities, or access other users&apos; private records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-medium">Metric & Score Manipulation</span>
            <p className="text-zinc-400 text-[11px]">
              Deploying automated scripts to artificially inflate Flex Scores, falsify daily streaks, or forge proof timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* 03. Security Reporting */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — RESPONSIBLE SECURITY REPORTING
        </h2>
        <p className="text-sm leading-relaxed font-light">
          Security researchers who discover potential vulnerabilities are invited to report them responsibly according to our{' '}
          <Link href="/legal/security" className="text-white underline">
            Responsible Disclosure Policy
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
