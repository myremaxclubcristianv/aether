import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const ipRightsCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRightsCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRightsCounts.set(ip, { count: 1, resetAt: now + 600_000 });
    if (ipRightsCounts.size > 2000) ipRightsCounts.clear();
    return false;
  }

  if (entry.count >= 5) return true;
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
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { requestType, name, email, username, details } = body;

    if (!requestType || typeof requestType !== 'string') {
      return NextResponse.json({ ok: false, error: 'Request type is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'A valid email address is required.' }, { status: 400 });
    }

    const cleanType = requestType.trim().slice(0, 100);
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 100) : 'Not provided';
    const cleanEmail = email.trim().slice(0, 120);
    const cleanUsername = typeof username === 'string' ? username.trim().slice(0, 50) : 'None';
    const cleanDetails = typeof details === 'string' ? details.trim().slice(0, 1500) : 'None';

    const message = [
      '🛡️ AETHER — GDPR DATA SUBJECT REQUEST',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `📋 Request Type: ${cleanType}`,
      `👤 Name: ${cleanName}`,
      `📧 Email: ${cleanEmail}`,
      `🏷️ Username: @${cleanUsername}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `📝 Details:`,
      cleanDetails,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `⏱️ Timestamp: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}`,
      `🌐 Origin IP: ${ip}`,
    ].join('\n');

    const sent = await sendTelegramMessage(message);

    return NextResponse.json({
      ok: true,
      delivered: sent,
      message: 'Your privacy request has been recorded. The team will respond within the statutory GDPR timeframe (typically 30 days).',
    });
  } catch (err) {
    console.error('[AETHER DATA RIGHTS API] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error.' }, { status: 500 });
  }
}
