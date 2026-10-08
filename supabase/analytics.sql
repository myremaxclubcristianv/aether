-- Optional Analytics Events Table for Aether Behavior Telemetry
-- Stores minimal, non-sensitive product events

create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on analytics_events (strictly restricted: no public select)
alter table public.analytics_events enable row level security;

-- Insert policy for authenticated or service role
create policy "Users can log their own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id or user_id is null);

-- No public select policy (Admin queries use privileged server client)

-- Performance Indexes
create index if not exists analytics_events_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_user_idx on public.analytics_events (user_id);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
