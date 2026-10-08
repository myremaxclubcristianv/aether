-- ==============================================================================
-- AETHER COMPLETE DATABASE DIAGNOSTIC & REPAIR SCRIPT (LEAST PRIVILEGE & IDEMPOTENT)
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create tables if not present (non-destructive; existing tables & columns remain untouched)
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

-- 2. Performance indexes
create index if not exists proofs_user_id_idx on public.proofs (user_id);
create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_following_id_idx on public.follows (following_id);

-- 3. Enable RLS on Aether public tables
alter table public.profiles enable row level security;
alter table public.proofs enable row level security;
alter table public.follows enable row level security;

-- 4. Re-create / Ensure Profiles RLS Policies (scoped strictly to Aether policies)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Aether public profiles select" on public.profiles;
drop policy if exists "Aether users insert profile" on public.profiles;
drop policy if exists "Aether users update profile" on public.profiles;

create policy "Aether public profiles select"
  on public.profiles for select
  using (true);

create policy "Aether users insert profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Aether users update profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. Re-create / Ensure Proofs RLS Policies
drop policy if exists "Public proofs are viewable by everyone" on public.proofs;
drop policy if exists "Users can insert their own proofs" on public.proofs;
drop policy if exists "Users can update their own proofs" on public.proofs;
drop policy if exists "Users can delete their own proofs" on public.proofs;
drop policy if exists "Aether public proofs select" on public.proofs;
drop policy if exists "Aether users insert proofs" on public.proofs;
drop policy if exists "Aether users update proofs" on public.proofs;
drop policy if exists "Aether users delete proofs" on public.proofs;

create policy "Aether public proofs select"
  on public.proofs for select
  using (true);

create policy "Aether users insert proofs"
  on public.proofs for insert
  with check (auth.uid() = user_id);

create policy "Aether users update proofs"
  on public.proofs for update
  using (auth.uid() = user_id);

create policy "Aether users delete proofs"
  on public.proofs for delete
  using (auth.uid() = user_id);

-- 6. Re-create / Ensure Follows RLS Policies
drop policy if exists "Public follows are viewable by everyone" on public.follows;
drop policy if exists "Users can follow others" on public.follows;
drop policy if exists "Users can unfollow others" on public.follows;
drop policy if exists "Aether public follows select" on public.follows;
drop policy if exists "Aether users insert follows" on public.follows;
drop policy if exists "Aether users delete follows" on public.follows;

create policy "Aether public follows select"
  on public.follows for select
  using (true);

create policy "Aether users insert follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Aether users delete follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 7. Trigger for new auth users (clean error propagation; idempotent on conflict)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, bio, flex_score, streak)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Safe Non-Destructive Backfill for missing profiles (guaranteed unique usernames)
do $$
declare
  r record;
  candidate_username text;
begin
  for r in
    select u.id, u.raw_user_meta_data
    from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
  loop
    candidate_username := coalesce(
      nullif(trim(r.raw_user_meta_data->>'username'), ''),
      'user_' || substr(replace(r.id::text, '-', ''), 1, 10)
    );

    -- Ensure candidate meets length requirement
    if char_length(candidate_username) < 3 then
      candidate_username := 'user_' || substr(replace(r.id::text, '-', ''), 1, 10);
    end if;

    -- Ensure unique username without collisions
    if exists (select 1 from public.profiles where username = candidate_username and id <> r.id) then
      candidate_username := 'user_' || substr(replace(r.id::text, '-', ''), 1, 14);
    end if;

    if exists (select 1 from public.profiles where username = candidate_username and id <> r.id) then
      candidate_username := 'user_' || substr(replace(r.id::text, '-', ''), 1, 20);
    end if;

    insert into public.profiles (id, username, avatar_url, bio, flex_score, streak)
    values (
      r.id,
      candidate_username,
      r.raw_user_meta_data->>'avatar_url',
      r.raw_user_meta_data->>'bio',
      0,
      0
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

-- 9. Storage Buckets (proof-images & avatars)
insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 10. Storage Least Privilege Policies (Granular SELECT, INSERT, UPDATE, DELETE per user folder)

-- Clean up legacy/previous policies
drop policy if exists "Public Access to proof-images" on storage.objects;
drop policy if exists "Authenticated users can upload proof-images" on storage.objects;
drop policy if exists "Users can manage their own proof-images" on storage.objects;
drop policy if exists "Aether public proof-images select" on storage.objects;
drop policy if exists "Aether users insert proof-images" on storage.objects;
drop policy if exists "Aether users update proof-images" on storage.objects;
drop policy if exists "Aether users delete proof-images" on storage.objects;

drop policy if exists "Public Access to avatars" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can manage their own avatars" on storage.objects;
drop policy if exists "Aether public avatars select" on storage.objects;
drop policy if exists "Aether users insert avatars" on storage.objects;
drop policy if exists "Aether users update avatars" on storage.objects;
drop policy if exists "Aether users delete avatars" on storage.objects;

-- proof-images Policies
create policy "Aether public proof-images select"
  on storage.objects for select
  using (bucket_id = 'proof-images');

create policy "Aether users insert proof-images"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Aether users update proof-images"
  on storage.objects for update
  using (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Aether users delete proof-images"
  on storage.objects for delete
  using (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars Policies
create policy "Aether public avatars select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Aether users insert avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Aether users update avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Aether users delete avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
