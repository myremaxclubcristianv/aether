import React from 'react';
import { ProofRecord } from '@/types';
import { ProofCard } from './proof-card';
import Link from 'next/link';

interface ProofListProps {
  proofs: ProofRecord[];
}

export const ProofList: React.FC<ProofListProps> = ({ proofs }) => {
  if (proofs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-900 rounded-2xl px-6">
        <span className="text-xl mb-3 select-none">💎</span>
        <p className="text-xs font-mono text-zinc-400 max-w-[240px] leading-relaxed">
          No achievements logged yet. Log your first proof to increase your Flex Score.
        </p>
        <Link
          href="/proof/create"
          className="mt-5 px-5 py-1.5 rounded-full text-[10px] font-mono tracking-wider bg-white text-black border border-white hover:bg-zinc-200 transition-all select-none"
        >
          LOG PROOF
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {proofs.map((proof) => (
        <ProofCard key={proof.id} proof={proof} />
      ))}
    </div>
  );
};
