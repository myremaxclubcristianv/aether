import React from 'react';
import { FOUNDER_DATA } from '@/lib/founder';

export const WhyAether: React.FC = () => {
  const { manifesto } = FOUNDER_DATA;

  return (
    <div id="why-aether" className="flex flex-col scroll-mt-12">
      {/* 1. WHY AETHER EXISTS */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.2em] text-emerald-400 uppercase">
            05 / MANIFESTO & ORIGIN
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {manifesto.whyAetherExists.headline}
          </h2>
        </div>

        <div className="flex flex-col gap-4 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
          {manifesto.whyAetherExists.lines.map((line, idx) => (
            <p key={idx} className={idx === 0 || idx === 1 ? 'text-white font-medium' : ''}>
              {line}
            </p>
          ))}
        </div>

        <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-5 flex flex-col gap-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            REAL-WORLD ACTIONS THAT MATTER
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
            {manifesto.whyAetherExists.examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-serif italic text-base sm:text-lg text-zinc-200 border-l-2 border-emerald-500 pl-4 py-1">
          {manifesto.whyAetherExists.conclusion}
        </p>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
            06 / THE FUNDAMENTAL PROBLEM
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-snug">
            {manifesto.theProblem.headline}
          </h2>
          <p className="text-base text-zinc-400 font-light italic">
            {manifesto.theProblem.subheadline}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {manifesto.theProblem.contrasts.map((c, i) => (
            <div
              key={i}
              className="bg-zinc-950/70 border border-zinc-850 rounded-xl p-4 flex flex-col gap-1"
            >
              <span className="text-sm font-semibold text-zinc-300 line-through decoration-zinc-600">
                {c.fake}
              </span>
              <span className="text-xs font-mono text-zinc-400">{c.real}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center font-mono text-xs sm:text-sm text-white font-medium">
          {manifesto.theProblem.primitive}
        </div>
      </section>

      {/* 3. WHAT AETHER DOES */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
            07 / THE ACTION ENGINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            WHAT AETHER DOES
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            {manifesto.whatAetherDoes.loopSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {manifesto.whatAetherDoes.steps.map((step, idx) => (
            <div
              key={step.key}
              className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-500 font-bold">
                  0{idx + 1}
                </span>
                <span className="font-mono text-xs font-semibold text-white">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY IT MATTERS & 4 MAJOR BENEFITS */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
            08 / VALUE & BENEFITS
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {manifesto.whyItMatters.headline}
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            {manifesto.whyItMatters.body}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {manifesto.benefits.map((b) => (
            <div
              key={b.number}
              className="bg-zinc-950/70 border border-zinc-850 rounded-xl p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-500">{b.number}</span>
                <span className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                  {b.title}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-2">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-400 border border-zinc-800 px-4 py-2 rounded-full bg-zinc-900/60">
            {manifesto.benefits.length > 0 && manifesto.tagline}
          </span>
        </div>
      </section>

      {/* 5. WHY I BUILT AETHER (FOUNDER PERSPECTIVE) */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
            09 / FOUNDER PERSPECTIVE
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {manifesto.whyIBuiltIt.title}
          </h2>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
          {manifesto.whyIBuiltIt.copy.map((paragraph, i) => (
            <p
              key={i}
              className={`text-sm sm:text-base leading-relaxed ${
                i === 1 ? 'text-white font-medium' : 'text-zinc-300 font-light'
              }`}
            >
              {paragraph}
            </p>
          ))}

          <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Cristian Văduva</span>
            <span>Founder & Architect</span>
          </div>
        </div>
      </section>

      {/* 6. THE BIGGER VISION & ECOSYSTEM CONNECTION */}
      <section className="py-12 border-b border-zinc-900 flex flex-col gap-6">
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
              {manifesto.biggerVision.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {manifesto.biggerVision.title}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            {manifesto.biggerVision.statement}
          </p>

          <div className="flex flex-col gap-2 pl-4 border-l-2 border-zinc-700">
            {manifesto.biggerVision.questions.map((q, idx) => (
              <span key={idx} className="font-mono text-xs sm:text-sm text-white font-medium">
                {q}
              </span>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-900 flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {manifesto.ecosystemConnection.title}
            </span>
            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {manifesto.ecosystemConnection.body}
            </p>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              {manifesto.ecosystemConnection.contrast}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
