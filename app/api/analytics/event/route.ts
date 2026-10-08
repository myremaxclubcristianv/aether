import { NextRequest, NextResponse } from 'next/server';
import {
  notifySignup,
  notifyLogin,
  notifyProofCreated,
  notifyFollow,
  parseUserAgent,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// Allowed event types whitelist
const ALLOWED_EVENT_TYPES = new Set([
  'SIGNUP',
  'ONBOARDING_COMPLETED',
  'LOGIN',
  'PROOF_CREATED',
  'FIRST_PROOF_CREATED',
  'FOLLOW',
  'PROFILE_SHARED',
  'CIRCLE_SEARCH',
  'PROOF_IMAGE_ADDED',
]);

// In-memory sliding rate limiter: max 30 events per IP per minute
const ipEventCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipEventCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipEventCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    if (ipEventCounts.size > 10_000) {
      ipEventCounts.clear();
    }
    return false;
  }

  if (entry.count >= 30) {
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
    const { type, email, username, category, caption, points, follower, following, isFirstProof } = body;

    if (!type || typeof type !== 'string' || !ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json({ ok: true });
    }

    const uaHeader = request.headers.get('user-agent');
    const { device, browser, os } = parseUserAgent(uaHeader);
    const deviceString = `${os} · ${browser}${device !== 'Desktop' ? ` (${device})` : ''}`;

    const cleanUsername = typeof username === 'string' ? username.trim().slice(0, 50) : undefined;
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 100) : undefined;
    const cleanCategory = typeof category === 'string' ? category.trim().slice(0, 32) : 'General';
    const cleanCaption = typeof caption === 'string' ? caption.trim().slice(0, 500) : undefined;
    const cleanPoints = typeof points === 'number' && points >= 0 && points <= 100 ? points : 10;
    const cleanFollower = typeof follower === 'string' ? follower.trim().slice(0, 50) : undefined;
    const cleanFollowing = typeof following === 'string' ? following.trim().slice(0, 50) : undefined;

    if (type === 'SIGNUP' || type === 'ONBOARDING_COMPLETED') {
      notifySignup({
        username: cleanUsername,
        email: cleanEmail,
        device: deviceString,
      }).catch(() => {});
    } else if (type === 'LOGIN') {
      notifyLogin({
        username: cleanUsername,
        email: cleanEmail,
        device: deviceString,
      }).catch(() => {});
    } else if (type === 'PROOF_CREATED' || type === 'FIRST_PROOF_CREATED') {
      notifyProofCreated({
        username: cleanUsername,
        category: cleanCategory,
        caption: isFirstProof ? `[FIRST PROOF] ${cleanCaption || ''}` : cleanCaption,
        points: cleanPoints,
      }).catch(() => {});
    } else if (type === 'FOLLOW' && cleanFollower && cleanFollowing) {
      notifyFollow({
        follower: cleanFollower,
        following: cleanFollowing,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
