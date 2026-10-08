import React from 'react';

export const EcosystemMap: React.FC = () => {
  return (
    <section className="py-12 border-b border-zinc-900 flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          04 / ARCHITECTURAL COMPOSITION
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          ONE FOUNDER. MULTIPLE SYSTEMS.
        </h2>
        <p className="text-xs text-zinc-400 font-light max-w-lg leading-relaxed">
          An integrated ecosystem spanning real-world assets, advisory, specialized intelligence verticals and digital identity.
        </p>
      </div>

      {/* Visual Architectural Map Container */}
      <div className="w-full bg-zinc-950/80 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

        {/* Level 1: Root Founder */}
        <div className="flex justify-center">
          <div className="bg-white text-black px-6 py-3 rounded-xl flex flex-col items-center gap-0.5 shadow-lg">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
              ORIGIN & FOUNDER
            </span>
            <span className="font-sans text-sm sm:text-base font-bold tracking-tight">
              CRISTIAN VĂDUVA
            </span>
          </div>
        </div>

        {/* Connecting Lines */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-zinc-800" />
        </div>

        {/* Level 2: Dual Pillars - AiXLuxury Ecosystem & AETHER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto w-full">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
              PHYSICAL ASSETS & ADVISORY
            </span>
            <span className="text-sm font-semibold text-white">AiXLuxury Ecosystem</span>
            <span className="text-[10px] text-zinc-400 font-light">
              Real Estate • Insurance • Credit • Capital
            </span>
          </div>

          <div className="bg-zinc-900/90 border border-white/20 rounded-xl p-4 flex flex-col items-center text-center gap-1.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 m-2 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
              SOCIAL IDENTITY & ACTION
            </span>
            <span className="text-sm font-semibold text-white">AETHER</span>
            <span className="text-[10px] text-zinc-400 font-light">
              Proofs • Flex Score • Progress Graph
            </span>
          </div>
        </div>

        {/* Connecting Lines */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-zinc-800" />
        </div>

        {/* Level 3: Vertical Ecosystem Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex flex-col gap-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">REAL ESTATE</span>
            <span className="text-xs font-medium text-zinc-200">HomeFind</span>
            <span className="text-[10px] text-zinc-400">Dubai • Luxury</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex flex-col gap-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">INSURANCE</span>
            <span className="text-xs font-medium text-zinc-200">Insurance Advisory</span>
            <span className="text-[10px] text-zinc-400">Private Client</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex flex-col gap-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">FINANCE</span>
            <span className="text-xs font-medium text-zinc-200">CV Finance</span>
            <span className="text-[10px] text-zinc-400">Subvenții / Capital</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-850 rounded-lg p-3 flex flex-col gap-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">CONSTRUCTION</span>
            <span className="text-xs font-medium text-zinc-200">Constructions</span>
            <span className="text-[10px] text-zinc-400">Materials Intelligence</span>
          </div>
        </div>

        {/* Level 4: Intelligence Layer & Orbit Systems */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 text-center">
            OPERATING SYSTEM & ORBIT PLATFORMS
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              ⚡ AiX OS (Intelligence Layer)
            </span>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              ✈️ FLY (Aviation)
            </span>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              📡 AiX Media (Growth)
            </span>
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              🌱 Health (Vitality)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
