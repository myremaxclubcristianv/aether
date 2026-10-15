import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChallenges, createChallenge } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const challenges = await getChallenges(user?.id, category, status);
    return NextResponse.json({ ok: true, challenges });
  } catch (err) {
    console.error('[API CHALLENGES GET] Error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, description, category, durationDays, targetProofCount, isPublic, inviteUserIds } = body;

    const result = await createChallenge({
      creatorId: user.id,
      title,
      description,
      category,
      durationDays: parseInt(durationDays, 10) || 7,
      targetProofCount: parseInt(targetProofCount, 10) || 7,
      isPublic: isPublic !== false,
      inviteUserIds: Array.isArray(inviteUserIds) ? inviteUserIds : [],
    });

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, challengeId: result.challengeId }, { status: 201 });
  } catch (err) {
    console.error('[API CHALLENGES POST] Error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to create challenge' }, { status: 500 });
  }
}
