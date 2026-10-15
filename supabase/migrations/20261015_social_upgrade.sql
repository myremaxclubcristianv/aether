-- =========================================================================
-- AETHER — SOCIAL EXPANSION MIGRATION: NOTIFICATIONS & SOCIAL CHALLENGES
-- Date: 2026-10-15 (Fully Hardened, Verified & Security-Audited Version)
-- Clean, idempotent, non-destructive, with least-privilege Row Level Security (RLS)
-- Execution Order: Tables -> Functions & Triggers -> RLS Policies -> Indexes -> Grants
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. BASE TABLE DEFINITIONS (CREATED IN STRICT DEPENDENCY ORDER)
-- -------------------------------------------------------------------------

-- 1.1 CHALLENGES TABLE
create table if not exists public.challenges (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(trim(title)) >= 3 and char_length(title) <= 100),
  description text not null check (char_length(trim(description)) >= 5 and char_length(description) <= 1000),
  category text not null,
  duration_days integer not null check (duration_days in (7, 14, 21, 30, 60, 90)),
  target_proof_count integer not null check (target_proof_count >= 1 and target_proof_count <= 100),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  is_public boolean not null default true,
  starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint challenges_dates_check check (ends_at > starts_at)
);

-- 1.2 CHALLENGE PARTICIPANTS TABLE
create table if not exists public.challenge_participants (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'joined' check (status in ('invited', 'joined', 'declined', 'completed', 'left')),
  proofs_count integer not null default 0 check (proofs_count >= 0),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  
  constraint unique_challenge_participant unique (challenge_id, user_id)
);

-- 1.3 CHALLENGE PROOFS ASSOCIATION TABLE
create table if not exists public.challenge_proofs (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  proof_id uuid references public.proofs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint unique_challenge_proof unique (challenge_id, proof_id)
);

-- 1.4 NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'new_follower',
    'challenge_invite',
    'challenge_accepted',
    'challenge_declined',
    'challenge_started',
    'challenge_progress',
    'challenge_completed'
  )),
  title text not null check (char_length(trim(title)) between 1 and 100),
  body text not null check (char_length(trim(body)) between 1 and 500),
  link text check (link is null or (link ~ '^/[a-zA-Z0-9_/?&.=-]+$' and link not like '//%')),
  read boolean default false not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.challenge_proofs enable row level security;
alter table public.notifications enable row level security;

-- -------------------------------------------------------------------------
-- 2. SECURITY DEFINER FUNCTIONS & TRIGGERS
-- -------------------------------------------------------------------------

-- 2.1 Function to check challenge membership without policy recursion and without leaking private participation
create or replace function public.is_challenge_participant(p_challenge_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.challenge_participants cp
    join public.challenges c on c.id = cp.challenge_id
    where cp.challenge_id = p_challenge_id
      and cp.user_id = p_user_id
      and (
        p_user_id = auth.uid()
        or c.is_public = true
        or c.creator_id = auth.uid()
      )
  );
$$ language sql security definer stable
set search_path = public, pg_temp;

