'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FOUNDER_DATA } from '@/lib/founder';

const INTEREST_OPTIONS = [
  'Real Estate',
  'Insurance',
  'Finance',
  'Investments',
  'Dubai',
  'Construction',
  'Aviation',
  'Technology',
  'AETHER',
  'AiX OS',
  'Partnership',
  'Other',
];

const PREFERENCE_OPTIONS = ['Phone', 'WhatsApp', 'Email', 'Telegram'];

export const WorkWithMe: React.FC = () => {
  const { contact } = FOUNDER_DATA;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    contactPreference: 'WhatsApp',
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology', 'AETHER']);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please fill in your name and email.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interests: selectedInterests,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          contactPreference: 'WhatsApp',
        });
      } else {
        setErrorMessage(data.error || 'Failed to submit inquiry. Please try direct contact.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('A network error occurred. Please use direct contact options below.');
      setStatus('error');
    }
  };

  return (
    <section id="work-with-me" className="py-12 border-b border-zinc-900 flex flex-col gap-8 scroll-mt-12">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          10 / ENGAGEMENT
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          WORK WITH ME
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
          Tell me what you&apos;re building, buying, protecting or trying to solve.
        </p>
      </div>

      {/* Direct Quick Contact Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <a
          href={contact.phone.url}
          className="bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl p-3 flex flex-col gap-1 transition-all group"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">PHONE</span>
          <span className="text-xs font-semibold text-white group-hover:text-zinc-200">CALL DIRECT</span>
          <span className="text-[10px] font-mono text-zinc-400 truncate">{contact.phone.display}</span>
        </a>

        <a
          href={contact.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 hover:border-emerald-900/60 rounded-xl p-3 flex flex-col gap-1 transition-all group"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">WHATSAPP</span>
          <span className="text-xs font-semibold text-white group-hover:text-emerald-300">MESSAGE</span>
          <span className="text-[10px] font-mono text-zinc-400 truncate">{contact.whatsapp.display}</span>
        </a>

        <a
          href={contact.email.url}
          className="bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-xl p-3 flex flex-col gap-1 transition-all group"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">EMAIL</span>
          <span className="text-xs font-semibold text-white group-hover:text-zinc-200">SEND INQUIRY</span>
          <span className="text-[10px] font-mono text-zinc-400 truncate">{contact.email.display}</span>
        </a>

        <a
          href={contact.telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 hover:border-sky-900/60 rounded-xl p-3 flex flex-col gap-1 transition-all group"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-sky-400">TELEGRAM</span>
          <span className="text-xs font-semibold text-white group-hover:text-sky-300">DIRECT CHAT</span>
          <span className="text-[10px] font-mono text-zinc-400 truncate">{contact.telegram.display}</span>
        </a>
      </div>

      {/* Main Interactive Form */}
      <div className="bg-zinc-950/90 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        {status === 'success' ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 text-lg">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-white">Inquiry Received</h3>
            <p className="text-xs text-zinc-400 font-light max-w-sm leading-relaxed">
              Thank you for reaching out. Your message has been routed directly to Cristian Văduva. You will receive a response via your preferred contact channel.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline uppercase"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name, Email, Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="h-11 px-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="h-11 px-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+40 / +43..."
                  className="h-11 px-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Interest Chips */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                What are you interested in?
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-white text-black font-semibold'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Tell me more
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project, asset, requirement or partnership objective..."
                className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              />
            </div>

            {/* Contact Preference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-900">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Preferred Channel
                </span>
                <div className="flex items-center gap-2">
                  {PREFERENCE_OPTIONS.map((pref) => (
                    <label
                      key={pref}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="contactPreference"
                        value={pref}
                        checked={formData.contactPreference === pref}
                        onChange={(e) =>
                          setFormData({ ...formData, contactPreference: e.target.value })
                        }
                        className="accent-white"
                      />
                      <span>{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:items-end gap-1.5">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="h-11 px-8 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-mono text-xs tracking-wider uppercase font-semibold disabled:opacity-50 shrink-0"
                >
                  {status === 'submitting' ? 'Transmitting...' : 'Start A Conversation'}
                </button>
                <p className="text-[10px] text-zinc-500 font-light text-right">
                  Information is processed to respond to your request per our{' '}
                  <Link href="/legal/privacy" className="text-zinc-400 hover:text-white underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 font-mono text-center">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};
