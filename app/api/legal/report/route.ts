import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// Sliding-window IP rate limiter: max 5 report submissions per IP per 10 minutes
const ipReportCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipReportCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipReportCounts.set(ip, { count: 1, resetAt: now + 600_000 });
    if (ipReportCounts.size > 2000) ipReportCounts.clear();
    return false;
  }

  if (entry.count >= 5) {
    return true;
  }

  entry.count += 1;
  return false;
}

function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip basic angle brackets
    .trim()
    .slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many submissions. Please wait a few minutes before submitting another report.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      reportType,
      complainantName,
      complainantEmail,
      targetUrlOrId,
      description,
      goodFaithStatement,
      authorityStatement,
      accuracyDeclaration,
    } = body;

    // Validate report type
    const validTypes = ['copyright', 'harassment', 'impersonation', 'inappropriate', 'other'];
    if (!reportType || !validTypes.includes(reportType)) {
      return NextResponse.json(
        { ok: false, error: 'Please select a valid report category.' },
        { status: 400 }
      );
    }

    // Validate complainant name
    const cleanName = sanitizeText(complainantName, 100);
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Please provide your full legal name or organization name.' },
        { status: 400 }
      );
    }

    // Validate email
    const cleanEmail = sanitizeText(complainantEmail, 120);
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid contact email address.' },
        { status: 400 }
      );
    }

    // Validate target URL / proof ID
    const cleanTarget = sanitizeText(targetUrlOrId, 300);
    if (!cleanTarget || cleanTarget.length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Please specify the exact URL, username, or Proof identifier being reported.' },
        { status: 400 }
      );
    }

    // Validate description
    const cleanDescription = sanitizeText(description, 2000);
    if (!cleanDescription || cleanDescription.length < 10) {
      return NextResponse.json(
        { ok: false, error: 'Please provide an adequate description of the violation or protected work.' },
        { status: 400 }
      );
    }

    // Validate good-faith and accuracy statements for formal copyright/infringement reports
    if (reportType === 'copyright') {
      if (!goodFaithStatement || !authorityStatement || !accuracyDeclaration) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'For copyright notices, you must confirm the good-faith, authorization, and accuracy declarations.',
          },
          { status: 400 }
        );
      }
    }

    // Generate secure reference ID
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenceId = `AETH-RPT-${new Date().getFullYear()}-${randomHex}`;

    // Format safe internal alert for Telegram (complainant email protected, delivered to verified bot)
    const categoryLabels: Record<string, string> = {
      copyright: 'COPYRIGHT / IP INFRINGEMENT',
      harassment: 'HARASSMENT / ABUSE',
      impersonation: 'IMPERSONATION / FAKE IDENTITY',
      inappropriate: 'NON-CONSENSUAL / INAPPROPRIATE CONTENT',
      other: 'COMMUNITY VIOLATION / OTHER',
    };

    const telegramMessage = [
      '🚨 AETHER — NEW FORMAL REPORT / COMPLAINT',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `🆔 Reference ID: ${referenceId}`,
      `📂 Category: ${categoryLabels[reportType] || reportType.toUpperCase()}`,
      `👤 Reporter: ${cleanName}`,
      `📧 Contact: ${cleanEmail}`,
      `🎯 Reported Target: ${cleanTarget}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '📝 Details:',
      cleanDescription,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `⚖️ Good-faith confirmed: ${goodFaithStatement ? 'YES' : 'N/A'}`,
      `⚖️ Authority confirmed: ${authorityStatement ? 'YES' : 'N/A'}`,
      `⚖️ Accuracy under penalty: ${accuracyDeclaration ? 'YES' : 'N/A'}`,
      `🌐 Origin IP: ${ip}`,
      `⏱️ Timestamp: ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}`,
    ].join('\n');

    const delivered = await sendTelegramMessage(telegramMessage);

    return NextResponse.json({
      ok: true,
      referenceId,
      delivered,
      message:
        'Your report has been received and logged for administrative review. If further details are needed, you will be contacted at the provided email address.',
    });
  } catch (err) {
    console.error('[AETHER REPORT API] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error while filing report. Please try again or email cristianvaduva@duck.com.' },
      { status: 500 }
    );
  }
}
