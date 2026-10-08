import React from 'react';
import Link from 'next/link';
import { LEGAL_DOCS, LEGAL_METADATA } from '@/lib/legal';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl lg:max-w-4xl mx-auto border-x border-zinc-900/80 bg-black text-white min-h-screen selection:bg-zinc-800 selection:text-white shadow-2xl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/85 border-b border-zinc-900/80 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <Link href="/" className="font-mono text-xs tracking-[0.35em] text-zinc-400 hover:text-white transition-colors uppercase font-medium">
            AETHER
          </Link>
          <span className="text-zinc-700 font-mono text-xs">/</span>
          <Link href="/legal" className="font-mono text-xs tracking-wider text-zinc-300 hover:text-white transition-colors uppercase">
            LEGAL CENTER
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 uppercase">
            {LEGAL_METADATA.version}
          </span>
          <Link
            href="/"
            className="text-[11px] font-mono tracking-wider text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            HOME
          </Link>
          <Link
            href="/legal/data-rights"
            className="text-[11px] font-mono tracking-wider bg-white text-black hover:bg-zinc-200 transition-all px-3 py-1.5 rounded-full font-medium"
          >
            DATA RIGHTS
          </Link>
        </div>
      </header>

      {/* Horizontal Category Nav for Fast Access */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 px-5 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <Link
          href="/legal"
          className="px-3 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase whitespace-nowrap bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 transition-colors"
        >
          Overview
        </Link>
        {LEGAL_DOCS.map((doc) => (
          <Link
            key={doc.id}
            href={doc.slug}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase whitespace-nowrap text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors"
          >
            {doc.title}
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 px-5 sm:px-8 py-8 sm:py-12 overflow-x-hidden">
        {children}
      </main>

      {/* Legal Center Footer */}
      <footer className="border-t border-zinc-900 px-5 sm:px-8 py-8 flex flex-col gap-6 text-zinc-500 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs tracking-[0.35em] text-white uppercase font-medium">
              AETHER LEGAL CENTER
            </span>
            <p className="text-[11px] font-light text-zinc-500">
              Transparency, privacy and governance standards for the AETHER social proof layer.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Updated {LEGAL_METADATA.lastUpdated}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400">
          <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          <Link href="/legal/community" className="hover:text-white transition-colors">Community Guidelines</Link>
          <Link href="/legal/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link>
          <Link href="/legal/proof-policy" className="hover:text-white transition-colors">Proof Policy</Link>
          <Link href="/legal/intellectual-property" className="hover:text-white transition-colors">Intellectual Property</Link>
          <Link href="/legal/data-rights" className="hover:text-white transition-colors">Data Subject Rights</Link>
          <Link href="/legal/delete-account" className="hover:text-white transition-colors">Account Deletion</Link>
          <Link href="/legal/security" className="hover:text-white transition-colors">Security & Disclosure</Link>
          <Link href="/founder" className="hover:text-white transition-colors">Founder Profile</Link>
          <Link href="/" className="hover:text-white transition-colors">Aether Home</Link>
        </div>

        <div className="pt-4 border-t border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-zinc-600">
          <span>© {new Date().getFullYear()} Aether. All rights reserved.</span>
          <span>Inquiries: <a href="mailto:cristianvaduva@duck.com" className="text-zinc-400 hover:text-white underline">cristianvaduva@duck.com</a></span>
        </div>
      </footer>
    </div>
  );
}
