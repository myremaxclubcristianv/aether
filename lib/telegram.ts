/**
 * Server-side Telegram Notification Service for Aether
 * Safe, non-blocking, and never exposes tokens or credentials to the client.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Formats time string in Europe/Bucharest timezone
 */
export function getFormattedTime(): string {
  try {
    return new Intl.DateTimeFormat('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Bucharest',
      hour12: false,
    }).format(new Date());
  } catch {
    return new Date().toISOString().substring(11, 19);
  }
}

/**
 * Masks an email for privacy (e.g. c***n@domain.com)
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '—';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const start = local[0];
  const end = local[local.length - 1];
  const maskedMiddle = '*'.repeat(Math.min(local.length - 2, 4));
  return `${start}${maskedMiddle}${end}@${domain}`;
}

/**
 * Parses user-agent header into clean device and browser strings
 */
export function parseUserAgent(ua?: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };

  let os = 'Unknown OS';
  if (/macintosh|mac os x/i.test(ua)) os = 'Mac';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  return { device, browser, os };
}

/**
 * Sends a message to the configured Telegram chat
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Graceful degradation when Telegram credentials are not configured
    return false;
  }

  try {
    const safeText = (text || '').slice(0, 4000);
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: safeText,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error('Telegram API response error status:', response.status);
      return false;
    }

    return true;
  } catch (err) {
    // Non-blocking: log server-side without exposing secrets
    console.error('Failed to dispatch Telegram notification:', err instanceof Error ? err.message : 'Unknown error');
    return false;
  }
}

export interface VisitorPayload {
  page: string;
  source?: string;
  referrer?: string;
  device?: string;
  screen?: string;
  country?: string;
  user?: string;
}

/**
 * Dispatches a New Visitor notification
 */
export async function notifyVisitor(data: VisitorPayload): Promise<void> {
  const time = getFormattedTime();
  const page = data.page || '/';
  const source = data.source || (data.referrer && data.referrer !== '—' ? 'Referral' : 'Direct');
  const referrer = data.referrer || '—';
  const device = data.device || 'Desktop · Browser';
  const screen = data.screen || '—';
  const country = data.country || '—';
  const user = data.user ? (data.user.startsWith('@') ? data.user : `@${data.user}`) : 'Anonymous';

  const message = [
    '⚡ AETHER — NEW VISITOR',
    '',
    '🌐 Page',
    page,
    '',
    '🔗 Source',
    source,
    '',
    '↩️ Referrer',
    referrer,
    '',
    '💻 Device',
    device,
    '',
    '📱 Screen',
    screen,
    '',
    '🌍 Country',
    country,
    '',
    '🕐 Time',
    time,
    '',
    '👤 User',
    user,
  ].join('\n');

  await sendTelegramMessage(message);
}

/**
 * Dispatches a New Signup notification
 */
export async function notifySignup(data: { username?: string; email?: string; device?: string }): Promise<void> {
  const time = getFormattedTime();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'New User';
  const masked = maskEmail(data.email);
  const device = data.device || 'Desktop · Browser';

  const message = [
    '🚀 AETHER — NEW SIGNUP',
    '',
    `👤 ${user}`,
    `📧 ${masked}`,
    `🕐 ${time}`,
    `💻 ${device}`,
  ].join('\n');

  await sendTelegramMessage(message);
}

/**
 * Dispatches a Login notification
 */
export async function notifyLogin(data: { username?: string; email?: string; device?: string }): Promise<void> {
  const time = getFormattedTime();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : (data.email ? maskEmail(data.email) : 'User');
  const device = data.device || 'Desktop · Browser';

  const message = [
    '🔐 AETHER — LOGIN',
    '',
    `👤 ${user}`,
    `🕐 ${time}`,
    `💻 ${device}`,
  ].join('\n');

  await sendTelegramMessage(message);
}

/**
 * Dispatches a Proof Created notification
 */
export async function notifyProofCreated(data: {
  username?: string;
  category: string;
  caption?: string;
  points: number;
}): Promise<void> {
  const time = getFormattedTime();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'User';

  const parts = [
    '🏆 AETHER — NEW PROOF',
    '',
    `👤 ${user}`,
    '📂 Category',
    data.category,
  ];

  if (data.caption && data.caption.trim()) {
    parts.push('📝 Caption', data.caption.trim());
  }

  parts.push(
    '📈 Score',
    `+${data.points} points`,
    '🕐 Time',
    time
  );

  await sendTelegramMessage(parts.join('\n'));
}

/**
 * Dispatches a Follow notification
 */
export async function notifyFollow(data: { follower: string; following: string }): Promise<void> {
  const time = getFormattedTime();
  const follower = data.follower.startsWith('@') ? data.follower : `@${data.follower}`;
  const following = data.following.startsWith('@') ? data.following : `@${data.following}`;

  const message = [
    '👥 AETHER — NEW FOLLOW',
    '',
    `${follower} → ${following}`,
    `🕐 ${time}`,
  ].join('\n');

  await sendTelegramMessage(message);
}
