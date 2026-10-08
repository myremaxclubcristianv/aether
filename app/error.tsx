'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen text-center px-6">
      <span className="text-2xl mb-4 select-none">⚠️</span>
      <h2 className="text-sm font-mono uppercase tracking-wider text-white">
        Something went wrong
      </h2>
      <p className="text-xs text-zinc-550 max-w-xs mt-2 leading-relaxed">
        An unexpected error occurred. Please try again or refresh the page.
      </p>
      
      <button
        onClick={() => reset()}
        className="mt-6 px-5 py-1.5 rounded-full text-[10px] font-mono tracking-wider bg-white text-black border border-white hover:bg-zinc-200 transition-all select-none"
      >
        RETRY
      </button>
    </div>
  );
}
