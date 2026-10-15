import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';
import { ComplaintReportForm } from '@/components/legal/complaint-report-form';

export const metadata: Metadata = {
  title: 'Community Guidelines & Conduct Standards | AETHER Legal Center',
  description: 'Behavioral standards, anti-harassment rules, image consent, safety policies and reporting procedures on AETHER.',
  alternates: {
    canonical: '/legal/community',
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          STANDARDS, SAFETY & RESPECT
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
          AETHER is built around real-world action, discipline, and authentic accomplishment. It is not an arena for manufactured drama, vanity metrics, or toxic competition. We expect all participants to uphold respect, integrity, authentic effort, and genuine accountability.
        </p>
      </section>

      {/* 02. Standards of Conduct */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — PROHIBITED CONDUCT & ZERO-TOLERANCE VIOLATIONS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          To maintain an environment centered on constructive achievement, the following behaviors are strictly prohibited across all profiles, proofs, comments, and interactions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Harassment, Threats & Abuse</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Targeting other individuals with abusive language, intimidation, stalking, defamation, extortion, or incitement to self-harm is strictly banned.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Impersonation & Deceptive Accounts</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Creating accounts masquerading as another person, entity, or public figure, or misrepresenting credentials to mislead the Circle is prohibited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Non-Consensual Imagery & Privacy</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Uploading images or media containing other identifiable people without their permission, non-consensual intimate imagery, or private personal data is strictly forbidden.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Fake Proofs & Falsified Progress</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Uploading fabricated images, claiming credit for others&apos; work, or deploying bots to artificially inflate Flex Scores or simulate daily streaks degrades trust.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Hate Speech & Discrimination</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Content attacking, demeaning, or inciting violence against individuals based on race, ethnicity, nationality, religion, sex, gender identity, sexual orientation, or disability is banned.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1.5">
            <span className="font-mono text-white font-semibold">Unlawful Content & Fraud</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Promoting illegal acts, financial scams, pyramid schemes, intellectual property infringement, or dangerous activities is strictly prohibited.
            </p>
          </div>
        </div>
      </section>

      {/* 03. Realistic Moderation Procedures */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — MODERATION PROCEDURES & ENFORCEMENT
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER prioritizes the safety and integrity of its members. Reports submitted through our verified reporting interface or legal channels are reviewed methodically by platform administration.
        </p>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          <strong className="text-white font-medium">Transparency Statement:</strong> We do not employ automated censorship algorithms or claim 24/7 live-staffed monitoring. All complaints are evaluated by human platform administrators based on clear factual evidence and context.
        </p>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2 text-xs font-light">
          <span className="font-mono text-white font-semibold uppercase tracking-wider text-[11px]">
            Potential Enforcement Actions
          </span>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-zinc-300">
            <li><strong className="text-white">Content Removal:</strong> Deletion of infringing, abusive, or non-compliant Proof records.</li>
            <li><strong className="text-white">Score & Streak Forfeiture:</strong> Removal of illegitimate Flex Score points and streak cancellation.</li>
            <li><strong className="text-white">Temporary Restriction:</strong> Temporary limitation on uploading Proofs or interacting with the Circle.</li>
            <li><strong className="text-white">Permanent Suspension:</strong> Complete account termination and deletion for severe or repeated violations.</li>
          </ul>
        </div>
      </section>

      {/* 04. Reporting Form */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          04 — REPORT A COMMUNITY VIOLATION
        </h2>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          If you encounter abusive behavior, impersonation, non-consensual images, or guidelines violations, use the reporting form below to dispatch an alert directly to platform administration:
        </p>
        <div className="mt-2">
          <ComplaintReportForm defaultType="harassment" title="Report Community Guidelines Violation" />
        </div>
      </section>

      {/* 05. Appeals */}
      <section className="flex flex-col gap-3 border-t border-zinc-900 pt-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          05 — FAIR REVIEW & APPEALS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          If you believe your content was restricted or your account was penalized in error, you may request an administrative re-evaluation by contacting <a href="mailto:cristianvaduva@duck.com" className="text-white underline">cristianvaduva@duck.com</a>. Please provide your username, the relevant Proof ID, and an explanation of the context.
        </p>
      </section>
    </article>
  );
}
