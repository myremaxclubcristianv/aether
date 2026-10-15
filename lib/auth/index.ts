import { createClient } from '@/lib/supabase/client';
import { UserProfile, DbProfile } from '@/types';
import { User } from '@supabase/supabase-js';

/**
 * Validate password complexity according to security baseline
 * - At least 8 characters
 * - At least one letter
 * - At least one number or symbol
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter.' };
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number or symbol.' };
  }
  return { valid: true };
}

/**
 * Sign up a new user using email & password
 */
export async function signUp(email: string, password: string, username?: string) {
  const supabase = createClient();
  const cleanUsername = username?.trim() || `user_${Math.random().toString(36).substring(2, 10)}`;
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/confirm?next=/onboarding`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Resend email confirmation link for an unverified account
 */
export async function resendVerificationEmail(email: string) {
  const supabase = createClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/confirm?next=/onboarding`
      : undefined;

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Dispatch password reset email
 * Uses custom domain callback route: /auth/confirm?type=recovery&next=/auth/reset-password
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/confirm?type=recovery&next=/auth/reset-password`
      : undefined;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
  return data;
}

/**
 * Update authenticated user's password (e.g. during recovery session)
 */
export async function updatePassword(password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user using email & password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user session
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Retrieve the current authenticated user's profile from the database
 */
export async function getCurrentUser(): Promise<{ user: User | null; profile: UserProfile | null }> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()) as { data: DbProfile | null };

  if (!profile) {
    return { user, profile: null };
  }

  return {
    user,
    profile: {
      id: profile.id,
      username: profile.username,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      flexScore: profile.flex_score,
      streak: profile.streak,
      createdAt: profile.created_at,
    },
  };
}
