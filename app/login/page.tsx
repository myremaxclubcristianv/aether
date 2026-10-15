'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp, resendVerificationEmail, resetPasswordForEmail, validatePassword } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'verify_pending';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlMode = searchParams.get('mode');
  const initialMode: AuthMode =
    urlMode === 'forgot' || urlMode === 'reset'
      ? 'forgot'
      : urlMode === 'register'
      ? 'register'
      : 'login';

  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');
  const initialError =
    errorParam === 'verification_failed'
      ? messageParam || 'The verification link is invalid or has expired.'
      : null;

  const initialSuccess =
    searchParams.get('verified') === 'true'
      ? 'Email verified successfully! You can now log in.'
      : searchParams.get('reset') === 'success'
      ? 'Password updated successfully. Please log in with your new password.'
      : null;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(initialError);
  const [successMsg, setSuccessMsg] = useState<string | null>(initialSuccess);
  const [showResendAction, setShowResendAction] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const isSubmittingRef = useRef(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resendVerificationEmail(email);
      setSuccessMsg(`A new verification link has been sent to ${email}.`);
      setResendCooldown(60);
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'Failed to resend verification email.';
      if (rawMsg.toLowerCase().includes('rate limit') || rawMsg.toLowerCase().includes('over_email_send_rate_limit')) {
        setError('Rate limit reached. Please wait a minute before requesting another verification email.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resetPasswordForEmail(email);
      setForgotSuccess(true);
      setResendCooldown(60);
    } catch (err) {
      console.error('[FORGOT PASSWORD ERROR]', err);
      const rawMsg = err instanceof Error ? err.message : 'An error occurred.';
      if (rawMsg.toLowerCase().includes('rate limit')) {
        setError('Please wait a moment before requesting another reset email.');
      } else {
        // Show neutral response for security to prevent user enumeration
        setForgotSuccess(true);
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setShowResendAction(false);

    try {
      if (mode === 'login') {
        const data = await signIn(email, password);

        // Extract session attribution
        let attribution: { source?: string; medium?: string; campaign?: string } = {};
        try {
          const stored = sessionStorage.getItem('aether_attr');
          if (stored) attribution = JSON.parse(stored);
        } catch {
          // Fallback
        }

        // Direct users to /onboarding if profile is incomplete, otherwise /home
        const supabase = createClient();
        const { data: profile } = (await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .maybeSingle()) as { data: { username: string } | null };

        const resolvedUsername = profile?.username || data?.user?.user_metadata?.username;

        // Dispatch Telegram login notification (non-blocking)
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'LOGIN',
            username: resolvedUsername,
            page: profile?.username ? '/home' : '/onboarding',
            source: attribution.source,
            medium: attribution.medium,
            campaign: attribution.campaign,
          }),
        }).catch(() => {});

        if (profile?.username) {
          router.refresh();
          router.push('/home');
        } else {
          router.refresh();
          router.push('/onboarding');
        }
      } else if (mode === 'register') {
        // Validate password complexity before registering
        const validation = validatePassword(password);
        if (!validation.valid) {
          setError(validation.message || 'Password must be at least 8 characters long.');
          return;
        }

        const data = await signUp(email, password);

        // Extract session attribution
        let attribution: { source?: string; medium?: string; campaign?: string } = {};
        try {
          const stored = sessionStorage.getItem('aether_attr');
          if (stored) attribution = JSON.parse(stored);
        } catch {
          // Fallback
        }

        // Dispatch Telegram signup notification (non-blocking)
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'SIGNUP',
            username: data?.user?.user_metadata?.username || email.split('@')[0],
            page: '/onboarding',
            source: attribution.source,
            medium: attribution.medium,
            campaign: attribution.campaign,
          }),
        }).catch(() => {});

        // If email confirmation is enabled on Supabase, no active session is returned
        if (!data?.session) {
          if (data?.user?.identities && data.user.identities.length === 0) {
            setError('An account with this email address already exists. Please log in or reset your password.');
            return;
          }
          // Account created and confirmation link sent!
          setMode('verify_pending');
          setResendCooldown(60);
          return;
        }

        // Session was granted immediately (email confirmation disabled or auto-confirmed)
        router.push('/onboarding');
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'An authentication error occurred.';
      const lower = rawMsg.toLowerCase();

      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('Load failed')) {
        setError('Unable to connect to authentication service. Please check your network connection.');
      } else if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
        setError('Your email has not been verified yet. Please check your inbox or resend the verification link.');
        setShowResendAction(true);
      } else if (lower.includes('invalid login credentials')) {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (lower.includes('user already registered')) {
        setError('An account with this email address already exists.');
      } else if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
        setError('Email rate limit reached. Please wait a few minutes before trying again.');
      } else {
        setError(rawMsg);
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center px-6 py-12 bg-black min-h-screen selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase select-none hover:text-white transition-colors"
          >
            A E T H E R
          </Link>
          <h1 className="text-xl font-medium tracking-tight text-white mt-3">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'verify_pending' && 'Verify your email'}
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed">
            {mode === 'login' && 'Enter your credentials to access your proofs and Flex Score.'}
            {mode === 'register' && 'Register your verified email to begin documenting your progress.'}
            {mode === 'forgot' && 'Enter your account email to receive a secure recovery link.'}
            {mode === 'verify_pending' && `We've sent a confirmation link to ${email}.`}
          </p>
        </div>

        {/* Dynamic Card */}
        <Card className="border-zinc-900 bg-zinc-950/20 p-6">
          {mode === 'verify_pending' ? (
            <div className="flex flex-col gap-5 text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-white font-medium">{email}</span>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Please check your inbox and click the verification link to activate your account.
                </p>
                <p className="text-[11px] text-zinc-500 font-light">
                  If you don&apos;t see the email within a minute, check your spam or junk folder.
                </p>
              </div>

              {error && (
                <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md text-left">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 rounded-md text-left flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  isLoading={resending}
                  disabled={resendCooldown > 0}
                  className="w-full font-mono text-xs tracking-wider uppercase h-10 border-zinc-800 hover:bg-zinc-900"
                >
                  {resendCooldown > 0
                    ? `RESEND LINK (${resendCooldown}s)`
                    : 'RESEND VERIFICATION LINK'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="mt-2 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← BACK TO LOG IN
                </button>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            forgotSuccess ? (
              <div className="flex flex-col gap-4 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-md bg-zinc-900/50 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed text-left">
                  If an account exists for <strong className="text-white">{email}</strong>, a password reset link has been dispatched. Please check your inbox and spam folder.
                </div>
                <p className="text-xs text-zinc-400 font-light">
                  Follow the link in the email to set a new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotSuccess(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="mt-2 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  ← RETURN TO LOG IN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                {error && (
                  <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label htmlFor="forgot-email" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Account Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 font-light"
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full mt-2 font-mono text-xs tracking-widest uppercase rounded-md h-10"
                >
                  SEND RESET LINK
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="mt-2 text-center text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← BACK TO LOG IN
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md flex flex-col gap-2">
                  <span>{error}</span>
                  {showResendAction && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || resending}
                      className="text-left text-xs text-white underline decoration-zinc-700 hover:decoration-white font-mono uppercase tracking-wider transition-colors"
                    >
                      {resending
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Verification Link →'}
                    </button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900/40 border border-zinc-800 px-3 py-2 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 font-light"
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 font-light"
                  placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  disabled={loading}
                />
                {mode === 'register' && (
                  <span className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    Requires 8+ characters, letters and numbers or symbols.
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full mt-2 font-mono text-xs tracking-widest uppercase rounded-md h-10"
              >
                {mode === 'login' ? 'LOG IN' : 'REGISTER'}
              </Button>
            </form>
          )}
        </Card>

        {/* Switch mode links */}
        {mode !== 'verify_pending' && mode !== 'forgot' && (
          <div className="text-center flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg(null);
                setShowResendAction(false);
              }}
              className="text-[11px] font-mono tracking-wide text-zinc-500 hover:text-zinc-300 transition-colors underline decoration-zinc-800 underline-offset-4 uppercase"
            >
              {mode === 'login'
                ? "DON'T HAVE AN ACCOUNT? REGISTER"
                : 'ALREADY REGISTERED? LOG IN'}
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <Link href="/legal/privacy" className="hover:text-zinc-400 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/legal/terms" className="hover:text-zinc-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