-- 2.2 Trigger function to protect challenge_participants from direct tampering
create or replace function public.protect_challenge_participant_columns()
returns trigger as $$
begin
  -- Immutable relational identity
  if new.id <> old.id or new.challenge_id <> old.challenge_id or new.user_id <> old.user_id or new.joined_at <> old.joined_at then
    raise exception 'Cannot modify participant identity or joined_at timestamp.';
  end if;

  -- Prevent invalid demotion: active or completed participant cannot be forced back to invited
  if old.status in ('joined', 'completed') and new.status = 'invited' then
    raise exception 'Cannot demote active participant to invited.';
  end if;

  -- proofs_count must match actual verified proof records in challenge_proofs
  if new.proofs_count <> old.proofs_count then
    if new.proofs_count <> (
      select count(*) from public.challenge_proofs
      where challenge_id = old.challenge_id and user_id = old.user_id
    ) then
      raise exception 'Direct tampering with challenge proofs_count is prohibited.';
    end if;
  end if;

  -- Status transitioning to 'completed' requires verified proofs >= target
  if new.status = 'completed' and old.status <> 'completed' then
    if (select count(*) from public.challenge_proofs where challenge_id = old.challenge_id and user_id = old.user_id) <
       (select target_proof_count from public.challenges where id = old.challenge_id) then
      raise exception 'Cannot mark challenge as completed without verified proofs.';
    end if;
  end if;

  -- completed_at protection: cannot set completed_at without satisfied criteria, and must be null if not completed
  if new.completed_at is distinct from old.completed_at then
    if new.status = 'completed' then
      if (select count(*) from public.challenge_proofs where challenge_id = old.challenge_id and user_id = old.user_id) <
         (select target_proof_count from public.challenges where id = old.challenge_id) then
        raise exception 'Cannot set completed_at without satisfied completion criteria.';
      end if;
    elsif new.completed_at is not null then
      raise exception 'completed_at must be null when status is not completed.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer
set search_path = public, pg_temp;

drop trigger if exists trg_protect_challenge_participant_columns on public.challenge_participants;
create trigger trg_protect_challenge_participant_columns
  before update on public.challenge_participants
  for each row execute function public.protect_challenge_participant_columns();

-- 2.3 Authoritative progress sync trigger on challenge_proofs insert OR delete (reconciliation)
create or replace function public.on_challenge_proof_linked()
returns trigger as $$
declare
  v_challenge_id uuid;
  v_user_id uuid;
  v_target integer;
  v_count integer;
begin
  -- Identify affected challenge & participant across both INSERT (NEW) and DELETE (OLD)
  v_challenge_id := coalesce(new.challenge_id, old.challenge_id);
  v_user_id := coalesce(new.user_id, old.user_id);

  -- Recalculate true verified proof count from challenge_proofs
  select count(*) into v_count
  from public.challenge_proofs
  where challenge_id = v_challenge_id and user_id = v_user_id;

  -- Get sprint target proof count
  select target_proof_count into v_target
  from public.challenges
  where id = v_challenge_id;

  if v_target is null then
    return coalesce(new, old);
  end if;

  -- Authoritatively update participant record (reconciling status and completion)
  update public.challenge_participants
  set proofs_count = v_count,
      status = case 
        when v_count >= v_target then 'completed' 
        when status = 'completed' and v_count < v_target then 'joined'
        else status 
      end,
      completed_at = case 
        when v_count >= v_target and completed_at is null then timezone('utc'::text, now())
        when v_count < v_target then null
        else completed_at 
      end
  where challenge_id = v_challenge_id and user_id = v_user_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer
set search_path = public, pg_temp;

drop trigger if exists trg_on_challenge_proof_linked on public.challenge_proofs;
create trigger trg_on_challenge_proof_linked
  after insert or delete on public.challenge_proofs
  for each row execute function public.on_challenge_proof_linked();

-- 2.4 Trigger to protect immutable notification fields (only 'read' column can be updated)
create or replace function public.protect_notification_columns()
returns trigger as $$
begin
  if new.id <> old.id
     or new.user_id <> old.user_id
     or new.actor_id is distinct from old.actor_id
     or new.type <> old.type
     or new.title <> old.title
     or new.body <> old.body
     or new.link is distinct from old.link
     or new.metadata is distinct from old.metadata
     or new.created_at <> old.created_at then
    raise exception 'Only the "read" column can be updated on notifications.';
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public, pg_temp;

drop trigger if exists trg_protect_notification_columns on public.notifications;
create trigger trg_protect_notification_columns
  before update on public.notifications
  for each row execute function public.protect_notification_columns();

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------

