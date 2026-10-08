import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEGAL_DOCS, LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Legal Center — Transparency & Governance | AETHER',
  description: 'Transparency, privacy, platform terms and user rights behind the AETHER social proof system.',
};

export default function LegalHubPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero Header */}
      <section className="flex flex-col gap-4 border-b border-zinc-900 pb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span>GOVERNANCE & TRANSPARENCY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-sans">
          LEGAL
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-light max-w-xl leading-relaxed">
          Transparency, privacy and the rules behind AETHER.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </section>

      {/* Primary Legal Document Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEGAL_DOCS.map((doc) => (
          <Link
            key={doc.id}
            href={doc.slug}
            className="bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700 transition-all rounded-2xl p-6 flex flex-col justify-between gap-5 group relative overflow-hidden"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {doc.category}
                </span>
                <span className="text-xs text-zinc-500 group-hover:text-white transition-colors">
                  ↗
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white tracking-tight group-hover:text-zinc-200">
                {doc.title}
              </h2>

              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {doc.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Read Document</span>
              <span className="text-zinc-600">v{doc.version}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* GDPR & Contact Summary Box */}
      <section className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 mt-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
            PRIVACY & DATA SUBJECT ASSISTANCE
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Exercising Your Rights Under GDPR / RGPD
          </h2>
          <p className="text-xs text-zinc-300 font-light leading-relaxed max-w-xl">
            AETHER respects European data protection principles. You can request access, correction, restriction, objection or erasure of your personal data at any time through the dedicated Data Subject Rights portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/legal/data-rights"
            className="h-10 px-5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase font-semibold"
          >
            Open Data Rights Portal
          </Link>
          <Link
            href="/legal/delete-account"
            className="h-10 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase"
          >
            Account Deletion Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
