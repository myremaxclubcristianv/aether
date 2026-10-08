-- Create the proof-images bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('proof-images', 'proof-images', true)
on conflict (id) do nothing;

-- Enable Row Level Security on storage.objects
alter table storage.objects enable row level security;

-- Policy 1: Public access to read/download proof images
create policy "Public Access to proof-images"
  on storage.objects for select
  using (bucket_id = 'proof-images');

-- Policy 2: Authenticated users can upload to a folder named after their uid
create policy "Authenticated users can upload proof-images"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update or delete only files within their personal uid folder
create policy "Users can manage their own proof-images"
  on storage.objects for all
  using (
    bucket_id = 'proof-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
