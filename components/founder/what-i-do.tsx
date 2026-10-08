import React from 'react';
import { FOUNDER_DATA } from '@/lib/founder';

export const WhatIDo: React.FC = () => {
  const { whatIDo } = FOUNDER_DATA;

  return (
    <section className="py-12 border-b border-zinc-900 flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          02 / ADVISORY & SYSTEMS
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          WHAT I DO
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whatIDo.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 transition-all rounded-xl p-5 flex flex-col justify-between gap-5 group"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3">
                <h3 className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white uppercase">
                  {item.title}
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">
                  {item.platforms.length} PLATFORMS
                </span>
              </div>

              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                {item.description}
              </p>

              {/* Core Services List */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  Core Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.services.map((svc) => (
                    <span
                      key={svc}
                      className="px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Private Client if present */}
              {item.privateClient && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-900/60">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500/80 font-medium">
                    Private Client Advisory
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.privateClient.map((pc) => (
                      <span
                        key={pc}
                        className="px-2 py-0.5 rounded bg-amber-950/20 border border-amber-900/40 text-[10px] font-mono text-amber-300/80"
                      >
                        {pc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platforms row */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="text-zinc-600">Ecosystem platforms:</span>
              <span className="text-zinc-400 text-right truncate max-w-[200px]">
                {item.platforms.join(' • ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
