import { createClient } from '@/lib/supabase/server';
import { NotificationRecord, NotificationType, UserProfile, DbProfile } from '@/types';

export interface CreateNotificationParams {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Creates an in-app notification securely on the server side.
 * Never notifies a user about their own actions.
 * Resilient against missing DB tables (before migration execution).
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  // Prevent notifying a user about their own action
  if (params.actorId && params.actorId === params.userId) {
    return false;
  }

  try {
    const supabase = await createClient();

    // Prevent duplicate unread notifications of the same type for the same actor & entity
    if (params.actorId && params.type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase.from('notifications') as any)
        .select('id')
        .eq('user_id', params.userId)
        .eq('actor_id', params.actorId)
        .eq('type', params.type)
        .eq('read', false)
        .limit(1)
        .maybeSingle();

      if (existing) {
        return true; // Already notified and still unread
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('notifications') as any).insert({
      user_id: params.userId,
      actor_id: params.actorId || null,
      type: params.type,
      title: params.title.trim().slice(0, 120),
      body: params.body.trim().slice(0, 500),
      link: params.link?.trim() || null,
      metadata: params.metadata || {},
      read: false,
    });

    if (error) {
      // If table doesn't exist yet (migration pending), log cleanly without breaking callers
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        console.warn('[NOTIFICATIONS] notifications table not found in database. Pending migration.');
        return false;
      }
      console.error('[NOTIFICATIONS] Failed to create notification:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[NOTIFICATIONS] Unexpected error during notification creation:', err);
    return false;
  }
}

/**
 * Fetches notifications for a user with actor profiles joined.
 */
export async function getUserNotifications(
  userId: string,
  limit = 40
): Promise<NotificationRecord[]> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = (await (supabase.from('notifications') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))) as {
      data: Array<{
        id: string;
        user_id: string;
        actor_id: string | null;
        type: NotificationType;
        title: string;
        body: string;
        link: string | null;
        read: boolean;
        metadata: Record<string, unknown>;
        created_at: string;
      }> | null;
      error: { code?: string; message?: string } | null;
    };

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return [];
      }
      console.error('[NOTIFICATIONS] Fetch error:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Resolve actor profiles
    const actorIds = [...new Set(data.map((n) => n.actor_id).filter(Boolean))] as string[];
    let actorMap = new Map<string, UserProfile>();

    if (actorIds.length > 0) {
      const { data: actorsData } = (await supabase
        .from('profiles')
        .select('*')
        .in('id', actorIds)) as { data: DbProfile[] | null };

      if (actorsData) {
        actorMap = new Map(
          actorsData.map((p) => [
            p.id,
            {
              id: p.id,
              username: p.username,
              avatarUrl: p.avatar_url,
              bio: p.bio,
              flexScore: p.flex_score,
              streak: p.streak,
              createdAt: p.created_at,
            },
          ])
        );
      }
    }

    return data.map((n) => ({
      id: n.id,
      userId: n.user_id,
      actorId: n.actor_id,
      actor: n.actor_id ? actorMap.get(n.actor_id) : undefined,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      metadata: n.metadata || {},
      createdAt: n.created_at,
    }));
  } catch (err) {
    console.error('[NOTIFICATIONS] Unexpected error fetching notifications:', err);
    return [];
  }
}

/**
 * Returns count of unread notifications for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase.from('notifications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Marks a single notification as read.
 */
export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('notifications') as any)
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('notifications') as any)
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    return !error;
  } catch {
    return false;
  }
}
