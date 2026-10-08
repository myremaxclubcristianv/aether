import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required. Please sign in to confirm account deletion.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { confirmation } = body;

    if (confirmation !== 'DELETE_MY_ACCOUNT_PERMANENTLY') {
      return NextResponse.json(
        { ok: false, error: 'Confirmation mismatch. Please type the required confirmation string.' },
        { status: 400 }
      );
    }

    // Fetch user profile username before deletion for records
    const { data: profile } = (await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()) as { data: { username: string } | null };

    const username = profile?.username || 'Unknown';

    // Delete user profile and related records
    // Note: RLS policies cascade or allow self-deletion
    await supabase.from('proofs').delete().eq('user_id', user.id);
    await supabase.from('follows').delete().eq('follower_id', user.id);
    await supabase.from('follows').delete().eq('following_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);

    // Dispatch secure privacy notification
    const alertText = [
      '🗑️ AETHER — ACCOUNT DELETION COMPLETED',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `👤 Username: @${username}`,
      `🆔 User ID: ${user.id.slice(0, 8)}...`,
      `📧 Email: ${user.email}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `⏱️ Timestamp: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}`,
      'Status: Profile and proof records purged.',
    ].join('\n');

    await sendTelegramMessage(alertText);

    // Sign out user session
    await supabase.auth.signOut();

    return NextResponse.json({
      ok: true,
      message: 'Your profile and associated proofs have been deleted. You have been signed out.',
    });
  } catch (err) {
    console.error('[AETHER DELETE ACCOUNT API] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to complete deletion. Please submit a Data Rights request.' },
      { status: 500 }
    );
  }
}
