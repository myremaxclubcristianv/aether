import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black pb-28">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center pt-8 text-center px-6 animate-pulse">
        {/* Avatar skeleton */}
        <div className="h-24 w-24 rounded-full bg-zinc-900 border border-zinc-800 mb-4" />
        
        {/* Name and username skeleton */}
        <div className="h-5 w-28 bg-zinc-900 rounded mb-2" />
        <div className="h-3.5 w-20 bg-zinc-950 rounded" />
        
        {/* Bio skeleton */}
        <div className="h-4 w-48 bg-zinc-900 rounded mt-6" />
      </div>

      {/* Stats Deck Skeleton */}
      <div className="flex flex-col items-center py-6 text-center border-b border-zinc-950 mt-6 animate-pulse">
        <div className="h-16 w-24 bg-zinc-900 rounded-lg mb-2" />
        <div className="h-2.5 w-16 bg-zinc-950 rounded" />
        
        <div className="flex gap-8 mt-6">
          <div className="h-3 w-20 bg-zinc-900 rounded" />
          <div className="h-3 w-20 bg-zinc-900 rounded" />
        </div>
      </div>

      {/* Grid Feed Skeleton */}
      <div className="px-5 mt-6 animate-pulse">
        <div className="h-3 w-24 bg-zinc-950 rounded mb-4" />
        <div className="flex flex-col gap-4">
          <div className="h-32 w-full bg-zinc-900/50 rounded-xl border border-zinc-950" />
          <div className="h-32 w-full bg-zinc-900/50 rounded-xl border border-zinc-950" />
        </div>
      </div>
    </div>
  );
}
