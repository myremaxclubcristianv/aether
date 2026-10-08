import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Intellectual Property | AETHER Legal Center',
  description: 'Intellectual property ownership, trademark rights, code protection and user content licensing.',
};

export default function IntellectualPropertyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          OWNERSHIP & RIGHTS
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          INTELLECTUAL PROPERTY
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Platform IP */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — AETHER PLATFORM & BRAND ASSETS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          All rights, title, and interest in and to the AETHER platform — including its name, visual identity, typography, graphic design, user interface concepts, software source code, database structures, and scoring algorithms (such as the Flex Score and consistency streak algorithms) — are the exclusive intellectual property of the operator.
        </p>
        <p className="text-sm leading-relaxed font-light">
          Nothing in these terms grants you any right, title, or interest in AETHER trademarks, trade dress, or proprietary assets, except the limited revocable license to access the platform in accordance with the Terms of Service.
        </p>
      </section>

      {/* 02. User Content */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — USER CONTENT OWNERSHIP & PLATFORM LICENSE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          You retain all ownership and copyright in the original text, captions, and photographic images you create and upload to AETHER.
        </p>
        <p className="text-sm leading-relaxed font-light">
          By submitting content to AETHER, you grant us a worldwide, non-exclusive, royalty-free, transferable license to store, process, display, and transmit your content solely as necessary to operate the platform, render your profile, and deliver feed items to your Circle.
        </p>
      </section>

      {/* 03. IP Infringement Notice */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — NOTICE & TAKEDOWN OF INFRINGING CONTENT
        </h2>
        <p className="text-sm leading-relaxed font-light">
          If you believe in good faith that any content hosted on AETHER infringes your copyright or intellectual property rights, please send a detailed notice to:
        </p>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs font-mono flex flex-col gap-1">
          <span className="text-white font-semibold">Intellectual Property Inquiries:</span>
          <span className="text-zinc-300">Email: <a href="mailto:cristianvaduva@duck.com" className="underline text-white">cristianvaduva@duck.com</a></span>
          <span className="text-zinc-500">Subject: IP / Copyright Notice — AETHER</span>
        </div>
      </section>
    </article>
  );
}
