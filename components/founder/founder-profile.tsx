import React from 'react';
import { FOUNDER_DATA } from '@/lib/founder';

export const FounderProfile: React.FC = () => {
  const { identity } = FOUNDER_DATA;

  return (
    <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          01 / THE FOUNDER
        </span>
        <span className="font-mono text-[10px] text-zinc-600 uppercase">
          OPERATOR & ARCHITECT
        </span>
      </div>

      <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {identity.name}
          </h2>
          <p className="text-sm text-zinc-300 font-light leading-relaxed">
            {identity.statement}
          </p>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            {identity.regionContext}
          </p>
        </div>

        {/* Operating Disciplines */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col gap-3">
          <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
            OPERATING DISCIPLINES & VERTICALS
          </span>
          <div className="flex flex-wrap gap-2">
            {identity.disciplines.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
