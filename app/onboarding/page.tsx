'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { DbProfile } from '@/types';


export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);
        
        const { data: profile } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()) as { data: DbProfile | null };

        if (profile) {
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatar_url || '');
        }
      } catch {
        setError('Failed to load profile session.');
      } finally {
        setSessionLoading(false);
      }
    }

    loadSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }

    try {
      // Update the profile table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({
          username: username.toLowerCase().trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', userId);

      if (updateError) {
        if (updateError.code === '23505') {
          throw new Error('This username is already taken.');
        }
        throw updateError;
      }

      // Successful onboarding redirects to home profile page
      router.push('/home');
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'An error occurred while updating profile.';
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('Load failed')) {
        setError('Unable to reach database. Please check your network connection.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center bg-black min-h-screen">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 justify-center px-6 py-12 bg-black min-h-screen">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase select-none">
            O N B O A R D I N G
          </span>
          <h2 className="text-xl font-medium tracking-tight text-white mt-3">
            Configure Profile
          </h2>
          <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed">
            Customize how you will be recognized across the network.
          </p>
        </div>

        {/* Onboarding Form Card */}
        <Card className="border-zinc-900 bg-zinc-950/20 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <Avatar
                src={avatarUrl || undefined}
                fallback={username || 'U'}
                size="lg"
                className="border-zinc-800"
              />
              <span className="text-[10px] font-mono text-zinc-650 uppercase">Preview</span>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-650 font-light font-mono lowercase"
                placeholder="alexandre"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="bio" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="p-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-650 font-light resize-none leading-relaxed"
                placeholder="Ultramarathoner. Building decentralized compute..."
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="avatarUrl" className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Avatar Image URL (Optional)
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="h-10 px-3 rounded-md bg-zinc-900/40 border border-zinc-850 text-sm text-white focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-650 font-light"
                placeholder="https://example.com/avatar.jpg"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full mt-2 font-mono text-xs tracking-widest uppercase rounded-md h-10"
            >
              SAVE PROFILE
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
