import React from 'react';
import { FOUNDER_DATA } from '@/lib/founder';

export const FounderSocials: React.FC = () => {
  const { socials } = FOUNDER_DATA;

  return (
    <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          11 / CHANNELS
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          FIND ME ONLINE
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {socials.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white group-hover:text-zinc-200">
                {social.platform}
              </span>
              <span className="text-xs text-zinc-500 group-hover:text-white transition-colors">
                ↗
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-zinc-300 truncate">
                {social.handle}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                {social.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
