'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, Users, User as UserIcon, LogOut, Flame } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { signOut } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export const AppShell: React.FC<AppShellProps> = ({ children, initialUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUser || null);

  useEffect(() => {
    if (initialUser) return;
    let isMounted = true;

    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data: profile } = (await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()) as { data: UserProfile | null };

          if (profile && isMounted) {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        console.error('AppShell profile resolve error:', err);
      }
    }
    loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const username = userProfile?.username;
  const profileHref = username ? `/${username}` : '/login';

  const navItems = [
    { label: 'Home', href: '/home', icon: Home, exact: true },
    { label: 'Proof', href: '/proof', icon: Plus, isAction: true },
    { label: 'Circle', href: '/circle', icon: Users },
    { label: 'Profile', href: profileHref, icon: UserIcon },
  ];

  return (
    <div className="w-full min-h-screen bg-black flex justify-center text-white relative">
      {/* Desktop Left Sidebar (Visible on md and larger screens) */}
      <aside className="hidden md:flex flex-col justify-between w-60 lg:w-64 h-screen sticky top-0 border-r border-zinc-900/80 px-5 py-8 shrink-0 z-30">
        <div className="flex flex-col gap-8">
          {/* Logo Brand */}
          <Link href="/home" className="flex items-center gap-2 px-3 py-1 group">
            <span className="font-mono text-xs tracking-[0.35em] text-zinc-300 group-hover:text-white transition-colors uppercase font-semibold">
              AETHER
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Desktop primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) || (item.label === 'Profile' && pathname === profileHref);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group select-none ${
                    isActive
                      ? 'bg-zinc-900 text-white font-medium shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.isAction && (
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="pt-4 border-t border-zinc-900/80 flex flex-col gap-3">
          {userProfile && (
            <Link
              href={profileHref}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-950/80 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={userProfile.avatarUrl || undefined}
                  fallback={userProfile.username || 'U'}
                  size="sm"
                  className="border border-zinc-800 shrink-0"
                />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-medium text-white truncate group-hover:text-zinc-200">
                    @{userProfile.username}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <span>Flex: {userProfile.flexScore || 0}</span>
                    {userProfile.streak > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-400/90 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          {userProfile.streak}d
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-950/40 w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container (Mobile: centered max-w-md / Desktop: centered max-w-xl / lg:max-w-2xl) */}
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl min-h-screen border-x border-zinc-900/80 flex flex-col relative pb-28 md:pb-12 shadow-2xl">
        {children}
      </div>

      {/* Mobile Floating Bottom Bar (Visible on mobile only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-5 pointer-events-none"
        aria-label="Mobile navigation"
      >
        <div className="pointer-events-auto max-w-md mx-auto flex items-center justify-around bg-zinc-950/90 backdrop-blur-xl border border-zinc-850 py-2 px-3 rounded-full shadow-2xl">
          <Link
            href="/home"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors ${
              pathname === '/home' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] font-mono tracking-wider">HOME</span>
          </Link>

          <Link
            href="/circle"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors ${
              pathname.startsWith('/circle') ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-mono tracking-wider">CIRCLE</span>
          </Link>

          {/* Prominent Action Button for Proof */}
          <Link
            href="/proof"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95 shrink-0"
            aria-label="Create new proof"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <Link
            href={profileHref}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors ${
              pathname === profileHref ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-[9px] font-mono tracking-wider">PROFILE</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
