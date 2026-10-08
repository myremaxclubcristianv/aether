import React from 'react';
import { ProofRecord } from '@/types';
import { ProofCard } from '@/components/proof/proof-card';

interface ProfileProofGridProps {
  proofs: ProofRecord[];
}

export const ProfileProofGrid: React.FC<ProfileProofGridProps> = ({ proofs }) => {
  if (proofs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-905 rounded-lg mt-6">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          No achievements logged yet
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 mb-1 select-none">
        Recent achievements
      </h3>
      <div className="flex flex-col gap-4">
        {proofs.map((proof) => (
          <ProofCard key={proof.id} proof={proof} />
        ))}
      </div>
    </div>
  );
};
export default ProfileProofGrid;
