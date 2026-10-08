import { NextRequest, NextResponse } from 'next/server';
import {
  notifySignup,
  notifyLogin,
  notifyProofCreated,
  notifyFollow,
  parseUserAgent,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { type, email, username, category, caption, points, follower, following, isFirstProof } = body;

    const uaHeader = request.headers.get('user-agent');
    const { device, browser, os } = parseUserAgent(uaHeader);
    const deviceString = `${os} · ${browser}${device !== 'Desktop' ? ` (${device})` : ''}`;

    if (type === 'SIGNUP' || type === 'ONBOARDING_COMPLETED') {
      notifySignup({
        username,
        email,
        device: deviceString,
      }).catch(() => {});
    } else if (type === 'LOGIN') {
      notifyLogin({
        username,
        email,
        device: deviceString,
      }).catch(() => {});
    } else if (type === 'PROOF_CREATED' || type === 'FIRST_PROOF_CREATED') {
      notifyProofCreated({
        username,
        category: category || 'General',
        caption: isFirstProof ? `[FIRST PROOF] ${caption || ''}` : caption,
        points: typeof points === 'number' ? points : 10,
      }).catch(() => {});
    } else if (type === 'FOLLOW' && follower && following) {
      notifyFollow({
        follower,
        following,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
