import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Community Guidelines | AETHER Legal Center',
  description: 'Behavioral standards, safety rules and ethical principles for people using AETHER.',
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          STANDARDS & CULTURE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          COMMUNITY GUIDELINES
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. The Core Spirit */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — THE SPIRIT OF AETHER: PROOF OVER POPULARITY
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER is built around real-world action, discipline, and authentic accomplishment. It is not an arena for manufactured drama, vanity metrics, or toxic competition. We expect all participants to uphold respect, integrity, and genuine accountability.
        </p>
      </section>

      {/* 02. Standards of Conduct */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — STANDARDS OF CONDUCT & ZERO-TOLERANCE RULES
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">No Harassment or Bullying</span>
            <p className="text-zinc-400 text-[11px]">
              Targeting other individuals with abusive language, intimidation, stalking, defamation, or public shaming is strictly prohibited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">No Fake or Deceptive Proofs</span>
            <p className="text-zinc-400 text-[11px]">
              Submitting fabricated images, falsified progress, or taking credit for other people&apos;s achievements undermines the purpose of the platform.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">No Hate Speech or Discrimination</span>
            <p className="text-zinc-400 text-[11px]">
              Content promoting violence, discrimination, or hatred based on race, ethnicity, nationality, religion, sex, sexual orientation, or disability is banned.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">No Illegal or Harmful Activities</span>
            <p className="text-zinc-400 text-[11px]">
              Content depicting self-harm, illegal acts, weapons trafficking, fraud, non-consensual imagery, or dangerous activities is strictly prohibited.
            </p>
          </div>
        </div>
      </section>

      {/* 03. Enforcement */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — ENFORCEMENT & REPORTING
        </h2>
        <p className="text-sm leading-relaxed font-light">
          Violations of these guidelines may result in content removal, Flex Score resets, streak disqualification, temporary suspension, or permanent account termination.
        </p>
        <p className="text-xs text-zinc-400 font-light">
          To report abusive content or violations, please contact{' '}
          <a href="mailto:cristianvaduva@duck.com" className="text-white underline">
            cristianvaduva@duck.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
