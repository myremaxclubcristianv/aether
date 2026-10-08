import React from 'react';
import Link from 'next/link';
import { FaqAccordion } from '@/components/landing/faq-accordion';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aether — The Instagram for What You Actually Achieve',
  description: "Your life isn't a feed. It's what you do. Track real progress. Turn actions into Proofs. Build your Flex Score. See what your Circle is actually accomplishing.",
};

export default async function RootPage() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-xl lg:max-w-2xl mx-auto border-x border-zinc-900/80 bg-black text-white min-h-screen selection:bg-zinc-800 selection:text-white shadow-2xl">
      {/* Top Sticky Product Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/80 border-b border-zinc-900/80 px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-xs tracking-[0.35em] text-zinc-400 group-hover:text-white transition-colors uppercase font-medium">
            AETHER
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/founder"
            className="text-[11px] font-mono tracking-wider text-zinc-400 hover:text-white transition-colors px-2 py-1 uppercase"
          >
            FOUNDER
          </Link>
          <Link
            href="/login"
            className="text-[11px] font-mono tracking-wider text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            LOG IN
          </Link>
          <Link
            href="/login"
            className="text-[11px] font-mono tracking-wider bg-white text-black hover:bg-zinc-200 transition-all px-3 py-1.5 rounded-full font-medium"
          >
            GET STARTED
          </Link>
        </div>
      </header>

      <main className="flex flex-col flex-1 px-5 pb-20 overflow-x-hidden">
        {/* =========================================================================
            1. HERO SECTION
           ========================================================================= */}
        <section className="pt-12 pb-14 flex flex-col items-start border-b border-zinc-900">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>THE SOCIAL LAYER FOR ACTION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.15] mb-4">
            The Instagram for what you{' '}
            <span className="text-zinc-400 italic font-serif">actually achieve.</span>
          </h1>

          <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8 max-w-sm">
            Your life isn&apos;t a feed of curated appearances. It&apos;s what you do. Track real progress, turn actions into Proofs, build your Flex Score, and see what your Circle is accomplishing.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-10">
            <Link
              href="/login"
              className="h-11 px-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase font-semibold text-center"
            >
              Get Started
            </Link>
            <a
              href="#how-it-works"
              className="h-11 px-6 rounded-full bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 transition-all flex items-center justify-center font-mono text-xs tracking-wider uppercase text-center"
            >
              See How It Works
            </a>
          </div>

          {/* Live Product Visual Mockup */}
          <div className="w-full bg-zinc-950/60 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-[10px] text-zinc-300">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white">@alex</span>
                  <span className="text-[10px] font-mono text-zinc-500">Fitness • 2h ago</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-emerald-400 font-medium">+15 FLEX</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              10km tempo run completed at dawn. 4:45/km pace maintained across the entire route.
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>Verified Image Proof</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>Total Flex: <strong className="text-white">45</strong></span>
                <span>•</span>
                <span>Streak: <strong className="text-orange-400">4d 🔥</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. PHILOSOPHY: POSTS VS PROOFS
           ========================================================================= */}
        <section className="py-14 border-b border-zinc-900 flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              01 • PHILOSOPHY
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Social media became very good at showing what people want to be seen doing.
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              Aether is built around what you <strong className="text-white font-normal">actually do</strong>. Less performance, more proof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Traditional Social</span>
                <span className="text-xs text-zinc-600">✕</span>
              </div>
              <h3 className="text-sm font-medium text-zinc-300">The Post</h3>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Something published for external validation. Crafted for the algorithm, staged for appearance, forgotten by tomorrow.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">Aether System</span>
                <span className="text-xs text-emerald-400">✓</span>
              </div>
              <h3 className="text-sm font-medium text-white">The Proof</h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Something you actually accomplished. Tangible, categorized, timestamped, and contributing to your measurable Flex Score.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. WHAT IS A PROOF?
           ========================================================================= */}
        <section id="proofs" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              02 • THE UNIT OF ACTION
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Every Proof is an objective record of real effort.
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              A Proof captures an action you completed across 6 fundamental life domains:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { cat: 'Fitness', desc: 'Runs, lifting, conditioning, martial arts' },
              { cat: 'Learning', desc: 'Books read, courses finished, research' },
              { cat: 'Creating', desc: 'Design, writing, art, production' },
              { cat: 'Building', desc: 'Code shipped, products built, craft' },
              { cat: 'Lifestyle', desc: 'Nutrition, habits, morning routines' },
              { cat: 'Achievement', desc: 'Milestones, milestones reached' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col gap-1">
                <span className="text-xs font-medium text-white">{item.cat}</span>
                <span className="text-[10px] text-zinc-500 font-light leading-normal">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Proof Architecture</h4>
            <ul className="text-xs text-zinc-400 font-light space-y-1.5">
              <li>• <strong className="text-white font-normal">Category tag:</strong> Specifies the domain of effort.</li>
              <li>• <strong className="text-white font-normal">Concise caption:</strong> Describes what was accomplished.</li>
              <li>• <strong className="text-white font-normal">Optional image:</strong> Visual proof stored in secure private folders.</li>
              <li>• <strong className="text-white font-normal">UTC Timestamp:</strong> Immutable chronological verification.</li>
            </ul>
          </div>
        </section>

        {/* =========================================================================
            4. FLEX SCORE & STREAKS
           ========================================================================= */}
        <section id="flex-score" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              03 • MEASURABLE MOMENTUM
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Flex Score turns discipline into a clear, visible signal.
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              Flex Score is not a measure of self-worth. It is a transparent, objective indicator of continuous activity and disciplined momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 rounded-xl bg-zinc-950/50 border border-zinc-900 flex flex-col justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-white">+10</span>
                <h4 className="text-xs font-medium text-zinc-300 mt-1">Standard Proof</h4>
                <p className="text-[11px] text-zinc-500 font-light mt-1 leading-relaxed">
                  Awarded for logging a verified action with category and description.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950/50 border border-zinc-900 flex flex-col justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-400">+15</span>
                <h4 className="text-xs font-medium text-zinc-300 mt-1">Visual Proof</h4>
                <p className="text-[11px] text-zinc-500 font-light mt-1 leading-relaxed">
                  Awarded when a supporting photo or screenshot is attached.
                </p>
              </div>
            </div>
          </div>

          <div id="streaks" className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-850 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Daily Streaks</span>
              <span className="text-[11px] text-zinc-400 font-light mt-0.5">
                A clean reminder that progress compounds with consistency.
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-orange-400 font-medium">
              🔥 ACTIVE
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. CIRCLE: SOCIAL WITHOUT THE VANITY
           ========================================================================= */}
        <section id="circle" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              04 • SOCIAL LAYER
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Circle: See what your people are actually accomplishing.
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              No vanity follower farming. No influencer algorithms. Circle gives you an unfiltered chronological feed of accomplishments from people who inspire you.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { title: 'User Search', desc: 'Find friends and builders by exact or partial username.' },
              { title: 'Follow & Unfollow', desc: 'Curate who you track with 1-click follow management.' },
              { title: 'Chronological Circle Feed', desc: 'Clean activity timeline showing newly logged Proofs and Flex gains.' },
              { title: 'Public Profiles', desc: 'Share your public @username proof profile with anyone on the web.' },
            ].map((feat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-start gap-3">
                <span className="font-mono text-xs text-zinc-500 mt-0.5">0{idx + 1}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-200">{feat.title}</span>
                  <span className="text-[11px] text-zinc-500 font-light mt-0.5">{feat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            6. 4-STEP HOW IT WORKS
           ========================================================================= */}
        <section id="how-it-works" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              05 • GETTING STARTED
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Four simple steps to your proof timeline.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                step: '01',
                title: 'CREATE ACCOUNT',
                desc: 'Sign up with email and password. Instant session creation with zero email waiting.',
              },
              {
                step: '02',
                title: 'BUILD PROFILE',
                desc: 'Select your unique username, add a bio, and optionally upload your avatar.',
              },
              {
                step: '03',
                title: 'LOG PROOFS',
                desc: 'Record what you complete each day across fitness, coding, learning, and projects.',
              },
              {
                step: '04',
                title: 'GROW SCORE & CIRCLE',
                desc: 'Watch your Flex Score accumulate and follow the real momentum of your peers.',
              },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-900 flex flex-col gap-1.5">
                <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">{s.step} — {s.title}</span>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. EDITORIAL MANIFESTO
           ========================================================================= */}
        <section className="py-14 border-b border-zinc-900 flex flex-col gap-4 text-center items-center">
          <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
            AETHER MANIFESTO
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-sm leading-tight">
            You don&apos;t need another place to pretend.
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm text-center">
            You need a place to remember what you actually did. The gym session. The course you finished. The thing you built. The skill you learned. The project you shipped. Aether turns those moments into something tangible.
          </p>
        </section>

        {/* =========================================================================
            8. SECURITY & INFRASTRUCTURE
           ========================================================================= */}
        <section id="security" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              06 • ARCHITECTURE
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Secure by design.
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              Aether is built with industry-standard privacy and security controls:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: 'Row Level Security', desc: 'PostgreSQL RLS policies on all tables' },
              { name: 'Folder Isolation', desc: 'Storage objects isolated to auth.uid()' },
              { name: 'HSTS & HTTPS', desc: 'Enforced TLS with 1-year max age' },
              { name: 'Content Security', desc: 'Restricted CSP without third-party leaks' },
            ].map((sec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col gap-1">
                <span className="text-xs font-medium text-white">{sec.name}</span>
                <span className="text-[10px] text-zinc-500 font-light leading-normal">{sec.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            9. FAQ ACCORDION
           ========================================================================= */}
        <section id="faq" className="py-14 border-b border-zinc-900 flex flex-col gap-6 scroll-mt-14">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              07 • FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
              Everything you need to know about Aether.
            </h2>
          </div>

          <FaqAccordion />
        </section>

        {/* =========================================================================
            10. FINAL CALL TO ACTION
           ========================================================================= */}
        <section className="py-16 flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Start documenting what you do.
          </h2>
          <p className="text-xs text-zinc-400 font-light max-w-xs leading-relaxed">
            Create your account in seconds. Zero email confirmation friction. Start logging your proofs today.
          </p>
          <Link
            href="/login"
            className="h-12 px-8 rounded-full bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center font-mono text-xs tracking-widest uppercase font-semibold"
          >
            Create Your Account
          </Link>
        </section>
      </main>

      {/* Product Footer */}
      <footer className="border-t border-zinc-900 px-5 py-8 flex flex-col gap-6 text-zinc-500 text-xs">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-white uppercase font-medium">
            AETHER
          </span>
          <p className="text-[11px] font-light text-zinc-500">
            The Instagram for what you actually achieve.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-zinc-400">
          <Link href="/founder" className="text-white hover:text-zinc-300 font-medium transition-colors">Founder</Link>
          <Link href="/legal" className="text-zinc-300 hover:text-white transition-colors">Legal Center</Link>
          <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          <Link href="/login" className="hover:text-white transition-colors">Get Started</Link>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#proofs" className="hover:text-white transition-colors">Proofs</a>
          <a href="#flex-score" className="hover:text-white transition-colors">Flex Score</a>
          <a href="#circle" className="hover:text-white transition-colors">Circle</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/80 text-[10px] font-mono text-zinc-600">
          <span>© {new Date().getFullYear()} Aether. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>System Live</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
