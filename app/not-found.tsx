import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen text-center px-6 selection:bg-zinc-800">
      <span className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase mb-3">
        404 • NOT FOUND
      </span>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
        Profile or page not found
      </h1>
      <p className="text-xs text-zinc-400 max-w-sm mt-2 leading-relaxed">
        The user or page you are looking for does not exist or may have been renamed.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/home"
          className="px-5 py-2 rounded-full text-xs font-mono tracking-wider bg-white text-black hover:bg-zinc-200 transition-all font-medium"
        >
          RETURN TO HOME
        </Link>
        <Link
          href="/circle"
          className="px-5 py-2 rounded-full text-xs font-mono tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all font-medium"
        >
          EXPLORE CIRCLE
        </Link>
      </div>
    </div>
  );
}
