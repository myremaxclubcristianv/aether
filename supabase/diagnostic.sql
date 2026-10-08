-- ==============================================================================
-- AETHER COMPLETE DATABASE DIAGNOSTIC & REPAIR SCRIPT
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create tables if not present
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  flex_score integer default 0 not null,
  streak integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3)
);

create table if not exists public.proofs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  category text not null,
  caption text not null,
  points integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_followers unique (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

-- 2. Indexes for fast queries
create index if not exists proofs_user_id_idx on public.proofs (user_id);
create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_following_id_idx on public.follows (following_id);

-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.proofs enable row level security;
alter table public.follows enable row level security;

-- 4. Re-create / Ensure Profiles RLS Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. Re-create / Ensure Proofs RLS Policies
drop policy if exists "Public proofs are viewable by everyone" on public.proofs;
create policy "Public proofs are viewable by everyone"
  on public.proofs for select
  using (true);

drop policy if exists "Users can insert their own proofs" on public.proofs;
create policy "Users can insert their own proofs"
  on public.proofs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own proofs" on public.proofs;
create policy "Users can update their own proofs"
  on public.proofs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own proofs" on public.proofs;
create policy "Users can delete their own proofs"
  on public.proofs for delete
  using (auth.uid() = user_id);

-- 6. Re-create / Ensure Follows RLS Policies
drop policy if exists "Public follows are viewable by everyone" on public.follows;
create policy "Public follows are viewable by everyone"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow others" on public.follows;
create policy "Users can unfollow others"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 7. Trigger for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, bio, flex_score, streak)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Backfill any existing auth users missing a profile row
insert into public.profiles (id, username, avatar_url, bio, flex_score, streak)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'bio',
  0,
  0
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

-- 9. Storage buckets and policies
insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

-- Proof images storage policies
drop policy if exists "Public Access to proof-images" on storage.objects;
create policy "Public Access to proof-images"
  on storage.objects for select
  using (bucket_id = 'proof-images');

drop policy if exists "Authenticated users can upload proof-images" on storage.objects;
create policy "Authenticated users can upload proof-images"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can manage their own proof-images" on storage.objects;
create policy "Users can manage their own proof-images"
  on storage.objects for all
  using (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Avatars storage policies
drop policy if exists "Public Access to avatars" on storage.objects;
create policy "Public Access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can manage their own avatars" on storage.objects;
create policy "Users can manage their own avatars"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
