-- Create buckets if they do not exist
insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable Row Level Security on storage.objects
alter table storage.objects enable row level security;

-- Proof Images Policies
create policy "Public Access to proof-images"
  on storage.objects for select
  using (bucket_id = 'proof-images');

create policy "Authenticated users can upload proof-images"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can manage their own proof-images"
  on storage.objects for all
  using (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Avatars Policies
create policy "Public Access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can manage their own avatars"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
