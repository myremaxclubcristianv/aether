import { NextRequest, NextResponse } from 'next/server';
import { notifyVisitor, parseUserAgent } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { page, referrer, screen, user } = body;

    // Ignore static asset requests or undefined pages
    if (!page || typeof page !== 'string') {
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
        ? referrer
        : '—';

    const source =
      cleanReferrer !== '—' && !cleanReferrer.includes(request.nextUrl.host)
        ? 'Referral'
        : 'Direct';

    const deviceString = `${os} · ${browser}${device !== 'Desktop' ? ` (${device})` : ''}`;

    // Non-blocking notification dispatch
    notifyVisitor({
      page,
      source,
      referrer: cleanReferrer,
      device: deviceString,
      screen: screen || '—',
      country,
      user: user || 'Anonymous',
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
