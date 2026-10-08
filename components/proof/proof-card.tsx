import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dumbbell, BookOpen, Palette, Hammer, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { ProofRecord, UserProfile } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Fitness: Dumbbell,
  Learning: BookOpen,
  Creating: Palette,
  Building: Hammer,
  Lifestyle: Sparkles,
  Achievement: Trophy,
};

interface ProofCardProps {
  proof: ProofRecord;
  author?: UserProfile;
}

export const ProofCard: React.FC<ProofCardProps> = ({ proof, author }) => {
  const Icon = CATEGORY_ICONS[proof.category] || Sparkles;

  return (
    <article className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 transition-all duration-200 group">
      {/* Header: Author (if provided) & Category / Points */}
      <div className="flex items-center justify-between gap-3">
        {author ? (
          <Link
            href={`/${author.username}`}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity min-w-0"
          >
            <Avatar src={author.avatarUrl || undefined} fallback={author.username} size="sm" />
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-medium text-white truncate">@{author.username}</span>
              <span className="text-[10px] font-mono text-zinc-500">{formatRelativeTime(proof.createdAt)}</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Icon className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
              {proof.category}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {!author && (
            <span className="text-[10px] font-mono text-zinc-550 hidden sm:inline">
              {formatRelativeTime(proof.createdAt)}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-medium tracking-wide bg-zinc-900 border border-zinc-800 text-emerald-400">
            +{proof.points || 10} FLEX
          </span>
        </div>
      </div>

      {/* Caption Content */}
      <p className="text-xs sm:text-sm text-zinc-200 font-light leading-relaxed whitespace-pre-line">
        {proof.caption}
      </p>

      {/* Image Media Preview */}
      {proof.imageUrl && (
        <div className="relative rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950 aspect-[16/9] w-full mt-1">
          <Image
            src={proof.imageUrl}
            alt={proof.caption || 'Proof media'}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
        </div>
      )}

      {/* Footer Verification Signature */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1 text-zinc-500">
          <CheckCircle2 className="w-3 h-3 text-zinc-500" />
          <span>VERIFIED PROOF</span>
        </div>
        {author && (
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span>{proof.category}</span>
          </div>
        )}
      </div>
    </article>
  );
};
export default ProofCard;
