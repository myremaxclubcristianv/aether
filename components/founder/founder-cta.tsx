import React from 'react';
import Link from 'next/link';

export const FounderCta: React.FC = () => {
  return (
    <section className="py-16 flex flex-col items-center text-center gap-6">
      <div className="flex flex-col gap-2 max-w-md mx-auto">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500">
          EXECUTION & ACTION
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase">
          BUILD SOMETHING REAL.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
          Whether you&apos;re looking to buy, build, protect, finance, fly, invest — or simply create something worth proving — start here.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="#work-with-me"
          className="h-11 px-7 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase font-semibold"
        >
          Work With Cristian
        </a>

        <Link
          href="/"
          className="h-11 px-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase"
        >
          Explore Aether
        </Link>

        <a
          href="#my-creations"
          className="h-11 px-6 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center justify-center font-mono text-xs tracking-wider uppercase"
        >
          Explore The Ecosystem
        </a>
      </div>
    </section>
  );
};
