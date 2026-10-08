/**
 * Server-side Telegram Intelligence & Activity Monitoring Service for Aether
 * Safe, non-blocking, and never exposes tokens, credentials, or sensitive data.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Country code to Flag emoji helper
 */
export function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2 || countryCode === '—') return '🌍';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}

/**
 * Country code to localized Name helper
 */
export function getCountryName(countryCode?: string): string {
  if (!countryCode || countryCode === '—' || countryCode.length !== 2) return '';
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
  } catch {
    return countryCode.toUpperCase();
  }
}

/**
 * Formats full location string (Flag + Country + City/Region)
 */
export function formatLocation(country?: string, city?: string, region?: string): string {
  if (!country || country === '—') return '—';
  const flag = getCountryFlag(country);
  const countryName = getCountryName(country);
  const cleanCity = city && city !== '—' ? decodeURIComponent(city).trim() : '';
  const cleanRegion = region && region !== '—' && region !== city ? decodeURIComponent(region).trim() : '';

  const locationParts = [countryName];
  if (cleanCity) locationParts.push(cleanCity);
  else if (cleanRegion) locationParts.push(cleanRegion);

  return `${flag} ${locationParts.filter(Boolean).join(' • ')}`;
}

/**
 * Formats full timestamp in Europe/Bucharest timezone
 */
export function getFormattedTimestamp(): { dateStr: string; timeStr: string; full: string } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const second = parts.find((p) => p.type === 'second')?.value || '';

    const dateStr = `${day} ${month} ${year}`;
    const timeStr = `${hour}:${minute}:${second}`;
    return {
      dateStr,
      timeStr,
      full: `${dateStr} • ${timeStr}\nEurope/Bucharest`,
    };
  } catch {
    const iso = new Date().toISOString();
    return {
      dateStr: iso.slice(0, 10),
      timeStr: iso.slice(11, 19),
      full: `${iso.slice(0, 10)} • ${iso.slice(11, 19)}\nUTC`,
    };
  }
}

/**
 * Parses user-agent header into clean device, browser, OS strings
 */
export function parseUserAgent(ua?: string | null): { device: string; browser: string; os: string; full: string } {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown', full: 'Desktop · Browser' };

  let os = 'Unknown OS';
  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  const full = `${device} • ${os} • ${browser}`;
  return { device, browser, os, full };
}

/**
 * Categorizes and resolves acquisition source & campaign attribution
 */
export function resolveAttribution(data: {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}): { source: string; medium: string; campaign: string; referrer: string; isAttributed: boolean } {
  const cleanReferrer = data.referrer && data.referrer !== '—' ? data.referrer.trim() : '—';
  let source = data.source?.trim() || '';
  let medium = data.medium?.trim() || '';
  const campaign = data.campaign?.trim() || '';

  // Deterministic source identification from referrer if utm_source is absent
  if (!source && cleanReferrer !== '—') {
    const refLower = cleanReferrer.toLowerCase();
    if (refLower.includes('instagram.com') || refLower.includes('l.instagram.com')) {
      source = 'Instagram';
      medium = medium || 'Social';
    } else if (refLower.includes('t.co') || refLower.includes('twitter.com') || refLower.includes('x.com')) {
      source = 'X (Twitter)';
      medium = medium || 'Social';
    } else if (refLower.includes('facebook.com') || refLower.includes('fb.me')) {
      source = 'Facebook';
      medium = medium || 'Social';
    } else if (refLower.includes('linkedin.com') || refLower.includes('lnkd.in')) {
      source = 'LinkedIn';
      medium = medium || 'Social';
    } else if (refLower.includes('tiktok.com')) {
      source = 'TikTok';
      medium = medium || 'Social';
    } else if (refLower.includes('youtube.com') || refLower.includes('youtu.be')) {
      source = 'YouTube';
      medium = medium || 'Social';
    } else if (refLower.includes('google.')) {
      source = 'Google';
      medium = medium || 'Organic';
    } else if (refLower.includes('bing.com')) {
      source = 'Bing';
      medium = medium || 'Organic';
    } else {
      try {
        const parsed = new URL(cleanReferrer);
        source = parsed.hostname.replace(/^www\./, '');
        medium = medium || 'Referral';
      } catch {
        source = 'Referral';
        medium = medium || 'Referral';
      }
    }
  }

  if (!source) {
    source = cleanReferrer === '—' ? 'Direct' : 'Referral';
    medium = medium || (cleanReferrer === '—' ? 'Direct' : 'Referral');
  }

  const isAttributed = source !== 'Direct' || Boolean(campaign);

  return {
    source,
    medium,
    campaign: campaign || (isAttributed && source !== 'Direct' ? 'None' : 'Direct'),
    referrer: cleanReferrer,
    isAttributed,
  };
}

