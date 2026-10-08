'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProof } from '@/lib/proof';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  'Fitness',
  'Learning',
  'Creating',
  'Building',
  'Lifestyle',
  'Achievement',
];

interface ProofFormProps {
  userId: string;
}

export const ProofForm: React.FC<ProofFormProps> = ({ userId }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('Building');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    setLoading(true);
    setError(null);

    if (!category) {
      setError('Please choose an achievement category.');
      setLoading(false);
      return;
    }

    try {
      const newProof = await createProof(userId, category, caption, imageFile);

      // Dispatch Telegram proof created notification (non-blocking)
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROOF_CREATED',
          category,
          caption,
          points: newProof.points,
        }),
      }).catch(() => {});

      router.push('/home');
      router.refresh();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2.5 rounded-md">
          {error}
        </div>
      )}

      {/* 1. Image Drag & Drop / Upload area */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Visual Proof (Optional, +15 Points)
        </span>
        
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950/20 aspect-video group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagePreview} 
              alt="Proof Preview" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={removeImage}
                className="text-xs font-mono tracking-wider border-red-950 text-red-450 hover:bg-red-950/20"
                disabled={loading}
              >
                REMOVE PHOTO
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-zinc-905 bg-zinc-950/10 cursor-pointer hover:border-zinc-800 transition-colors group aspect-video"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
            <svg
              className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400 transition-colors stroke-[1.25]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-550 mt-3">
              DRAG PHOTO OR CLICK TO BROWSE
            </span>
          </div>
        )}
      </div>

      {/* 2. Category selection */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Choose Category
        </span>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-700 text-white font-medium'
                    : 'bg-zinc-950/20 border-zinc-900 text-zinc-500 hover:border-zinc-850 hover:text-zinc-300'
                }`}
                disabled={loading}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Caption field */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Short Caption (Optional)
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="p-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-650 font-light resize-none leading-relaxed"
          placeholder="Describe your achievement..."
          disabled={loading}
        />
      </div>

      {/* 4. Action button */}
      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        className="w-full mt-4 font-mono text-xs tracking-widest uppercase rounded-md h-10"
      >
        SUBMIT PROOF
      </Button>
    </form>
  );
};
