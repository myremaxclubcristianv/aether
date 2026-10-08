import React from 'react';
import Image from 'next/image';
import { ProofRecord } from '@/types';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';

interface ProofCardProps {
  proof: ProofRecord;
}

export const ProofCard: React.FC<ProofCardProps> = ({ proof }) => {
  // Parse caption into title and description if it follows "Title: Description" format
  const colonIndex = proof.caption.indexOf(':');
  let title = proof.caption;
  let description = '';

  if (colonIndex !== -1) {
    title = proof.caption.substring(0, colonIndex).trim();
    description = proof.caption.substring(colonIndex + 1).trim();
  }

  return (
    <Card className="flex flex-col gap-3 group border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-all duration-200">
      {/* Category and Points row */}
      <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
        <span className="uppercase text-zinc-500">{proof.category}</span>
        {proof.points > 0 && (
          <span className="text-zinc-300 bg-zinc-900/60 border border-zinc-800/40 px-2 py-0.5 rounded-sm">
            +{proof.points} pts
          </span>
        )}
      </div>

      {proof.imageUrl && (
        <div className="relative rounded-md overflow-hidden border border-zinc-900 bg-zinc-950/20 aspect-video mb-1">
          <Image
            src={proof.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>
      )}

      {/* Main Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-medium text-white tracking-tight group-hover:text-zinc-100 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-zinc-400 leading-relaxed font-light mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Verification footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/40 text-[10px] font-mono text-zinc-500">
        <span>{formatRelativeTime(proof.createdAt)}</span>

        <span className="flex items-center gap-1 text-zinc-400 select-none">
          <svg
            className="h-3 w-3 stroke-[2.5px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>VERIFIED PROOF</span>
        </span>
      </div>
    </Card>
  );
};