/**
 * Sends a message to the configured Telegram chat
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || TELEGRAM_CHAT_ID?.trim();

  if (!token) {
    console.error('[AETHER TELEGRAM] Missing TELEGRAM_BOT_TOKEN in runtime environment.');
    return false;
  }

  if (!chatId) {
    console.error('[AETHER TELEGRAM] Missing TELEGRAM_CHAT_ID in runtime environment.');
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

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      console.error(
        `[AETHER TELEGRAM] Telegram API error: ${response.status} — ${data?.description || 'Unknown error'}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      '[AETHER TELEGRAM] Failed to dispatch Telegram notification:',
      err instanceof Error ? err.message : 'Unknown error'
    );
    return false;
  }
}

export interface BaseTelemetryPayload {
  user?: string;
  page?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  device?: string;
  screen?: string;
  country?: string;
  city?: string;
  region?: string;
}

/**
 * Dispatches Level 2 — Visitor Intelligence Notification
 */
export async function notifyVisitor(data: BaseTelemetryPayload): Promise<boolean> {
  const time = getFormattedTimestamp();
  const page = data.page || '/';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const screen = data.screen || '—';
  const user = data.user ? (data.user.startsWith('@') ? data.user : `@${data.user}`) : 'Anonymous';
  const attr = resolveAttribution(data);

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '👁️ AETHER — NEW VISITOR',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '🌐 PAGE',
    page,
    '',
    '📍 LOCATION',
    location,
    '',
    '📈 ACQUISITION',
    `Source: ${attr.source}`,
    `Medium: ${attr.medium}`,
  ];

  if (attr.campaign && attr.campaign !== 'Direct' && attr.campaign !== 'None') {
    lines.push(`Campaign: ${attr.campaign}`);
  }

  if (attr.referrer !== '—') {
    lines.push(`Referrer: ${attr.referrer}`);
  }

  lines.push(
    '',
    '📱 DEVICE',
    device,
    `Screen: ${screen}`,
    '━━━━━━━━━━━━━━━━━━━━'
  );

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — New Signup Notification
 */
export async function notifySignup(data: BaseTelemetryPayload & { username?: string }): Promise<boolean> {
  const time = getFormattedTimestamp();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'New User';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const page = data.page || '/onboarding';
  const attr = resolveAttribution(data);

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '🚀 AETHER — NEW SIGNUP',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
    '',
    '📈 ACQUISITION',
    `Source: ${attr.source}`,
    `Medium: ${attr.medium}`,
  ];

  if (attr.campaign && attr.campaign !== 'Direct' && attr.campaign !== 'None') {
    lines.push(`Campaign: ${attr.campaign}`);
  }

  lines.push(
    '',
    '🔗 ENTRY',
    page,
    '',
    '⚡ NEXT STEP',
    'ONBOARDING',
    '━━━━━━━━━━━━━━━━━━━━'
  );

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — User Login Notification
 */