-- 3.1 POLICIES FOR CHALLENGES
drop policy if exists "Public or participant challenges are viewable by everyone" on public.challenges;
create policy "Public or participant challenges are viewable by everyone"
  on public.challenges for select
  using (
    is_public = true
    or auth.uid() = creator_id
    or public.is_challenge_participant(id, auth.uid())
  );

drop policy if exists "Users can create challenges" on public.challenges;
create policy "Users can create challenges"
  on public.challenges for insert
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can update their challenges" on public.challenges;
create policy "Creators can update their challenges"
  on public.challenges for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can delete their challenges" on public.challenges;
create policy "Creators can delete their challenges"
  on public.challenges for delete
  using (auth.uid() = creator_id);

-- 3.2 POLICIES FOR CHALLENGE_PARTICIPANTS
drop policy if exists "Challenge participants are viewable by everyone" on public.challenge_participants;
drop policy if exists "Challenge participants viewable for public or enrolled challenges" on public.challenge_participants;
create policy "Challenge participants viewable for public or enrolled challenges"
  on public.challenge_participants for select
  using (
    auth.uid() = user_id
    or (select is_public from public.challenges where id = challenge_id) = true
    or (select creator_id from public.challenges where id = challenge_id) = auth.uid()
    or public.is_challenge_participant(challenge_id, auth.uid())
  );

drop policy if exists "Users can join or creators can invite participants" on public.challenge_participants;
drop policy if exists "Users can join public challenges or creators can invite" on public.challenge_participants;
create policy "Users can join public challenges or creators can invite"
  on public.challenge_participants for insert
  with check (
    -- Creator inviting another user or creator joining their challenge
    (
      exists (
        select 1 from public.challenges c
        where c.id = challenge_id and c.creator_id = auth.uid()
      )
      and status in ('invited', 'joined')
      and proofs_count = 0
    )
    -- User joining a public challenge directly
    or (
      auth.uid() = user_id
      and status = 'joined'
      and proofs_count = 0
      and exists (
        select 1 from public.challenges c
        where c.id = challenge_id and c.is_public = true
      )
    )
  );

drop policy if exists "Users can update their own participation status" on public.challenge_participants;
drop policy if exists "Users can update their participation status" on public.challenge_participants;
create policy "Users can update their participation status"
  on public.challenge_participants for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.challenges c
      where c.id = challenge_id and c.creator_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.challenges c
      where c.id = challenge_id and c.creator_id = auth.uid()
    )
  );

drop policy if exists "Users can leave challenges" on public.challenge_participants;
create policy "Users can leave challenges"
  on public.challenge_participants for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.challenges c
      where c.id = challenge_id and c.creator_id = auth.uid()
    )
  );

-- 3.3 POLICIES FOR CHALLENGE_PROOFS
drop policy if exists "Challenge proofs are viewable by everyone" on public.challenge_proofs;
create policy "Challenge proofs are viewable by everyone"
  on public.challenge_proofs for select
  using (true);

drop policy if exists "Users can link their own proofs to challenges" on public.challenge_proofs;
create policy "Users can link their own proofs to challenges"
  on public.challenge_proofs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.proofs p
      join public.challenges c on c.id = challenge_id
      join public.challenge_participants cp on cp.challenge_id = challenge_id and cp.user_id = auth.uid()
      where p.id = proof_id
        and p.user_id = auth.uid()
        and cp.status in ('joined', 'completed')
        and c.status = 'active'
        and (c.category = 'All' or c.category = p.category)
        and p.created_at >= c.starts_at
        and p.created_at <= c.ends_at
    )
  );

