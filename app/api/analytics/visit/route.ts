import { NextRequest, NextResponse } from 'next/server';
import { notifyVisitor, parseUserAgent } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// In-memory sliding rate limiter: max 40 visit events per IP per minute
const ipVisitCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipVisitCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipVisitCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    // Cleanup old map entries periodically
    if (ipVisitCounts.size > 10_000) {
      ipVisitCounts.clear();
    }
    return false;
  }

  if (entry.count >= 40) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const { page, referrer, screen, user } = body;

    // Ignore static asset requests or undefined pages
    if (!page || typeof page !== 'string' || !page.startsWith('/') || page.length > 150) {
      return NextResponse.json({ ok: true });
    }

    const headers = request.headers;
    const uaHeader = headers.get('user-agent');
    const { device, browser, os } = parseUserAgent(uaHeader);
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country') ||
      '—';

    const cleanReferrer =
      referrer && typeof referrer === 'string' && referrer.trim() !== ''
        ? referrer.trim().slice(0, 200)
        : '—';

    const source =
      cleanReferrer !== '—' && !cleanReferrer.includes(request.nextUrl.host)
        ? 'Referral'
        : 'Direct';

    const cleanScreen = typeof screen === 'string' ? screen.slice(0, 50) : '—';
    const cleanUser = typeof user === 'string' ? user.trim().slice(0, 50) : 'Anonymous';

    const deviceString = `${os} · ${browser}${device !== 'Desktop' ? ` (${device})` : ''}`;

    // Non-blocking notification dispatch
    notifyVisitor({
      page: page.slice(0, 150),
      source,
      referrer: cleanReferrer,
      device: deviceString,
      screen: cleanScreen,
      country: country.slice(0, 10),
      user: cleanUser,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
