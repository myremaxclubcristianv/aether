import React from 'react';
import { Metadata } from 'next';
import { LEGAL_METADATA } from '@/lib/legal';
import { ComplaintReportForm } from '@/components/legal/complaint-report-form';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Complaints | AETHER Legal Center',
  description: 'Intellectual property ownership, trademark rights, user content licensing, and formal copyright complaint procedures.',
  alternates: {
    canonical: '/legal/intellectual-property',
  },
};

export default function IntellectualPropertyPage() {
  return (
    <article className="flex flex-col gap-10 prose-invert max-w-none text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-900 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
          OWNERSHIP, COPYRIGHT & NOTICE
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          INTELLECTUAL PROPERTY & COMPLAINTS
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-400">
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
        <p className="text-sm leading-relaxed font-light">
          You represent and warrant that you own or possess the necessary rights and consents to publish any image, media, or text submitted as a Proof, and that such content does not infringe the intellectual property or publicity rights of any third party.
        </p>
      </section>

      {/* 03. Copyright & Infringement Complaint Process */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          03 — FORMAL COPYRIGHT & INFRINGEMENT COMPLAINT PROCEDURE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          AETHER respects intellectual property rights and acts promptly upon receiving legitimate, verified infringement claims. If you believe that content hosted on AETHER infringes your copyright, trademark, or related rights, you or your authorized representative may submit a formal complaint.
        </p>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 flex flex-col gap-2.5 text-xs font-light">
          <span className="font-mono text-white font-semibold uppercase tracking-wider text-[11px]">
            Statutory Notice Requirements
          </span>
          <p className="text-zinc-400">
            To ensure swift action, your complaint must include the following information:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-zinc-300">
            <li>Your full legal name, physical or postal address, telephone number, and active email address.</li>
            <li>Specific identification of the copyrighted work claimed to have been infringed (e.g. original publication URL or detailed description).</li>
            <li>Exact location and identifier of the allegedly infringing material on AETHER (the full profile URL, post URL, or Proof ID).</li>
            <li>A good-faith statement that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information provided is accurate and, under penalty of perjury, that you are the rights holder or authorized to act on their behalf.</li>
          </ul>
        </div>
      </section>

      {/* Interactive Report Form */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          04 — SUBMIT AN INFRINGEMENT REPORT
        </h2>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          You can submit your formal notice directly through the verified reporting mechanism below. Submissions are dispatched securely to platform administration for review.
        </p>
        <div className="mt-2">
          <ComplaintReportForm defaultType="copyright" title="File Intellectual Property / Copyright Notice" />
        </div>
      </section>

      {/* 05. Counter-Notice & Appeals */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          05 — COUNTER-NOTICE & DISPUTE APPEAL PROCEDURE
        </h2>
        <p className="text-sm leading-relaxed font-light">
          If you believe your content was removed or disabled as a result of mistake or misidentification, you may submit a formal Counter-Notice to platform administration at <a href="mailto:cristianvaduva@duck.com" className="text-white underline">cristianvaduva@duck.com</a>.
        </p>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          Your counter-notice must include your contact information, identification of the removed Proof, a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake, and your consent to legal jurisdiction.
        </p>
      </section>

      {/* 06. Operational & Legal Status Disclosure */}
      <section className="flex flex-col gap-3 border-t border-zinc-900 pt-6 text-xs text-zinc-400 font-mono">
        <span className="text-zinc-400 font-semibold uppercase tracking-wider">
          PLATFORM & OPERATOR DISCLOSURE
        </span>
        <p className="leading-relaxed">
          Operator: Cristian Văduva (Founder & Platform Architect).<br />
          Contact: cristianvaduva@duck.com • +43 650 953 6345.<br />
          Formal designation status: External designated DMCA agent / legal entity registration pending confirmation ([LEGAL ENTITY & DESIGNATED AGENT PENDING CONFIRMATION]). All submissions are reviewed directly by the platform operator.
        </p>
      </section>
    </article>
  );
}
