'use client';

import React, { useState } from 'react';
import { FOUNDER_DATA, ProjectItem } from '@/lib/founder';

const CATEGORIES = [
  'ALL',
  'TECH',
  'REAL ESTATE',
  'INSURANCE',
  'FINANCE',
  'MEDIA',
  'CONSTRUCTION',
  'AVIATION',
  'HEALTH',
] as const;

export const WhatIveBuilt: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const { creations } = FOUNDER_DATA;

  const filtered = activeCategory === 'ALL'
    ? creations
    : creations.filter((c) => c.category === activeCategory);

  return (
    <section id="my-creations" className="py-12 border-b border-zinc-900 flex flex-col gap-8 scroll-mt-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
            03 / THE WORK
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            WHAT I&apos;VE BUILT
          </h2>
        </div>
        <span className="font-mono text-[10px] text-zinc-500 uppercase">
          {filtered.length} OF {creations.length} PLATFORMS
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all shrink-0 ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item: ProjectItem) => {
          const isAether = item.id === 'aether';

          return (
            <div
              key={item.id}
              className={`bg-zinc-950/70 border ${
                isAether ? 'border-zinc-700 shadow-xl' : 'border-zinc-850'
              } hover:border-zinc-700 transition-all rounded-xl p-5 flex flex-col justify-between gap-5 group relative overflow-hidden`}
            >
              {isAether && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {item.name}
                      </h3>
                      {item.highlight && (
                        <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-mono uppercase font-bold">
                          FLAGSHIP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.categoryLabel} • {item.role}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-medium shrink-0 ${
                      item.status === 'LIVE'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  {item.description}
                </p>

                {item.features && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-850 text-[9px] font-mono text-zinc-400"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">
                  {item.url.replace(/^https?:\/\//, '')}
                </span>

                <a
                  href={item.url}
                  target={item.url.startsWith('http') ? '_blank' : undefined}
                  rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Visit Platform</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
