'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { DbProfile } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
          .maybeSingle()) as { data: DbProfile | null };

        if (profile) {
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatar_url || '');
          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
        } else {
          // Pre-fill default username candidate from user metadata or email
          const defaultUsername = user.user_metadata?.username || user.email?.split('@')[0] || '';
          const sanitized = defaultUsername.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          if (sanitized.length >= 3) {
            setUsername(sanitized);
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
        setError('Failed to load profile session.');
      } finally {
        setSessionLoading(false);
      }
    }

    loadSession();
  }, [router, supabase]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    const cleanUsername = username.toLowerCase().trim();

    // Basic validation
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError('Username can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }

    try {
      let finalAvatarUrl = avatarUrl.trim() || null;

      // Upload avatar file to storage if user selected a file
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

        // Attempt upload to 'avatars' bucket, fallback to 'proof-images'
        let uploadBucket = 'avatars';
        const { error: uploadErr } = await supabase.storage
          .from(uploadBucket)
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadErr) {
          uploadBucket = 'proof-images';
          const { error: fallbackErr } = await supabase.storage
            .from(uploadBucket)
            .upload(filePath, avatarFile, { upsert: true });

          if (fallbackErr) {
            console.error('Avatar upload error:', fallbackErr);
            throw new Error(`Failed to upload avatar image: ${fallbackErr.message}`);
          }
        }

        const { data: publicUrlData } = supabase.storage
          .from(uploadBucket)
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      // Upsert into profiles table to handle both new and existing profile rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase.from('profiles') as any)
        .upsert(
          {
            id: userId,
            username: cleanUsername,
            bio: bio.trim() || null,
            avatar_url: finalAvatarUrl,
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        if (upsertError.code === '23505') {
          throw new Error('This username is already taken. Please choose another.');
        }
        if (upsertError.code === '42501') {
          throw new Error('Permission denied. Please ensure Supabase RLS INSERT policy is enabled on profiles.');
        }
        throw upsertError;
      }

      // Dispatch Telegram signup/onboarding completion event (non-blocking)
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SIGNUP', username: cleanUsername }),
      }).catch(() => {});

      // Successful onboarding redirects to home profile page
      router.push('/home');
      router.refresh();
    } catch (err) {
      console.error('Onboarding submit error:', err);
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

            {/* Avatar Preview & File Upload */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer group relative rounded-full"
                title="Click to upload avatar"
              >
                <Avatar
                  src={avatarPreview || avatarUrl || undefined}
                  fallback={username || 'U'}
                  size="lg"
                  className="border-zinc-800 group-hover:border-zinc-600 transition-colors"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg
                    className="h-4 w-4 text-white stroke-[2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors"
              >
                {avatarFile ? 'Change Photo' : 'Upload Photo'}
              </button>
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
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  if (!avatarFile) setAvatarPreview(e.target.value);
                }}
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
