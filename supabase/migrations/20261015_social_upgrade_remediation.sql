-- =========================================================================
-- AETHER — REMEDIATION MIGRATION: HARDENING SOCIAL TABLES
-- Date: 2026-10-15 (Hardened, Verified & Audited Version)
-- Use this script ONLY if an earlier draft of the social tables was
-- already executed in an environment and needs to be brought up to the hardened state.
-- DO NOT RUN REMOTELY WITHOUT AUTHORIZATION.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. NOTIFICATIONS HARDENING
-- -------------------------------------------------------------------------

-- 1.1 Add safe link constraint on notifications without table lock
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notifications_link_check'
  ) then
    alter table public.notifications
      add constraint notifications_link_check
      check (link is null or (link ~ '^/[a-zA-Z0-9_/?&.=-]+$' and link not like '//%')) not valid;
    alter table public.notifications
      validate constraint notifications_link_check;
  end if;
end $$;

-- 1.2 Protect immutable notification columns
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

-- 1.3 Hardened notification policies (safe text comparisons, no unhandled UUID casting exceptions)
drop policy if exists "Users can insert notifications for others" on public.notifications;
drop policy if exists "Users can insert peer notifications" on public.notifications;
create policy "Users can insert peer notifications"
  on public.notifications for insert
  with check (
    auth.uid() is not null
    and actor_id = auth.uid()
    and auth.uid() <> user_id
    and (
      (
        type = 'new_follower'
        and exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = user_id
        )
      )
      or (
        type = 'challenge_invite'
        and exists (
          select 1 from public.challenges c
          where c.creator_id = auth.uid()
          and c.id::text = (metadata->>'challengeId')
        )
      )
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
-- 2. CHALLENGES HARDENING
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'challenges_dates_check'
  ) then
    alter table public.challenges
      add constraint challenges_dates_check check (ends_at > starts_at) not valid;
    alter table public.challenges
      validate constraint challenges_dates_check;
  end if;
end $$;

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

drop policy if exists "Public or participant challenges are viewable by everyone" on public.challenges;
create policy "Public or participant challenges are viewable by everyone"
  on public.challenges for select
  using (
    is_public = true
    or auth.uid() = creator_id
    or public.is_challenge_participant(id, auth.uid())
  );

-- -------------------------------------------------------------------------
-- 3. CHALLENGE PARTICIPANTS HARDENING
-- -------------------------------------------------------------------------
create or replace function public.protect_challenge_participant_columns()
returns trigger as $$
begin
  if new.id <> old.id or new.challenge_id <> old.challenge_id or new.user_id <> old.user_id or new.joined_at <> old.joined_at then
    raise exception 'Cannot modify participant identity or joined_at timestamp.';
  end if;

  if old.status in ('joined', 'completed') and new.status = 'invited' then
    raise exception 'Cannot demote active participant to invited.';
  end if;

  if new.proofs_count <> old.proofs_count then
    if new.proofs_count <> (
      select count(*) from public.challenge_proofs
      where challenge_id = old.challenge_id and user_id = old.user_id
    ) then
      raise exception 'Direct tampering with challenge proofs_count is prohibited.';
    end if;
  end if;

  if new.status = 'completed' and old.status <> 'completed' then
    if (select count(*) from public.challenge_proofs where challenge_id = old.challenge_id and user_id = old.user_id) <
       (select target_proof_count from public.challenges where id = old.challenge_id) then
      raise exception 'Cannot mark challenge as completed without verified proofs.';
    end if;
  end if;

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
    (
      exists (
        select 1 from public.challenges c
        where c.id = challenge_id and c.creator_id = auth.uid()
      )
      and status in ('invited', 'joined')
      and proofs_count = 0
    )
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

-- -------------------------------------------------------------------------
-- 4. CHALLENGE PROOFS TRIGGER & POLICIES HARDENING
-- -------------------------------------------------------------------------
create or replace function public.on_challenge_proof_linked()
returns trigger as $$
declare
  v_challenge_id uuid;
  v_user_id uuid;
  v_target integer;
  v_count integer;
begin
  v_challenge_id := coalesce(new.challenge_id, old.challenge_id);
  v_user_id := coalesce(new.user_id, old.user_id);

  select count(*) into v_count
  from public.challenge_proofs
  where challenge_id = v_challenge_id and user_id = v_user_id;

  select target_proof_count into v_target
  from public.challenges
  where id = v_challenge_id;

  if v_target is null then
    return coalesce(new, old);
  end if;

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

-- -------------------------------------------------------------------------
-- 5. FUNCTION & TABLE PRIVILEGES (LEAST PRIVILEGE)
-- -------------------------------------------------------------------------
revoke execute on function public.protect_notification_columns() from public, anon, authenticated;
revoke execute on function public.protect_challenge_participant_columns() from public, anon, authenticated;
revoke execute on function public.on_challenge_proof_linked() from public, anon, authenticated;
grant execute on function public.is_challenge_participant(uuid, uuid) to authenticated, anon;

-- Explicit least-privilege table grants for PostgREST client roles
grant select, insert, update, delete on public.challenges to authenticated;
grant select on public.challenges to anon;

grant select, insert, update, delete on public.challenge_participants to authenticated;
grant select on public.challenge_participants to anon;

grant select, insert on public.challenge_proofs to authenticated;
grant select on public.challenge_proofs to anon;

grant select, insert, update, delete on public.notifications to authenticated;

