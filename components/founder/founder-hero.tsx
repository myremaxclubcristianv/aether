import React from 'react';
import { FOUNDER_DATA } from '@/lib/founder';

export const FounderHero: React.FC = () => {
  const { identity } = FOUNDER_DATA;

  return (
    <section className="pt-10 pb-12 flex flex-col items-start border-b border-zinc-900 relative">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>FOUNDER ARCHIVE & IDENTITY</span>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-sans">
          {identity.name}
        </h1>
        <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-zinc-400 uppercase font-medium">
          {identity.title}
        </p>
      </div>

      <div className="max-w-xl flex flex-col gap-4 mb-8">
        <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
          {identity.tagline}
        </p>
        <p className="font-serif italic text-sm sm:text-base text-zinc-400 border-l-2 border-zinc-700 pl-3">
          {identity.anchor}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <a
          href="#work-with-me"
          className="h-10 px-5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase font-semibold text-center"
        >
          Work With Cristian
        </a>
        <a
          href="#my-creations"
          className="h-10 px-5 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase text-center"
        >
          Explore Creations
        </a>
        <a
          href="#why-aether"
          className="h-10 px-4 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center justify-center font-mono text-xs tracking-wider uppercase text-center"
        >
          Why Aether ↓
        </a>
      </div>
    </section>
  );
};
