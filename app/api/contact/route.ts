import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// In-memory sliding rate limiter: max 5 contact submissions per IP per 10 minutes
const ipContactCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipContactCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipContactCounts.set(ip, { count: 1, resetAt: now + 600_000 });
    if (ipContactCounts.size > 2000) {
      ipContactCounts.clear();
    }
    return false;
  }

  if (entry.count >= 5) {
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
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, phone, interests, message, contactPreference } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length < 5) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 120);
    const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 50) : 'Not specified';
    const cleanInterests = Array.isArray(interests)
      ? interests.filter((i) => typeof i === 'string').slice(0, 8).join(', ')
      : typeof interests === 'string'
      ? interests.slice(0, 150)
      : 'General Inquiry';
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 1500) : 'No message provided';
    const cleanPreference = typeof contactPreference === 'string' ? contactPreference.slice(0, 50) : 'Email';

    // Format safe Telegram message for the founder
    const telegramText = [
      '💼 AETHER — NEW FOUNDER INQUIRY',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `👤 Name: ${cleanName}`,
      `📧 Email: ${cleanEmail}`,
      `📱 Phone / WhatsApp: ${cleanPhone}`,
      `🎯 Interested In: ${cleanInterests || 'General'}`,
      `💬 Preferred Contact: ${cleanPreference}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `📝 Message:`,
      cleanMessage,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `🌐 Origin: /founder (IP: ${ip})`,
      `⏱️ Timestamp: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}`,
    ].join('\n');

    // Await delivery to Telegram
    const sent = await sendTelegramMessage(telegramText);

    return NextResponse.json({ ok: true, delivered: sent });
  } catch (err) {
    console.error('[AETHER CONTACT API] Error processing inquiry:', err);
    return NextResponse.json({ ok: false, error: 'An error occurred. Please try again.' }, { status: 500 });
  }
}
