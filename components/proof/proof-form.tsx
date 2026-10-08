'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, 
  BookOpen, 
  Palette, 
  Hammer, 
  Sparkles, 
  Trophy, 
  Camera, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { createProof } from '@/lib/proof';
import { Button } from '@/components/ui/button';

interface CategoryOption {
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { name: 'Fitness', desc: 'Training, running, lifting, discipline', icon: Dumbbell },
  { name: 'Learning', desc: 'Books, courses, research, skills', icon: BookOpen },
  { name: 'Creating', desc: 'Design, writing, art, music, video', icon: Palette },
  { name: 'Building', desc: 'Coding, products, shipping, craft', icon: Hammer },
  { name: 'Lifestyle', desc: 'Nutrition, habits, morning routines', icon: Sparkles },
  { name: 'Achievement', desc: 'Major life & career milestones', icon: Trophy },
];

interface ProofFormProps {
  userId: string;
  username?: string;
  isFirstProof?: boolean;
}

export const ProofForm: React.FC<ProofFormProps> = ({ userId, username, isFirstProof = false }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const [category, setCategory] = useState('Fitness');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ points: number; isFirst: boolean } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROOF_IMAGE_ADDED',
          category,
        }),
      }).catch(() => {});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    if (!caption.trim()) {
      setError('Please describe what you actually accomplished.');
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    try {
      const newProof = await createProof(userId, category, caption.trim(), imageFile);
      const earnedPoints = newProof.points || (imageFile ? 15 : 10);

      // Extract session attribution if available
      let attribution: { source?: string; medium?: string; campaign?: string } = {};
      try {
        const stored = sessionStorage.getItem('aether_attr');
        if (stored) attribution = JSON.parse(stored);
      } catch {
        // Fallback
      }

      // Dispatch Telegram proof notification (non-blocking)
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isFirstProof ? 'FIRST_PROOF_CREATED' : 'PROOF_CREATED',
          username,
          category,
          caption: caption.trim(),
          points: earnedPoints,
          hasPhoto: Boolean(imageFile),
          page: '/proof',
          source: attribution.source,
          medium: attribution.medium,
          campaign: attribution.campaign,
        }),
      }).catch(() => {});

      // Trigger Celebration State
      setSuccessData({ points: earnedPoints, isFirst: isFirstProof });

      if (!isFirstProof) {
        setTimeout(() => {
          router.push('/home');
          router.refresh();
        }, 1600);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong saving your proof.';
      setError(errMsg);
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const pointsValue = imageFile ? 15 : 10;

  if (successData) {
    const isFirst = successData.isFirst;
    const profileHref = username ? `/${username}` : '/home';

    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in zoom-in duration-300 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-6 shadow-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-zinc-500 mb-2">
          {isFirst ? 'YOUR FIRST PROOF' : 'PROOF CREATED'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {isFirst ? 'IS LIVE' : `+${successData.points} FLEX SCORE`}
        </h2>

        {isFirst && (
          <div className="font-mono text-xl font-semibold text-emerald-400 mb-2">
            +{successData.points} FLEX SCORE
          </div>
        )}

        <p className="text-xs text-zinc-400 font-light max-w-xs leading-relaxed mb-6">
          {isFirst 
            ? 'You have officially started. Your action is now part of your permanent record.'
            : 'Your proof has been recorded and added to your chronological activity feed.'}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 font-mono text-xs text-orange-400 mb-8">
          <Flame className="w-4 h-4 fill-orange-400/20" />
          <span>{isFirst ? '1 DAY STREAK STARTED' : 'STREAK CONTINUES'}</span>
        </div>

        {isFirst ? (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                router.push('/home');
                router.refresh();
              }}
              className="w-full h-12 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-xs tracking-widest uppercase font-semibold transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>KEEP BUILDING • BACK TO HOME</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                router.push(profileHref);
                router.refresh();
              }}
              className="w-full h-11 rounded-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs tracking-wider uppercase transition-colors"
            >
              View Profile
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              router.push('/home');
              router.refresh();
            }}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-xs tracking-wider uppercase font-semibold transition-all"
          >
            Back to Home
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {error && (
        <div className="text-xs font-mono text-red-450 bg-red-950/20 border border-red-900/30 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* 1. Category Selector */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
          01 • CHOOSE CATEGORY
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.name;
            return (
              <button
                type="button"
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all select-none ${
                  isSelected
                    ? 'border-white bg-zinc-900 text-white shadow-md'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>
                <span className="text-xs font-medium text-white">{cat.name}</span>
                <span className="text-[9px] font-light text-zinc-500 leading-tight mt-0.5 line-clamp-1">
                  {cat.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Caption Input */}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="caption" className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
          02 • WHAT DID YOU ACTUALLY DO?
        </label>
        <textarea
          id="caption"
          rows={3}
          required
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. 10km morning tempo run in 48:20. Maintained steady cadence throughout."
          className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-zinc-700 rounded-xl p-4 text-xs sm:text-sm text-white placeholder:text-zinc-600 outline-none transition-colors leading-relaxed resize-none font-light"
          disabled={loading}
        />
      </div>

      {/* 3. Image Upload Area */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
            03 • ATTACH PHOTO (OPTIONAL)
          </label>
          <span className="text-[10px] font-mono text-emerald-400 font-medium">
            {imageFile ? '+15 PTS WITH PHOTO' : '+5 PTS BONUS WITH PHOTO'}
          </span>
        </div>

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[16/9] w-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagePreview} 
              alt="Proof Preview" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={removeImage}
                className="px-4 py-2 rounded-full bg-red-950/80 border border-red-900 text-xs font-mono text-red-300 hover:bg-red-900 flex items-center gap-1.5 transition-colors"
                disabled={loading}
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-zinc-850 bg-zinc-950/30 hover:border-zinc-700 transition-colors cursor-pointer group aspect-[16/9] text-center"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-zinc-300">
              Drop photo here or click to browse
            </span>
            <span className="text-[10px] text-zinc-500 font-light mt-1">
              Proof is stronger when there&apos;s something to show.
            </span>
          </div>
        )}
      </div>

      {/* 4. Live Point Preview & Submit */}
      <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm font-bold text-emerald-400">
            +{pointsValue}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-white">Earn +{pointsValue} Flex Points</span>
            <span className="text-[10px] font-mono text-zinc-500">
              {imageFile ? 'Verified with photo evidence' : 'Standard verified text proof'}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="h-12 px-8 rounded-full font-mono text-xs tracking-widest uppercase font-semibold text-black bg-white hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
        >
          <span>LOG PROOF</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
export default ProofForm;
