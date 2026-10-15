'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  UserPlus,
  Trophy,
  CheckCircle2,
  XCircle,
  Target,
  Sparkles,
  Check,
  ExternalLink,
} from 'lucide-react';
import { NotificationRecord, NotificationType } from '@/types';
import { Avatar } from '@/components/ui/avatar';

interface NotificationCenterProps {
  initialNotifications: NotificationRecord[];
  initialUnreadCount: number;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'new_follower':
      return <UserPlus className="w-4 h-4 text-emerald-400" />;
    case 'challenge_invite':
      return <Target className="w-4 h-4 text-amber-400" />;
    case 'challenge_accepted':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'challenge_declined':
      return <XCircle className="w-4 h-4 text-zinc-500" />;
    case 'challenge_started':
      return <Target className="w-4 h-4 text-cyan-400" />;
    case 'challenge_progress':
      return <Sparkles className="w-4 h-4 text-violet-400" />;
    case 'challenge_completed':
      return <Trophy className="w-4 h-4 text-amber-300" />;
    default:
      return <Bell className="w-4 h-4 text-zinc-400" />;
  }
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  initialNotifications,
  initialUnreadCount,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const displayedNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkOne = async (id: string, link?: string | null) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', notificationId: id }),
    }).catch(() => {});

    if (link) {
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 font-semibold">
              ACTIVITY INBOX
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            NOTIFICATIONS
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-850 text-xs font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-zinc-800 text-white font-medium shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-zinc-800 text-white font-medium shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Mark All As Read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {displayedNotifications.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-zinc-950/60 rounded-2xl border border-zinc-850 p-6">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            <Bell className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-sm font-semibold text-white">
              {filter === 'unread' ? 'All caught up' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              {filter === 'unread'
                ? 'You have reviewed all your recent activity.'
                : 'Followers, challenge invitations, and progress achievements will appear here in real time.'}
            </p>
          </div>
          {filter === 'unread' && notifications.length > 0 && (
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline transition-colors"
            >
              View past notifications
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-900 bg-zinc-950/70 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
          {displayedNotifications.map((n) => {
            const hasLink = Boolean(n.link);

            return (
              <div
                key={n.id}
                onClick={() => handleMarkOne(n.id, n.link)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group ${
                  n.read
                    ? 'hover:bg-zinc-900/40 bg-transparent'
                    : 'bg-zinc-900/30 hover:bg-zinc-900/60'
                }`}
              >
                {/* Type Icon Badge or Actor Avatar */}
                <div className="relative shrink-0 pt-0.5">
                  {n.actor ? (
                    <div className="relative">
                      <Avatar
                        src={n.actor.avatarUrl || undefined}
                        fallback={n.actor.username}
                        size="md"
                        className="border border-zinc-800"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-zinc-800">
                        {getNotificationIcon(n.type)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      {getNotificationIcon(n.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-white tracking-tight truncate">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {n.body}
                  </p>

                  {hasLink && (
                    <div className="flex items-center gap-1 pt-1 text-[11px] font-mono text-zinc-400 group-hover:text-white transition-colors">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
