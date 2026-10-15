import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChallengeById, joinChallenge, leaveChallenge } from '@/lib/challenges';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const challenge = await getChallengeById(id, user?.id);
    if (!challenge) {
      return NextResponse.json({ ok: false, error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, challenge });
  } catch (err) {
    console.error('[API CHALLENGE GET] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, targetUserId } = body;

    if (action === 'join') {
      const success = await joinChallenge(id, user.id);
      return NextResponse.json({ ok: success });
    }

    if (action === 'leave') {
      const success = await leaveChallenge(id, user.id);
      return NextResponse.json({ ok: success });
    }

    if (action === 'invite' && targetUserId) {
      // 1. Verify caller is challenge creator
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: challenge } = await (supabase.from('challenges') as any)
        .select('id, title, creator_id')
        .eq('id', id)
        .maybeSingle();

      if (!challenge) {
        return NextResponse.json({ ok: false, error: 'Challenge not found' }, { status: 404 });
      }

      if (challenge.creator_id !== user.id) {
        return NextResponse.json(
          { ok: false, error: 'Only the sprint creator can send invitations' },
          { status: 403 }
        );
      }

      // 2. Check existing participation state to prevent overwriting 'joined' or 'completed'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingParticipant } = await (supabase.from('challenge_participants') as any)
        .select('status')
        .eq('challenge_id', id)
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (existingParticipant) {
        if (existingParticipant.status === 'joined' || existingParticipant.status === 'completed') {
          return NextResponse.json({
            ok: true,
            message: 'User is already an active or completed participant.',
            alreadyParticipant: true,
          });
        }
        if (existingParticipant.status === 'invited') {
          // Idempotent retry: already invited
          return NextResponse.json({
            ok: true,
            message: 'Invitation already pending.',
            alreadyInvited: true,
          });
        }
      }

      // 3. Upsert invitation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: inviteErr } = await (supabase.from('challenge_participants') as any).upsert(
        {
          challenge_id: id,
          user_id: targetUserId,
          status: 'invited',
          proofs_count: 0,
        },
        { onConflict: 'challenge_id,user_id' }
      );

      if (inviteErr) {
        return NextResponse.json({ ok: false, error: inviteErr.message }, { status: 400 });
      }

      createNotification({
        userId: targetUserId,
        actorId: user.id,
        type: 'challenge_invite',
        title: 'Challenge Invitation',
        body: `You were invited to join "${challenge.title}".`,
        link: `/challenges/${id}`,
        metadata: { challengeId: id },
      }).catch(() => {});

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[API CHALLENGE PATCH] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