-- 3.4 POLICIES FOR NOTIFICATIONS
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can insert notifications for others" on public.notifications;
drop policy if exists "Users can insert peer notifications" on public.notifications;
create policy "Users can insert peer notifications"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    and actor_id = auth.uid()
    and auth.uid() <> user_id
    and (
      -- 1. Must actually follow the target user to send new_follower
      (
        type = 'new_follower'
        and exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = user_id
        )
      )
      -- 2. Must be the sprint creator to send challenge_invite (safe cast comparison)
      or (
        type = 'challenge_invite'
        and exists (
          select 1 from public.challenges c
          where c.creator_id = auth.uid()
          and c.id::text = (metadata->>'challengeId')
        )
      )
      -- 3. Must be an enrolled participant in a sprint created by user_id to send challenge_accepted
      or (
        type = 'challenge_accepted'
        and exists (
          select 1 from public.challenge_participants cp
          join public.challenges c on c.id = cp.challenge_id
          where cp.user_id = auth.uid()
          and c.creator_id = user_id
          and c.id::text = (metadata->>'challengeId')
        )
      )
      -- 4. Must be responding to a challenge created by user_id to send challenge_declined
      or (
        type = 'challenge_declined'
        and exists (
          select 1 from public.challenges c
          where c.creator_id = user_id
          and c.id::text = (metadata->>'challengeId')
        )
      )
    )
  );

drop policy if exists "Users can insert self milestone notifications" on public.notifications;
create policy "Users can insert self milestone notifications"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
    and (
      (
        type = 'challenge_started'
        and exists (
          select 1 from public.challenge_participants cp
          where cp.challenge_id::text = (metadata->>'challengeId')
          and cp.user_id = auth.uid()
          and cp.status in ('joined', 'completed')
        )
      )
      or (
        type = 'challenge_progress'
        and exists (
          select 1 from public.challenge_participants cp
          where cp.challenge_id::text = (metadata->>'challengeId')
          and cp.user_id = auth.uid()
          and cp.status in ('joined', 'completed')
          and cp.proofs_count > 0
        )
      )
      or (
        type = 'challenge_completed'
        and exists (
          select 1 from public.challenge_participants cp
          where cp.challenge_id::text = (metadata->>'challengeId')
          and cp.user_id = auth.uid()
          and cp.status = 'completed'
        )
      )
    )
  );

-- -------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- -------------------------------------------------------------------------
create index if not exists challenges_creator_id_idx on public.challenges (creator_id);
create index if not exists challenges_status_ends_at_idx on public.challenges (status, ends_at);
create index if not exists challenges_category_idx on public.challenges (category);

create index if not exists challenge_participants_challenge_id_idx on public.challenge_participants (challenge_id);
create index if not exists challenge_participants_user_id_idx on public.challenge_participants (user_id);

create index if not exists challenge_proofs_challenge_id_idx on public.challenge_proofs (challenge_id);
create index if not exists challenge_proofs_user_id_idx on public.challenge_proofs (user_id);
create index if not exists challenge_proofs_proof_id_idx on public.challenge_proofs (proof_id);

create index if not exists notifications_user_id_read_created_idx on public.notifications (user_id, read, created_at desc);
create index if not exists notifications_actor_id_idx on public.notifications (actor_id);

-- -------------------------------------------------------------------------
-- 5. LEAST PRIVILEGE FUNCTION & TABLE ACCESS GRANTS
-- -------------------------------------------------------------------------
-- Trigger functions must not be directly executable by client roles
revoke execute on function public.protect_notification_columns() from public, anon, authenticated;
revoke execute on function public.protect_challenge_participant_columns() from public, anon, authenticated;
revoke execute on function public.on_challenge_proof_linked() from public, anon, authenticated;

-- RLS helper function strictly granted to client roles for policy evaluation
grant execute on function public.is_challenge_participant(uuid, uuid) to authenticated, anon;

-- Explicit least-privilege table grants for PostgREST client roles
grant select, insert, update, delete on public.challenges to authenticated;
grant select on public.challenges to anon;

grant select, insert, update, delete on public.challenge_participants to authenticated;
grant select on public.challenge_participants to anon;

grant select, insert on public.challenge_proofs to authenticated;
grant select on public.challenge_proofs to anon;

grant select, insert, update, delete on public.notifications to authenticated;

