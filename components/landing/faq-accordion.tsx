'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Aether?',
    answer: 'Aether is the social network built around what you actually achieve, rather than what you pretend or curate for an algorithm. Users document real actions as Proofs, build an objective Flex Score, and follow the genuine momentum of their Circle.',
    category: 'General',
  },
  {
    question: 'What is a Proof?',
    answer: 'A Proof is the fundamental unit of Aether. It represents a completed action or milestone with a category tag (Fitness, Learning, Creating, Building, Lifestyle, Achievement), a concise description, an optional verified photo, and an immutable UTC timestamp.',
    category: 'Proofs',
  },
  {
    question: 'What is Flex Score and how is it calculated?',
    answer: 'Flex Score is a visible metric that reflects your cumulative activity and consistency. Every text proof awards +10 Flex Points, while proofs with an attached image award +15 Flex Points. It is a signal of active discipline, not personal worth.',
    category: 'Scoring',
  },
  {
    question: 'What categories can I log proofs in?',
    answer: 'Aether currently supports 6 core achievement categories: Fitness (training, cardio, athletic milestones), Learning (books, courses, research), Creating (writing, art, design), Building (coding, shipping projects, businesses), Lifestyle (habits, routines, nutrition), and Achievement (major life and career steps).',
    category: 'Proofs',
  },
  {
    question: 'What is a streak?',
    answer: 'A streak is a counter tracking continuous days of recorded discipline. It acts as a lightweight reminder that small daily efforts compound over time without aggressive or deceptive gamification.',
    category: 'Scoring',
  },
  {
    question: 'What is Circle?',
    answer: 'Circle is Aether’s social layer. It lets you discover other users, search profiles by username, and follow friends or peers to see a clean, chronologically ordered feed of their latest accomplishments.',
    category: 'Circle',
  },
  {
    question: 'Can I follow and unfollow other users?',
    answer: 'Yes. You can search any username in the Circle tab, follow their profile with a single tap, or unfollow at any time. Self-following is blocked by database integrity constraints.',
    category: 'Circle',
  },
  {
    question: 'Can I add photos to my Proofs?',
    answer: 'Yes. When creating a Proof, you can optionally attach an image (e.g. workout screenshot, book page, project commit, certificate). Images are stored in user-isolated Supabase Storage folders and award +15 points.',
    category: 'Proofs',
  },
  {
    question: 'Does Aether have algorithms that rank posts for attention?',
    answer: 'No. Aether does not use engagement-bait algorithms or recommendation engines that favor controversy or manufactured lifestyle content. Feeds are strictly chronological and centered on real Proofs from accounts you follow.',
    category: 'Philosophy',
  },
  {
    question: 'Is Aether free to use?',
    answer: 'Yes. Account creation, logging Proofs, building your Flex Score, uploading media, and following peers in Circle are completely free.',
    category: 'General',
  },
  {
    question: 'How do I create an account?',
    answer: 'Click "Get Started", enter your email and password, and your account will be created immediately. You can then pick your username, set a bio, upload an avatar, and start logging your Proofs in seconds.',
    category: 'Account',
  },
  {
    question: 'How is user data and storage secured?',
    answer: 'Aether is architected with PostgreSQL Row-Level Security (RLS) on all tables, authenticated user-folder isolation on storage objects (${auth.uid()}/...), Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), and HTTPS encryption.',
    category: 'Security',
  },
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col divide-y divide-zinc-900 border-y border-zinc-900">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-4">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between text-left gap-4 py-1 group focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                {item.question}
              </span>
              <span className="font-mono text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0">
                {isOpen ? '—' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="pt-2 pb-1 text-xs text-zinc-400 font-light leading-relaxed animate-in fade-in duration-200">
                <p>{item.answer}</p>
                {item.category && (
                  <span className="inline-block mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                    Topic: {item.category}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