export async function notifyLogin(data: BaseTelemetryPayload & { username?: string }): Promise<boolean> {
  const time = getFormattedTimestamp();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'Authenticated User';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const page = data.page || '/home';
  const attr = resolveAttribution(data);

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '🔐 AETHER — LOGIN',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
    '',
    '🔗 DESTINATION',
    page,
  ];

  if (attr.isAttributed) {
    lines.push(
      '',
      '📈 ACQUISITION',
      `Source: ${attr.source}`
    );
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — Standard Proof Created Notification
 */
export async function notifyProofCreated(data: BaseTelemetryPayload & {
  username?: string;
  category: string;
  caption?: string;
  points: number;
  hasPhoto?: boolean;
  streak?: number;
}): Promise<boolean> {
  const time = getFormattedTimestamp();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'User';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const proofType = data.hasPhoto ? 'Photo (+15 Flex Points)' : 'Text (+10 Flex Points)';
  const streakDisplay = typeof data.streak === 'number' && data.streak > 0 ? `${data.streak} day streak` : 'Streak Active';

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '✨ AETHER — PROOF CREATED',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '⚡ ACTION',
    `Category: ${data.category}`,
    `Type: ${proofType}`,
    `Score: +${data.points} Flex Score`,
    `Streak: ${streakDisplay}`,
  ];

  if (data.caption && data.caption.trim()) {
    lines.push(`Caption: "${data.caption.trim().slice(0, 200)}"`);
  }

  lines.push(
    '',
    '📱 DEVICE',
    device,
    '━━━━━━━━━━━━━━━━━━━━'
  );

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — High-Priority First Proof Created Notification
 */
export async function notifyFirstProof(data: BaseTelemetryPayload & {
  username?: string;
  category: string;
  caption?: string;
  points: number;
  hasPhoto?: boolean;
}): Promise<boolean> {
  const time = getFormattedTimestamp();
  const user = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : 'New User';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const proofType = data.hasPhoto ? 'Photo Evidence' : 'Text Record';
  const attr = resolveAttribution(data);

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '🏆 AETHER — FIRST PROOF',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '🎉 MILESTONE',
    'First Proof Created (User Activated)',
    '',
    '⚡ DETAILS',
    `Category: ${data.category}`,
    `Type: ${proofType}`,
    `Flex Score: +${data.points}`,
    'Streak: 1 day streak started',
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
  ];

  if (attr.isAttributed) {
    lines.push(
      '',
      '📈 ACQUISITION',
      `Source: ${attr.source}`
    );
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — New Follow Notification
 */
export async function notifyFollow(data: BaseTelemetryPayload & {
  follower: string;
  following: string;
}): Promise<boolean> {
  const time = getFormattedTimestamp();
  const follower = data.follower.startsWith('@') ? data.follower : `@${data.follower}`;
  const following = data.following.startsWith('@') ? data.following : `@${data.following}`;
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '👥 AETHER — NEW FOLLOW',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 FROM',
    follower,
    '',
    '➡️ FOLLOWED',
    following,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
    '━━━━━━━━━━━━━━━━━━━━',
  ];

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 1 — Profile Shared Notification
 */
export async function notifyProfileShared(data: BaseTelemetryPayload & {
  username: string;
  method: string;
}): Promise<boolean> {
  const time = getFormattedTimestamp();
  const user = data.username.startsWith('@') ? data.username : `@${data.username}`;
  const methodDisplay = data.method === 'native_share' ? 'Native Share Dialog' : 'Clipboard Link Copied';
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '🔗 AETHER — PROFILE SHARED',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '👤 USER',
    user,
    '',
    '⚡ METHOD',
    methodDisplay,
    '',
    '🔗 PROFILE',
    `/@${data.username.replace(/^@/, '')}`,
    '',
    '🕐 WHEN',
    time.full,
    '',
    '📍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
    '━━━━━━━━━━━━━━━━━━━━',
  ];

  return await sendTelegramMessage(lines.join('\n'));
}

/**
 * Dispatches Level 3 — Real-Time Security Event Alert
 */
export async function notifySecurityEvent(data: BaseTelemetryPayload & {
  eventTitle: string;
  endpoint?: string;
  authStatus?: string;
  result?: string;
  details?: string;
}): Promise<boolean> {
  const time = getFormattedTimestamp();
  const location = formatLocation(data.country, data.city, data.region);
  const device = data.device || 'Desktop · Browser';
  const user = data.user ? (data.user.startsWith('@') ? data.user : `@${data.user}`) : 'Unauthenticated / Anonymous';

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━',
    '🚨 AETHER — SECURITY EVENT',
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '⚠️ EVENT',
    data.eventTitle,
    '',
    '👤 IDENTITY',
    user,
    '',
    '📍 ENDPOINT',
    data.endpoint || '—',
    '',
    '🔐 AUTH STATUS',
    data.authStatus || 'Unauthenticated',
    '',
    '🛡️ RESULT',
    data.result || 'Blocked',
    '',
    '🕐 WHEN',
    time.full,
    '',
    '🌍 LOCATION',
    location,
    '',
    '📱 DEVICE',
    device,
  ];

  if (data.details) {
    lines.push('', '📝 DETAILS', data.details.slice(0, 200));
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');

  return await sendTelegramMessage(lines.join('\n'));
}

