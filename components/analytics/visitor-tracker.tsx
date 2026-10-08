'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes per route per session

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Filter out API routes or Next internal paths if any
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return;
    }

    // Deduplication check via sessionStorage
    const storageKey = `aether_visit_${pathname}`;
    const now = Date.now();

    try {
      const lastVisit = sessionStorage.getItem(storageKey);
      if (lastVisit && now - parseInt(lastVisit, 10) < DEDUPLICATION_WINDOW_MS) {
        // Already tracked within deduplication window
        return;
      }
    } catch {
      // Ignore storage access restrictions
    }

    // Avoid immediate double-firing on same render cycle
    if (lastTrackedRouteRef.current === pathname) {
      return;
    }
    lastTrackedRouteRef.current = pathname;

    // Attempt to identify current username if logged in
    async function track() {
      let username: string | undefined = undefined;

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = (await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle()) as { data: { username: string } | null };

          if (profile?.username) {
            username = profile.username;
          }
        }
      } catch {
        // Ignore auth resolution errors during tracking
      }

      const screen =
        typeof window !== 'undefined'
          ? `${window.screen.width} × ${window.screen.height}`
          : '—';

      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      try {
        sessionStorage.setItem(storageKey, now.toString());
      } catch {
        // Storage quota / security policy
      }

      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          referrer,
          screen,
          user: username,
        }),
        keepalive: true,
      }).catch(() => {
        // Non-blocking fire and forget
      });
    }

    track();
  }, [pathname]);

  return null;
}
