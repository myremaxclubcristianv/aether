import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service | AETHER Legal Center',
  description: 'The contractual terms and rules governing access to and use of the AETHER platform.',
};

export default function TermsOfServicePage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          CONTRACTUAL TERMS
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          TERMS OF SERVICE
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Acceptance & Eligibility */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — ACCEPTANCE & ELIGIBILITY
        </h2>
        <p className="text-sm leading-relaxed font-light">
          By accessing or using the AETHER platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our{' '}
          <Link href="/legal/privacy" className="text-white underline">
            Privacy Policy
          </Link>
          . If you do not agree to these Terms, you may not access or use the Service.
        </p>
        <p className="text-sm leading-relaxed font-light">
          You must be at least 16 years of age (or the minimum age of digital consent in your jurisdiction) and possess the legal capacity to enter into a binding agreement.
        </p>
      </section>

      {/* 02. Account Registration & Security */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — ACCOUNT REGISTRATION & SECURITY
        </h2>
        <p className="text-sm leading-relaxed font-light">
          When creating an account on AETHER, you agree to provide accurate and truthful information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
        </p>
        <p className="text-sm leading-relaxed font-light">
          You must notify us immediately at <a href="mailto:cristianvaduva@duck.com" className="text-white underline">cristianvaduva@duck.com</a> if you suspect unauthorized access to or compromise of your account.
        </p>
      </section>

      {/* 03. Proofs & User Content */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — PROOFS & USER CONTENT
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER allows you to submit records of personal actions, achievements, captions, and evidence images (&quot;Proofs&quot;). You retain ownership of your user-generated content.
        </p>
        <p className="text-sm leading-relaxed font-light">
          By posting Proofs, you grant AETHER a non-exclusive, worldwide, royalty-free license to host, display, reproduce, and distribute your content solely for the purpose of operating and providing the Service to you and your Circle.
        </p>
        <p className="text-sm leading-relaxed font-light text-zinc-400">
          <strong>Important:</strong> AETHER is a platform for recording personal progress. AETHER does not independently audit, legally verify, or guarantee the factual truth of every user-submitted Proof. See our{' '}
          <Link href="/legal/proof-policy" className="text-white underline">
            Content & Proof Policy
          </Link>
          .
        </p>
      </section>

      {/* 04. Prohibited Conduct */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          04 — PROHIBITED CONDUCT
        </h2>
        <p className="text-sm leading-relaxed font-light">
          You agree not to engage in any of the following prohibited behaviors:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 font-light">
          <li>Posting fraudulent, deceptive, or maliciously fabricated Proofs intended to manipulate platform metrics.</li>
          <li>Harassment, threats, hate speech, impersonation, or abusive conduct toward other users.</li>
          <li>Uploading illegal, non-consensual, sexually explicit, or copyright-infringing content.</li>
          <li>Attempting to bypass rate limits, probe vulnerabilities, or scrape platform data without authorization.</li>
          <li>Using automated scripts or bots to manipulate Flex Scores, streaks, or follower counts.</li>
        </ul>
        <p className="text-xs text-zinc-400 mt-1">
          For full details, review our{' '}
          <Link href="/legal/community" className="text-white underline">
            Community Guidelines
          </Link>{' '}
          and{' '}
          <Link href="/legal/acceptable-use" className="text-white underline">
            Acceptable Use Policy
          </Link>
          .
        </p>
      </section>

      {/* 05. Platform Ownership */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          05 — PLATFORM INTELLECTUAL PROPERTY
        </h2>
        <p className="text-sm leading-relaxed font-light">
          The AETHER name, logos, visual identity, software code, algorithms (including the Flex Score engine), designs, and user interface are the proprietary intellectual property of the operator and protected by intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any portion of the platform without prior written consent.
        </p>
      </section>

      {/* 06. Disclaimers & Limitation of Liability */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          06 — DISCLAIMERS & LIMITATION OF LIABILITY
        </h2>
        <p className="text-sm leading-relaxed font-light">
          THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AETHER DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="text-sm leading-relaxed font-light">
          IN NO EVENT SHALL AETHER OR ITS OPERATOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
        </p>
      </section>

      {/* 07. Suspension & Termination */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          07 — SUSPENSION & TERMINATION
        </h2>
        <p className="text-sm leading-relaxed font-light">
          We reserve the right to suspend or terminate your account or access to the Service at any time for violation of these Terms, abusive behavior, or security risks.
        </p>
        <p className="text-sm leading-relaxed font-light">
          You may terminate your account at any time via the{' '}
          <Link href="/legal/delete-account" className="text-white underline">
            Account Deletion Portal
          </Link>
          .
        </p>
      </section>

      {/* 08. Governing Law & Jurisdiction */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          08 — GOVERNING LAW & JURISDICTION
        </h2>
        <p className="text-sm leading-relaxed font-light">
          These Terms and any disputes arising out of or related to the Service shall be governed by and construed in accordance with the laws of Romania and the European Union, without regard to conflict of law principles. Any legal proceedings shall be submitted to the competent courts of Bucharest, Romania, unless mandatory consumer protection law prescribes another venue.
        </p>
      </section>
    </article>
  );
}
