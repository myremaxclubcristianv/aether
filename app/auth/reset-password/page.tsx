'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updatePassword, validatePassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();

        if (isMounted) {
          if (!sessionError && user) {
            setHasValidSession(true);
          } else {
            setHasValidSession(false);
          }
        }
      } catch {
        if (isMounted) setHasValidSession(false);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password complexity
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message || 'Password does not meet requirements.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err) {
      console.error('[PASSWORD RESET ERROR]', err);
      const rawMsg = err instanceof Error ? err.message : 'Failed to update password.';
      const lower = rawMsg.toLowerCase();
      if (
        rawMsg.includes('Failed to fetch') ||
        rawMsg.includes('Load failed') ||
        rawMsg.includes('NetworkError') ||
        lower.includes('networkerror') ||
        lower.includes('network error')
      ) {
        setError('Unable to connect to authentication service. Please check your network connection.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 justify-center px-6 py-12 bg-black min-h-screen selection:bg-zinc-800 selection:text-white">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase select-none hover:text-white transition-colors">
            A E T H E R
          </Link>
          <h1 className="text-xl font-medium tracking-tight text-white mt-3">
            Set New Password
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed">
            Choose a strong password to protect your account.
          </p>
        </div>

        {/* Content Card */}
        <Card className="border-zinc-900 bg-zinc-950/40 p-6">
          {!hasValidSession ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-3 rounded-md bg-red-950/20 border border-red-900/30 text-[11px] font-mono text-red-400">
                The password reset session is invalid, expired, or was already used.
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                For security reasons, password reset links expire after a short period. Please request a new link to proceed.
              </p>
              <Link
                href="/login?mode=forgot"
                className="mt-2 h-10 px-4 rounded-md bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center font-mono text-xs uppercase tracking-wider font-semibold"
              >
                Request New Link
              </Link>
            </div>
          ) : success ? (
            <div className="flex flex-col gap-4 text-center animate-in fade-in duration-300">
              <div className="p-3 rounded-md bg-emerald-950/20 border border-emerald-900/30 text-[11px] font-mono text-emerald-400">
                Password updated successfully.
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Your credentials have been securely updated. Redirecting to your dashboard...
              </p>
              <Link
                href="/home"
                className="mt-2 h-10 px-4 rounded-md bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center font-mono text-xs uppercase tracking-wider font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="new-password"
                  className="text-[10px] font-mono uppercase tracking-wider text-zinc-500"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 font-light"
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirm-password"
                  className="text-[10px] font-mono uppercase tracking-wider text-zinc-500"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600 font-light"
                  placeholder="Repeat new password"
                  disabled={loading}
                />
              </div>

              <div className="text-[10px] font-mono text-zinc-500 bg-zinc-900/30 p-2.5 rounded border border-zinc-850/60 leading-relaxed">
                Requirements: At least 8 characters, with letters and numbers or symbols.
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full mt-2 font-mono text-xs tracking-widest uppercase rounded-md h-10"
              >
                UPDATE PASSWORD
              </Button>
            </form>
          )}
        </Card>

        {/* Return to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-[11px] font-mono tracking-wide text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
