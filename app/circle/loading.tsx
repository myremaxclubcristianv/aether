import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black pb-28">
      <main className="flex-1 px-5 pt-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-20 bg-zinc-900 rounded" />
          <div className="h-3 w-32 bg-zinc-950 rounded mt-2" />
        </div>

        {/* Search bar skeleton */}
        <div className="h-9 w-full bg-zinc-900/50 border border-zinc-950 rounded-full mb-8" />

        {/* Latest proofs feed skeleton */}
        <div className="mb-6">
          <div className="h-3 w-24 bg-zinc-950 rounded mb-4" />
          <div className="flex flex-col gap-4">
            <div className="h-32 w-full bg-zinc-900/50 rounded-xl border border-zinc-950" />
            <div className="h-32 w-full bg-zinc-900/50 rounded-xl border border-zinc-950" />
          </div>
        </div>
      </main>
    </div>
  );
}
