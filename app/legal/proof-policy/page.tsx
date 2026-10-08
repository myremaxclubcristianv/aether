import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Content & Proof Policy | AETHER Legal Center',
  description: 'Rules regarding user-submitted Proofs, media rights, evidence standards and legal definitions.',
};

export default function ProofPolicyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          EVIDENCE & USER CONTENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          CONTENT & PROOF POLICY
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. What is a Proof? */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — WHAT IS A &quot;PROOF&quot; ON AETHER?
        </h2>
        <p className="text-sm leading-relaxed font-light">
          On AETHER, a <strong>&quot;Proof&quot;</strong> is a user-created digital record intended to document a real-world action, habit, workout, milestone, or achievement (such as completing a run, building a feature, reading a book, or closing a transaction).
        </p>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs font-light flex flex-col gap-2">
          <span className="font-mono text-white font-medium uppercase tracking-wider text-[10px]">
            IMPORTANT LEGAL CLARIFICATION
          </span>
          <p className="text-zinc-300">
            A Proof is a self-submitted representation of action created by an individual user. AETHER is a social proof platform and personal progress tracker; <strong>AETHER does not act as a formal certifying authority, legal notary, or independent auditor of user claims</strong>.
          </p>
          <p className="text-zinc-400">
            The word &quot;verified&quot; or &quot;proof&quot; in product UI refers exclusively to technical verification that an authentic image file or payload was successfully attached and signed by the user&apos;s account, and not to external legal truth certification.
          </p>
        </div>
      </section>

      {/* 02. User Responsibility & Media Rights */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — USER RESPONSIBILITY & UPLOAD RIGHTS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          You are solely responsible for the accuracy, legality, and authenticity of any captions, descriptions, or media you upload as Proofs.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 font-light">
          <li><strong>Image Ownership:</strong> You must own or possess all necessary rights, licenses, and permissions to upload any photographs or screenshots submitted to AETHER.</li>
          <li><strong>Third-Party Privacy:</strong> You must not upload photos containing recognizable individuals without their consent.</li>
          <li><strong>No Copyright Violations:</strong> Uploading stock photography, internet images, or third-party intellectual property disguised as your personal achievement is strictly prohibited.</li>
        </ul>
      </section>

      {/* 03. Removal of Content */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — CONTENT MODERATION & REMOVAL
        </h2>
        <p className="text-sm leading-relaxed font-light">
          We reserve the right to remove any Proof, media file, or caption that violates these rules or our{' '}
          <Link href="/legal/community" className="text-white underline">
            Community Guidelines
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
