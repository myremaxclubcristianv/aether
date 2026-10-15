import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // Prevent open redirect vulnerabilities by ensuring next is a relative path
  const targetPath =
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : type === 'recovery'
      ? '/auth/reset-password'
      : '/onboarding';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored if called in contexts where cookies are immutable
          }
        },
      },
    }
  );

  let verified = false;

  // Flow A: Verify token_hash OTP (used in email confirmation and recovery links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      verified = true;
    } else {
      console.error('[AUTH CONFIRM] verifyOtp error:', error.message);
    }
  }

  // Flow B: PKCE code exchange
  if (!verified && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      verified = true;
    } else {
      console.error('[AUTH CONFIRM] exchangeCodeForSession error:', error.message);
    }
  }

  if (verified) {
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password', origin));
    }
    return NextResponse.redirect(new URL(targetPath, origin));
  }

  // Failure fallback with informative error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'verification_failed');
  loginUrl.searchParams.set(
    'message',
    'The confirmation or recovery link is invalid, expired, or has already been used. Please log in or request a new one.'
  );
  return NextResponse.redirect(loginUrl);
}
