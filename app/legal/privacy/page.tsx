import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy | AETHER Legal Center',
  description: 'How AETHER collects, processes, protects and retains personal data in accordance with GDPR principles.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          PRIVACY & DATA PROTECTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          PRIVACY POLICY
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
          <span>{LEGAL_METADATA.version}</span>
          <span>•</span>
          <span>Last Updated: {LEGAL_METADATA.lastUpdated}</span>
          <span>•</span>
          <span>Effective: {LEGAL_METADATA.effectiveDate}</span>
        </div>
      </div>

      {/* 01. Who We Are */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          01 — WHO WE ARE & DATA CONTROLLER
        </h2>
        <p className="text-sm leading-relaxed font-light">
          This Privacy Policy explains how personal data is processed in connection with the <strong>AETHER</strong> application, accessible at <code>https://aether-sable-delta.vercel.app</code> and associated domains.
        </p>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Data Controller Information</span>
          <span className="text-white font-medium">{LEGAL_METADATA.controllerPlaceholder}</span>
          <span className="text-zinc-400">Registered Office: {LEGAL_METADATA.registeredAddressPlaceholder}</span>
          <span className="text-zinc-400">Company ID / CUI: {LEGAL_METADATA.registrationNumberPlaceholder}</span>
          <span className="text-zinc-400">Privacy Contact: <a href="mailto:cristianvaduva@duck.com" className="text-white underline">cristianvaduva@duck.com</a></span>
          <span className="text-zinc-500 mt-1">{LEGAL_METADATA.dpoStatement}</span>
        </div>
      </section>

      {/* 02. What Data We Collect */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          02 — CATEGORIES OF DATA WE PROCESS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER applies data minimization principles. We distinguish clearly between authenticated account data and ephemeral technical data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">A. Account & Profile Data</span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong>Email Address:</strong> Used for account creation, identification, and authentication.</li>
              <li><strong>Password:</strong> Handled strictly through authentication hashing protocols; never stored or visible in plain text.</li>
              <li><strong>Username:</strong> Unique public handle representing your identity in AETHER.</li>
              <li><strong>Bio & Avatar:</strong> Optional profile description and uploaded image URL.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">B. Proof & Progress Data</span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong>Proof Submissions:</strong> Category (Fitness, Coding, Reading, Business, etc.), description caption, timestamp.</li>
              <li><strong>Proof Media:</strong> Uploaded evidence images stored securely.</li>
              <li><strong>Flex Score & Streaks:</strong> Calculated score increments and daily consistency streak counters.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">C. Social Graph Data</span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong>Follow Relationships:</strong> Record of who you follow and who follows your public profile.</li>
              <li><strong>Circle Interactions:</strong> Chronological feed display of achievements within your followed circle.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-medium">D. Ephemeral Technical & Analytics Data</span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong>IP Address:</strong> Processed ephemerally for sliding-window rate limiting, DDoS defense, and country/city resolution; not stored as marketing profiles.</li>
              <li><strong>Device & User Agent:</strong> Browser name, operating system, device class, viewport resolution.</li>
              <li><strong>Attribution Data:</strong> Referrer URL, UTM parameters (source, medium, campaign) stored in session storage.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 03. Telegram & Activity Intelligence Notifications */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — SERVER-SIDE ACTIVITY & SECURITY NOTIFICATIONS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER operates server-side operational intelligence notifications routed to a dedicated Telegram destination managed by the founder/operator.
        </p>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2 text-xs font-light">
          <p className="text-zinc-300">
            <strong>What is transmitted:</strong> Operational event summaries including timestamp, page path, location (country/city resolved from edge headers), device category, acquisition attribution (e.g. UTM source), and relevant authenticated handle for product actions (e.g. Proof creation, new follow).
          </p>
          <p className="text-zinc-400">
            <strong>What is never transmitted:</strong> Passwords, session cookies, auth tokens, private encryption keys, payment data, or raw user communications.
          </p>
          <p className="text-zinc-500 font-mono text-[11px]">
            Legal Basis: Legitimate interest (system monitoring, platform security, real-time abuse prevention, and operational visibility).
          </p>
        </div>
      </section>

      {/* 04. Purposes and Legal Bases Table */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          04 — PURPOSES OF PROCESSING & LEGAL BASES (GDPR ART. 6)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-850 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900/80 text-white font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 border-b border-zinc-800">Processing Purpose</th>
                <th className="p-3 border-b border-zinc-800">Categories of Data</th>
                <th className="p-3 border-b border-zinc-800">Legal Basis (GDPR Art. 6)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-light text-zinc-300">
              <tr>
                <td className="p-3 font-medium text-white">Account Creation & Authentication</td>
                <td className="p-3">Email, password hash, username</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(b) — Performance of Contract</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Proof Creation, Flex Score & Feed Display</td>
                <td className="p-3">Proof captions, category, images, scores, streaks</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(b) — Performance of Contract</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Social Graph & Circle Interactions</td>
                <td className="p-3">Follower/Following relationships, public profiles</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(b) — Performance of Contract</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Platform Security, Rate Limiting & Abuse Defense</td>
                <td className="p-3">Ephemeral IP, headers, device string, security logs</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(f) — Legitimate Interests</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Founder Inquiries & Contact Forms</td>
                <td className="p-3">Name, email, phone, interests, message</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(b) — Steps prior to Contract / User Request</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Internal Telemetry & Operational Analytics</td>
                <td className="p-3">Aggregated visit counts, conversion funnel metrics</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(f) — Legitimate Interests</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Legal Compliance & Dispute Resolution</td>
                <td className="p-3">Account records, audit logs, erasure requests</td>
                <td className="p-3 font-mono text-zinc-400">Art. 6(1)(c) — Legal Obligation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 05. Third-Party Service Providers */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          05 — DATA RECIPIENTS & INFRASTRUCTURE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          We engage trusted third-party infrastructure providers that act as Data Processors or separate controllers where necessary to deliver the service:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-light">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-semibold">Supabase Inc.</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Database & Storage Provider</span>
            <p className="text-zinc-400 text-[11px] mt-1">
              Provides managed PostgreSQL database, authentication services, row-level security enforcement, and encrypted media storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-semibold">Vercel Inc.</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Hosting & Edge Runtime</span>
            <p className="text-zinc-400 text-[11px] mt-1">
              Provides global edge hosting, serverless compute execution, SSL termination, and geographic header resolution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-1">
            <span className="font-mono text-white font-semibold">Telegram Messenger Inc.</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Notification Dispatch API</span>
            <p className="text-zinc-400 text-[11px] mt-1">
              Receives server-side operational intelligence notifications dispatched via the official Telegram Bot API to the operator&apos;s secured channel.
            </p>
          </div>
        </div>
      </section>

      {/* 06. Data Retention */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          06 — DATA RETENTION PERIODS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400 font-light">
          <li><strong>Active Account Data:</strong> Retained for the lifetime of your account until deletion is requested.</li>
          <li><strong>Proofs & Uploaded Media:</strong> Retained while your account remains active or until individual proofs are deleted.</li>
          <li><strong>Ephemeral Analytics & IP Data:</strong> Processed in memory for rate-limiting windows (e.g. 1–10 minutes) and not retained in permanent relational profiles.</li>
          <li><strong>Contact Inquiries:</strong> Retained for the duration necessary to handle the communication and associated business follow-up.</li>
          <li><strong>Post-Deletion Backups:</strong> System backups purge deleted records in accordance with standard disaster-recovery backup rotation schedules.</li>
        </ul>
      </section>

      {/* 07. User Rights under GDPR */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          07 — YOUR RIGHTS UNDER GDPR / RGPD
        </h2>
        <p className="text-sm leading-relaxed font-light">
          As a data subject in the European Union / Romania, you possess explicit rights regarding your personal data:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Access (Art. 15)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Obtain confirmation and a copy of personal data processed about you.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Rectification (Art. 16)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Correct inaccurate or incomplete profile and account details.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Erasure / &quot;Be Forgotten&quot; (Art. 17)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Request permanent deletion of your account and associated personal data.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Restrict Processing (Art. 18)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Limit processing under certain conditions defined by law.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Data Portability (Art. 20)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Receive your personal data in a structured, commonly used format.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
            <span className="font-mono text-white font-medium">Right to Object (Art. 21)</span>
            <p className="text-zinc-400 text-[11px] mt-1">Object to processing based on legitimate interests at any time.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span>To exercise any of these rights, use our dedicated portal or email us directly:</span>
          <Link
            href="/legal/data-rights"
            className="px-4 py-2 rounded-full bg-white text-black font-mono text-[10px] uppercase font-semibold whitespace-nowrap text-center"
          >
            Exercise Rights
          </Link>
        </div>
      </section>

      {/* 08. Supervisory Authority */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          08 — SUPERVISORY AUTHORITY & COMPLAINTS
        </h2>
        <p className="text-sm leading-relaxed font-light">
          If you believe your data protection rights have been infringed, you have the right to lodge a complaint with the competent supervisory authority:
        </p>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-xs font-mono flex flex-col gap-1">
          <span className="text-white font-semibold">{LEGAL_METADATA.supervisoryAuthority.name}</span>
          <span className="text-zinc-400">{LEGAL_METADATA.supervisoryAuthority.address}</span>
          <a
            href={LEGAL_METADATA.supervisoryAuthority.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            {LEGAL_METADATA.supervisoryAuthority.website} ↗
          </a>
        </div>
      </section>

      {/* 09. Children and Automated Decision Making */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          09 — MINORS & AUTOMATED DECISION-MAKING
        </h2>
        <p className="text-sm leading-relaxed font-light">
          <strong>Minors:</strong> AETHER is not directed at individuals under the age of 16 (or applicable age of digital consent in your jurisdiction). We do not knowingly collect personal data from minors.
        </p>
        <p className="text-sm leading-relaxed font-light">
          <strong>Automated Decision-Making:</strong> AETHER does not make decisions producing legal effects or similarly significant effects concerning users based solely on automated processing or AI profiling.
        </p>
      </section>
    </article>
  );
}
