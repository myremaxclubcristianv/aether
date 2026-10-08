import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DbProfile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ProfileRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()) as { data: DbProfile | null };

  if (profile?.username) {
    redirect(`/${profile.username}`);
  }

  redirect('/onboarding');
}
