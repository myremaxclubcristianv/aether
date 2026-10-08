import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FounderHero } from '@/components/founder/founder-hero';
import { FounderProfile } from '@/components/founder/founder-profile';
import { WhatIDo } from '@/components/founder/what-i-do';
import { WhatIveBuilt } from '@/components/founder/what-ive-built';
import { EcosystemMap } from '@/components/founder/ecosystem-map';
import { WhyAether } from '@/components/founder/why-aether';
import { WorkWithMe } from '@/components/founder/work-with-me';
import { FounderSocials } from '@/components/founder/founder-socials';
import { FounderCta } from '@/components/founder/founder-cta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cristian Văduva — Founder, Builder & Advisor | AETHER',
  description:
    'Cristian Văduva — founder, advisor and builder across real estate, insurance, finance and technology. Explore AETHER and the digital ecosystem behind it.',
  openGraph: {
    title: 'Cristian Văduva — Founder, Builder & Advisor | AETHER',
    description:
      'Cristian Văduva — founder, advisor and builder across real estate, insurance, finance and technology. Explore AETHER and the digital ecosystem behind it.',
    type: 'profile',
    siteName: 'AETHER',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cristian Văduva — Founder, Builder & Advisor | AETHER',
    description:
      'Cristian Văduva — founder, advisor and builder across real estate, insurance, finance and technology. Explore AETHER and the digital ecosystem behind it.',
  },
};

export default function FounderPage() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-xl lg:max-w-2xl mx-auto border-x border-zinc-900/80 bg-black text-white min-h-screen selection:bg-zinc-800 selection:text-white shadow-2xl">
      {/* Sticky Editorial Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/85 border-b border-zinc-900/80 px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-xs tracking-[0.35em] text-zinc-400 group-hover:text-white transition-colors uppercase font-medium">
            AETHER
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">/</span>
          <span className="font-mono text-[10px] tracking-wider text-zinc-300 uppercase">
            FOUNDER
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[11px] font-mono tracking-wider text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            HOME
          </Link>
          <a
            href="#work-with-me"
            className="text-[11px] font-mono tracking-wider bg-white text-black hover:bg-zinc-200 transition-all px-3 py-1.5 rounded-full font-medium"
          >
            CONTACT
          </a>
        </div>
      </header>

      {/* Main Narrative Body */}
      <main className="flex flex-col flex-1 px-5 pb-16 overflow-x-hidden">
        <FounderHero />
        <FounderProfile />
        <WhatIDo />
        <WhatIveBuilt />
        <EcosystemMap />
        <WhyAether />
        <WorkWithMe />
        <FounderSocials />
        <FounderCta />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-zinc-900 px-5 py-8 flex flex-col gap-6 text-zinc-500 text-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.35em] text-white uppercase font-medium">
              CRISTIAN VĂDUVA
            </span>
            <span className="text-zinc-700">•</span>
            <span className="font-mono text-[10px] text-zinc-500">ECOSYSTEM ARCHITECT</span>
          </div>
          <p className="text-[11px] font-light text-zinc-500">
            Building businesses, platforms and systems designed to turn real-world action into real-world value.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Aether Home</Link>
          <Link href="/legal" className="hover:text-white transition-colors">Legal Center</Link>
          <a href="#my-creations" className="hover:text-white transition-colors">Creations</a>
          <a href="#why-aether" className="hover:text-white transition-colors">Why Aether</a>
          <a href="#work-with-me" className="hover:text-white transition-colors">Work With Me</a>
          <a href="https://aixluxury.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AiXLuxury</a>
          <a href="https://os.aixluxury.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AiX OS</a>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/80 text-[10px] font-mono text-zinc-600">
          <span>© {new Date().getFullYear()} Cristian Văduva. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aether Flagship</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
