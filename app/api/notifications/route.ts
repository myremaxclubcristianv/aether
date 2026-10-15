import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('count_only') === 'true';

    if (countOnly) {
      const count = await getUnreadCount(user.id);
      return NextResponse.json({ ok: true, unreadCount: count });
    }

    const limit = parseInt(searchParams.get('limit') || '40', 10);
    const notifications = await getUserNotifications(user.id, limit);
    const unreadCount = await getUnreadCount(user.id);

    return NextResponse.json({ ok: true, notifications, unreadCount });
  } catch (err) {
    console.error('[API NOTIFICATIONS GET] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, notificationId } = body;

    if (action === 'mark_all_read') {
      const success = await markAllAsRead(user.id);
      return NextResponse.json({ ok: success });
    }

    if (action === 'mark_read' && notificationId) {
      const success = await markAsRead(notificationId, user.id);
      return NextResponse.json({ ok: success });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action or missing notificationId' }, { status: 400 });
  } catch (err) {
    console.error('[API NOTIFICATIONS PATCH] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
