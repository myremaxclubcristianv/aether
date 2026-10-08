'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const isSubmittingRef = React.useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const data = await signIn(email, password);
        
        // Dispatch Telegram login notification (non-blocking)
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'LOGIN', email, username: data?.user?.user_metadata?.username }),
        }).catch(() => {});

        // Direct users to /onboarding if profile is incomplete, otherwise /home
        const supabase = createClient();
        const { data: profile } = (await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .maybeSingle()) as { data: { username: string } | null };

        if (profile?.username && !profile.username.startsWith('user_')) {
          router.push('/home');
        } else {
          router.push('/onboarding');
        }
      } else {
        const data = await signUp(email, password);

        // Dispatch Telegram signup notification (non-blocking)
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SIGNUP', email }),
        }).catch(() => {});

        if (data?.session) {
          router.push('/onboarding');
        } else if (data?.user?.identities && data.user.identities.length === 0) {
          setError('An account with this email address already exists.');
        } else {
          setSuccessMsg('Account created. Please check your email for confirmation before logging in.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'An authentication error occurred.';
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('Load failed')) {
        setError('Unable to connect to authentication service. Please check your network connection.');
      } else if (rawMsg.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (rawMsg.toLowerCase().includes('user already registered')) {
        setError('An account with this email address already exists.');
      } else if (rawMsg.toLowerCase().includes('rate limit') || rawMsg.toLowerCase().includes('over_email_send_rate_limit')) {
        setError('Email rate limit reached for the Supabase default mailer. Please try again in a few minutes or disable email confirmation in Supabase.');
      } else {
        setError(rawMsg);
      }
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center px-6 py-12 bg-black min-h-screen">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase select-none">
            A E T H E R
          </span>
          <h2 className="text-xl font-medium tracking-tight text-white mt-3">
            {isLogin ? 'Welcome back' : 'Create credentials'}
          </h2>
          <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed">
            {isLogin 
              ? 'Enter email and password to access your achievements.' 
              : 'Register your email to begin verifying your proofs.'}
          </p>
        </div>

        {/* Auth form Card */}
        <Card className="border-zinc-900 bg-zinc-950/20 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900/40 border border-zinc-800 px-3 py-2 rounded-md">
                {successMsg}
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
              <label htmlFor="password" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-•••••••• font-light"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full mt-2 font-mono text-xs tracking-widest uppercase rounded-md h-10"
            >
              {isLogin ? 'LOG IN' : 'REGISTER'}
            </Button>
          </form>
        </Card>

        {/* Switch mode Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-[11px] font-mono tracking-wide text-zinc-500 hover:text-zinc-300 transition-colors underline decoration-zinc-800 underline-offset-4"
          >
            {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : 'ALREADY REGISTERED? LOG IN'}
          </button>
        </div>
      </div>
    </div>
  );
}
