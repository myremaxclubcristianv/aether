import { createClient } from '@/lib/supabase/client';
import { UserProfile, DbProfile } from '@/types';
import { User } from '@supabase/supabase-js';


/**
 * Sign up a new user using email & password
 */
export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
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
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
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
