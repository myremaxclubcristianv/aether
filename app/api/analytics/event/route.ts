import { NextRequest, NextResponse } from 'next/server';
import {
  notifySignup,
  notifyLogin,
  notifyProofCreated,
  notifyFirstProof,
  notifyFollow,
  notifyProfileShared,
  notifySecurityEvent,
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
  'SECURITY_EVENT',
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
    const {
      type,
      username,
      category,
      caption,
      points,
      hasPhoto,
      streak,
      follower,
      following,
      method,
      page,
      source,
      medium,
      campaign,
      referrer,
      eventTitle,
      endpoint,
      authStatus,
      result,
      details,
    } = body;

    if (!type || typeof type !== 'string' || !ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json({ ok: true });
    }

    const headers = request.headers;
    const uaHeader = headers.get('user-agent');
    const { full: deviceString } = parseUserAgent(uaHeader);
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country') ||
      '—';
    const city = headers.get('x-vercel-ip-city') || undefined;
    const region = headers.get('x-vercel-ip-country-region') || undefined;

    const cleanUsername = typeof username === 'string' ? username.trim().slice(0, 50) : undefined;
    const cleanCategory = typeof category === 'string' ? category.trim().slice(0, 32) : 'General';
    const cleanCaption = typeof caption === 'string' ? caption.trim().slice(0, 500) : undefined;
    const cleanPoints = typeof points === 'number' && points >= 0 && points <= 100 ? points : 10;
    const cleanFollower = typeof follower === 'string' ? follower.trim().slice(0, 50) : undefined;
    const cleanFollowing = typeof following === 'string' ? following.trim().slice(0, 50) : undefined;
    const cleanSource = typeof source === 'string' ? source.trim().slice(0, 50) : undefined;
    const cleanMedium = typeof medium === 'string' ? medium.trim().slice(0, 50) : undefined;
    const cleanCampaign = typeof campaign === 'string' ? campaign.trim().slice(0, 50) : undefined;
    const cleanReferrer = typeof referrer === 'string' ? referrer.trim().slice(0, 200) : undefined;
    const cleanPage = typeof page === 'string' ? page.trim().slice(0, 150) : undefined;

    const basePayload = {
      device: deviceString,
      country: country.slice(0, 10),
      city,
      region,
      source: cleanSource,
      medium: cleanMedium,
      campaign: cleanCampaign,
      referrer: cleanReferrer,
      page: cleanPage,
    };

    let sent = false;

    if (type === 'SIGNUP' || type === 'ONBOARDING_COMPLETED') {
      sent = await notifySignup({
        ...basePayload,
        username: cleanUsername,
      });
    } else if (type === 'LOGIN') {
      sent = await notifyLogin({
        ...basePayload,
        username: cleanUsername,
      });
    } else if (type === 'FIRST_PROOF_CREATED') {
      sent = await notifyFirstProof({
        ...basePayload,
        username: cleanUsername,
        category: cleanCategory,
        caption: cleanCaption,
        points: cleanPoints,
        hasPhoto: Boolean(hasPhoto),
      });
    } else if (type === 'PROOF_CREATED') {
      sent = await notifyProofCreated({
        ...basePayload,
        username: cleanUsername,
        category: cleanCategory,
        caption: cleanCaption,
        points: cleanPoints,
        hasPhoto: Boolean(hasPhoto),
        streak: typeof streak === 'number' ? streak : undefined,
      });
    } else if (type === 'FOLLOW' && cleanFollower && cleanFollowing) {
      sent = await notifyFollow({
        ...basePayload,
        follower: cleanFollower,
        following: cleanFollowing,
      });
    } else if (type === 'PROFILE_SHARED' && cleanUsername) {
      sent = await notifyProfileShared({
        ...basePayload,
        username: cleanUsername,
        method: typeof method === 'string' ? method.slice(0, 30) : 'native_share',
      });
    } else if (type === 'SECURITY_EVENT') {
      sent = await notifySecurityEvent({
        ...basePayload,
        eventTitle: typeof eventTitle === 'string' ? eventTitle.slice(0, 100) : 'Security Alert',
        endpoint: typeof endpoint === 'string' ? endpoint.slice(0, 100) : undefined,
        authStatus: typeof authStatus === 'string' ? authStatus.slice(0, 50) : undefined,
        result: typeof result === 'string' ? result.slice(0, 50) : undefined,
        details: typeof details === 'string' ? details.slice(0, 200) : undefined,
      });
    }

    return NextResponse.json({ ok: sent });
  } catch (err) {
    console.error('[AETHER TELEGRAM EVENT] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
