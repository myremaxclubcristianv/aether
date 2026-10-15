'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ComplaintReportFormProps {
  defaultType?: 'copyright' | 'harassment' | 'impersonation' | 'inappropriate' | 'other';
  title?: string;
}

export const ComplaintReportForm: React.FC<ComplaintReportFormProps> = ({
  defaultType = 'copyright',
  title = 'Submit a Report or Infringement Notice',
}) => {
  const [reportType, setReportType] = useState<string>(defaultType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [description, setDescription] = useState('');
  const [goodFaith, setGoodFaith] = useState(false);
  const [authority, setAuthority] = useState(false);
  const [accuracy, setAccuracy] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ referenceId: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (reportType === 'copyright') {
      if (!goodFaith || !authority || !accuracy) {
        setError('Please confirm all three legal declarations to proceed with a copyright infringement notice.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/legal/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          complainantName: name,
          complainantEmail: email,
          targetUrlOrId: targetUrl,
          description,
          goodFaithStatement: goodFaith,
          authorityStatement: authority,
          accuracyDeclaration: accuracy,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSuccessData({
        referenceId: data.referenceId,
        message: data.message,
      });
    } catch (err) {
      console.error('[REPORT SUBMIT ERROR]', err);
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your report.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/70 p-6 sm:p-8 flex flex-col gap-5 text-left animate-in fade-in duration-300">
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold">
            Report Formally Logged
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-xs flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Reference Identifier</span>
            <span className="text-white font-semibold text-sm">{successData.referenceId}</span>
          </div>
          <p className="text-xs text-zinc-300 font-light leading-relaxed mt-1">
            {successData.message}
          </p>
          <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
            Please retain your reference identifier. If you need to submit supplementary materials or documentation, quote this identifier in an email to <a href="mailto:cristianvaduva@duck.com" className="text-white underline">cristianvaduva@duck.com</a>.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSuccessData(null);
            setName('');
            setEmail('');
            setTargetUrl('');
            setDescription('');
            setGoodFaith(false);
            setAuthority(false);
            setAccuracy(false);
          }}
          className="w-fit text-xs font-mono uppercase tracking-wider border-zinc-800 text-zinc-300 hover:text-white"
        >
          Submit Another Notice
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-850 bg-zinc-950/50 p-6 sm:p-8 flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
          FORMAL DISPATCH
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-400">
            {error}
          </div>
        )}

        {/* Category Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Report Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'copyright', label: 'Copyright / IP' },
              { id: 'harassment', label: 'Harassment' },
              { id: 'impersonation', label: 'Impersonation' },
              { id: 'inappropriate', label: 'Inappropriate Image' },
              { id: 'other', label: 'Other Violation' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setReportType(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                  reportType === cat.id
                    ? 'bg-white text-black font-semibold'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name & Email Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rep-name" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Your Full Legal Name *
            </label>
            <input
              id="rep-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe / Rights Holder"
              className="h-10 px-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rep-email" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Your Email Address *
            </label>
            <input
              id="rep-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@domain.com"
              className="h-10 px-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Target Content Identification */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rep-target" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Target URL, Username, or Proof Identifier *
          </label>
          <input
            id="rep-target"
            type="text"
            required
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="e.g. https://aether.cristianvaduva.com/@username or Proof ID"
            className="h-10 px-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono"
            disabled={submitting}
          />
        </div>

        {/* Narrative Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rep-desc" className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Description of Claim or Protected Work *
          </label>
          <textarea
            id="rep-desc"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details about the copyrighted work, original source link, or nature of the behavioral violation..."
            className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none font-light leading-relaxed"
            disabled={submitting}
          />
        </div>

        {/* Good Faith Legal Declarations (Required for Copyright) */}
        {reportType === 'copyright' && (
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850/80 text-[11px] text-zinc-300 font-light">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
              Statutory Declarations
            </span>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={goodFaith}
                onChange={(e) => setGoodFaith(e.target.checked)}
                className="mt-0.5 accent-white shrink-0"
              />
              <span>
                I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={authority}
                onChange={(e) => setAuthority(e.target.checked)}
                className="mt-0.5 accent-white shrink-0"
              />
              <span>
                I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={accuracy}
                onChange={(e) => setAccuracy(e.target.checked)}
                className="mt-0.5 accent-white shrink-0"
              />
              <span>
                I declare, under penalty of perjury, that the information in this notification is accurate.
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
          <span className="text-[10px] font-mono text-zinc-500">
            Human-reviewed platform dispatch
          </span>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            className="font-mono text-xs uppercase tracking-wider h-10 px-6 rounded-lg font-semibold"
          >
            Submit Formal Notice
          </Button>
        </div>
      </form>
    </Card>
  );
};
