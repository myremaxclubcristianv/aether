'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function getProfileUsername() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data: profile } = (await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle()) as { data: { username: string } | null };

          if (profile && isMounted) {
            setUsername(profile.username);
          }
        }
      } catch (err) {
        console.error('Failed to resolve nav profile link:', err);
      }
    }
    getProfileUsername();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const linkClass = (path: string) => {
    const isActive = pathname === path;
    return `text-[10px] font-mono tracking-wider transition-colors select-none ${
      isActive ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
    }`;
  };

  const profilePath = username ? `/@${username}` : '/home';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto flex items-center justify-between bg-zinc-950/80 backdrop-blur-md border border-zinc-900 px-6 py-2.5 rounded-full shadow-2xl">
        <Link href="/home" className={linkClass('/home')}>
          HOME
        </Link>

        <Link href="/circle" className={linkClass('/circle')}>
          CIRCLE
        </Link>

        {/* Create proof link */}
        <Link 
          href="/proof/create"
          aria-label="Create new proof"
          className="flex items-center justify-center h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all select-none shrink-0"
        >
          <svg
            className="h-4.5 w-4.5 stroke-[2]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
        
        {/* Dynamic public profile link */}
        <Link href={profilePath} className={linkClass(profilePath)}>
          PROFILE
        </Link>
        
        <button
          onClick={handleLogout}
          className="text-[10px] font-mono tracking-wider text-zinc-500 hover:text-red-400 transition-colors select-none"
        >
          LOGOUT
        </button>
      </nav>
    </div>
  );
};
export default Navigation;
