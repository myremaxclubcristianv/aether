'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes per route per session

export interface ClientAttribution {
  sessionId: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  initialReferrer?: string;
  landingPage?: string;
}

/**
 * Retrieves or initializes privacy-conscious session attribution from sessionStorage
 */
export function getSessionAttribution(): ClientAttribution {
  if (typeof window === 'undefined') {
    return { sessionId: 'unknown' };
  }

  try {
    let sessionId = sessionStorage.getItem('aether_sid');
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('aether_sid', sessionId);
    }

    const storedAttr = sessionStorage.getItem('aether_attr');
    let parsedAttr: Partial<ClientAttribution> = {};
    if (storedAttr) {
      try {
        parsedAttr = JSON.parse(storedAttr);
      } catch {
        // Fallback
      }
    }

    // Check if current URL contains new UTM parameters
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source')?.trim();
    const utmMedium = searchParams.get('utm_medium')?.trim();
    const utmCampaign = searchParams.get('utm_campaign')?.trim();
    const utmContent = searchParams.get('utm_content')?.trim();
    const utmTerm = searchParams.get('utm_term')?.trim();

    if (utmSource || utmCampaign) {
      parsedAttr = {
        ...parsedAttr,
        source: utmSource || parsedAttr.source,
        medium: utmMedium || parsedAttr.medium,
        campaign: utmCampaign || parsedAttr.campaign,
        content: utmContent || parsedAttr.content,
        term: utmTerm || parsedAttr.term,
      };
      sessionStorage.setItem('aether_attr', JSON.stringify(parsedAttr));
    } else if (!storedAttr) {
      const docRef = document.referrer;
      parsedAttr = {
        initialReferrer: docRef || undefined,
        landingPage: window.location.pathname,
      };
      sessionStorage.setItem('aether_attr', JSON.stringify(parsedAttr));
    }

    return {
      sessionId,
      ...parsedAttr,
    };
  } catch {
    return { sessionId: 'local_session' };
  }
}

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
        return;
      }
    } catch {
      // Storage quota / security policy
    }

    if (lastTrackedRouteRef.current === pathname) {
      return;
    }
    lastTrackedRouteRef.current = pathname;

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
      const attribution = getSessionAttribution();

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
          referrer: referrer || attribution.initialReferrer || '',
          source: attribution.source,
          medium: attribution.medium,
          campaign: attribution.campaign,
          content: attribution.content,
          term: attribution.term,
          sessionId: attribution.sessionId,
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

