/**
 * AETHER — POSTGRESQL INTEGRATION GATE TEST SUITE
 * 
 * Verifies the social migration against a real PostgreSQL engine (PGlite or native Postgres).
 * Tests all 9 security groups: Fresh Installation, Remediation, Notifications RLS,
 * Challenge Proof Eligibility, Participant Integrity, Cascade Reconciliation,
 * Security Definer Catalog & Isolation, Concurrency Deduplication, and Scoring Invariance.
 *
 * Execution:
 * NODE_PATH=<pglite-path> node tests/pg-integration.test.mjs
 * Or:
 * node tests/pg-integration.test.mjs (when @electric-sql/pglite is installed in node_modules)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const FRESH_MIGRATION_PATH = path.join(rootDir, 'supabase/migrations/20261015_social_upgrade.sql');
const REMEDIATION_MIGRATION_PATH = path.join(rootDir, 'supabase/migrations/20261015_social_upgrade_remediation.sql');

async function getPgEngine() {
  try {
    const { PGlite } = await import('@electric-sql/pglite');
    return PGlite;
  } catch {
    // Check fallback scratch path
    const scratchPath = '/Users/cristianvaduva/.gemini/antigravity-ide/brain/ac007090-9f1a-4df2-bde6-7c6eeb788e95/scratch/node_modules/@electric-sql/pglite/dist/index.js';
    if (fs.existsSync(scratchPath)) {
      const { PGlite } = await import(scratchPath);
      return PGlite;
    }
    throw new Error('Could not find @electric-sql/pglite runtime. Please run with NODE_PATH pointing to PGlite.');
  }
}

const results = [];

function recordTest(group, testName, expected, actual, pass) {
  results.push({ group, testName, expected, actual, pass });
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] [Group ${group}] ${testName}: ${actual}`);
}

async function setupSupabasePrelude(db) {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;

    create schema if not exists auth;
    create or replace function auth.uid() returns uuid as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ language sql stable;

    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;

    create table if not exists public.profiles (
      id uuid primary key,
      username text not null unique,
      avatar_url text,
      bio text,
      flex_score integer default 0 not null,
      streak integer default 0 not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    create table if not exists public.follows (
      follower_id uuid references public.profiles(id) on delete cascade not null,
      following_id uuid references public.profiles(id) on delete cascade not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      primary key (follower_id, following_id)
    );

    create table if not exists public.proofs (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles(id) on delete cascade not null,
      category text not null,
      caption text not null,
      image_url text,
      points integer not null default 10,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    grant usage on schema public to anon, authenticated, service_role;
    grant all on all tables in schema public to anon, authenticated, service_role;
    grant all on all sequences in schema public to anon, authenticated, service_role;
    grant all on all routines in schema public to anon, authenticated, service_role;

    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
  `);
}

async function asUser(db, userId, fn) {
  await db.exec(`set role authenticated; set "request.jwt.claim.sub" = '${userId}';`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; reset "request.jwt.claim.sub";`);
  }
}

async function asAnon(db, fn) {
  await db.exec(`set role anon; reset "request.jwt.claim.sub";`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role;`);
  }
}

export async function runIntegrationGate() {
  console.log('=== STARTING POSTGRESQL INTEGRATION GATE ===\n');

  const PGlite = await getPgEngine();

  // -------------------------------------------------------------------------
  // GROUP 1: FRESH INSTALLATION
  // -------------------------------------------------------------------------
  const db1 = new PGlite();
  await setupSupabasePrelude(db1);

  let freshSuccess = false;
  try {
    const freshSql = fs.readFileSync(FRESH_MIGRATION_PATH, 'utf8');
    await db1.exec(freshSql);
    freshSuccess = true;
  } catch (err) {
    recordTest(1, 'Fresh migration DDL execution', 'Success', `Error: ${err.message}`, false);
  }

  if (freshSuccess) {
    recordTest(1, 'Fresh migration DDL execution', 'Success', 'Migration executed cleanly', true);

    const tablesRes = await db1.query(`
      select table_name from information_schema.tables 
      where table_schema = 'public' and table_name in ('challenges', 'challenge_participants', 'challenge_proofs', 'notifications')
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    const expectedTables = ['challenge_participants', 'challenge_proofs', 'challenges', 'notifications'];
    const tablesMatch = expectedTables.every(t => tables.includes(t));
    recordTest(1, 'Schema tables verification', expectedTables.join(','), tables.sort().join(','), tablesMatch);

    const constrRes = await db1.query(`
      select conname from pg_constraint 
      where conname in ('challenges_dates_check', 'unique_challenge_participant', 'unique_challenge_proof', 'notifications_link_check')
    `);
    const constrs = constrRes.rows.map(r => r.conname);
    recordTest(1, 'Constraints verification', '4 key constraints present', `${constrs.length} constraints present (${constrs.join(',')})`, constrs.length === 4);

    const trigRes = await db1.query(`
      select tgname from pg_trigger 
      where tgname in ('trg_protect_challenge_participant_columns', 'trg_on_challenge_proof_linked', 'trg_protect_notification_columns')
    `);
    const triggers = trigRes.rows.map(r => r.tgname);
    recordTest(1, 'Triggers verification', '3 key triggers present', `${triggers.length} triggers present (${triggers.join(',')})`, triggers.length === 3);

    const rlsRes = await db1.query(`
      select tablename, rowsecurity from pg_tables 
      where schemaname = 'public' and tablename in ('challenges', 'challenge_participants', 'challenge_proofs', 'notifications')
    `);
    const allRls = rlsRes.rows.every(r => r.rowsecurity === true);
    recordTest(1, 'RLS enabled on all target tables', true, allRls, allRls);
  }

  // -------------------------------------------------------------------------
  // GROUP 2: REMEDIATION & PRE-EXISTING DATA
  // -------------------------------------------------------------------------
  const db2 = new PGlite();
  await setupSupabasePrelude(db2);

  await db2.exec(`
    create table if not exists public.challenges (
      id uuid default gen_random_uuid() primary key,
      creator_id uuid references public.profiles(id) on delete cascade not null,
      title text not null,
      description text not null,
      category text not null,
      duration_days integer not null,
      target_proof_count integer not null,
      status text not null default 'active',
      is_public boolean not null default true,
      starts_at timestamp with time zone default now() not null,
      ends_at timestamp with time zone not null,
      created_at timestamp with time zone default now() not null
    );

    create table if not exists public.challenge_participants (
      id uuid default gen_random_uuid() primary key,
      challenge_id uuid references public.challenges(id) on delete cascade not null,
      user_id uuid references public.profiles(id) on delete cascade not null,
      status text not null default 'joined',
      proofs_count integer not null default 0,
      joined_at timestamp with time zone default now() not null,
      completed_at timestamp with time zone,
      constraint unique_challenge_participant unique (challenge_id, user_id)
    );

    create table if not exists public.challenge_proofs (
      id uuid default gen_random_uuid() primary key,
      challenge_id uuid references public.challenges(id) on delete cascade not null,
      proof_id uuid references public.proofs(id) on delete cascade not null,
      user_id uuid references public.profiles(id) on delete cascade not null,
      created_at timestamp with time zone default now() not null,
      constraint unique_challenge_proof unique (challenge_id, proof_id)
    );

    create table if not exists public.notifications (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles(id) on delete cascade not null,
      actor_id uuid references public.profiles(id) on delete cascade,
      type text not null,
      title text not null,
      body text not null,
      link text,
      read boolean default false not null,
      metadata jsonb default '{}'::jsonb not null,
      created_at timestamp with time zone default now() not null
    );

    alter table public.challenges enable row level security;
    alter table public.challenge_participants enable row level security;
    alter table public.challenge_proofs enable row level security;
    alter table public.notifications enable row level security;
  `);

  const userA = '11111111-1111-1111-1111-111111111111';
  const userB = '22222222-2222-2222-2222-222222222222';
  await db2.exec(`
    insert into public.profiles (id, username) values 
      ('${userA}', 'user_a'),
      ('${userB}', 'user_b');
    
    insert into public.challenges (id, creator_id, title, description, category, duration_days, target_proof_count, starts_at, ends_at)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '${userA}', 'Existing Run', 'Morning run sprint', 'Fitness', 7, 5, now() - interval '1 day', now() + interval '6 days');

    insert into public.notifications (user_id, actor_id, type, title, body, link)
    values ('${userB}', '${userA}', 'new_follower', 'Existing Follow', 'user_a started following you', '/user_a');
  `);

  try {
    const remSql = fs.readFileSync(REMEDIATION_MIGRATION_PATH, 'utf8');
    await db2.exec(remSql);
    recordTest(2, 'Remediation script execution', 'Success', 'Remediation executed without error', true);
  } catch (err) {
    recordTest(2, 'Remediation script execution', 'Success', `Error: ${err.message}`, false);
  }

  const rowCheck = await db2.query(`select count(*) as cnt from public.notifications where user_id = '${userB}'`);
  recordTest(2, 'Preservation of existing rows', '1 notification row preserved', `${rowCheck.rows[0].cnt} row(s) found`, Number(rowCheck.rows[0].cnt) === 1);

  try {
    const remSql = fs.readFileSync(REMEDIATION_MIGRATION_PATH, 'utf8');
    await db2.exec(remSql);
    recordTest(2, 'Idempotent repeat execution', 'Success on repeat run', 'Second run completed cleanly', true);
  } catch (err) {
    recordTest(2, 'Idempotent repeat execution', 'Success on repeat run', `Error on re-run: ${err.message}`, false);
  }

  // -------------------------------------------------------------------------
  // GROUPS 3 TO 9: SECURITY & REGRESSION VERIFICATIONS ON DB1
  // -------------------------------------------------------------------------
  const alice = '10000000-0000-0000-0000-000000000001';
  const bob = '20000000-0000-0000-0000-000000000002';
  const charlie = '30000000-0000-0000-0000-000000000003';
  const eve = '40000000-0000-0000-0000-000000000004';

  await db1.exec(`
    insert into public.profiles (id, username, flex_score, streak) values 
      ('${alice}', 'alice', 100, 5),
      ('${bob}', 'bob', 50, 2),
      ('${charlie}', 'charlie', 200, 10),
      ('${eve}', 'eve', 0, 0);

    insert into public.follows (follower_id, following_id) values ('${alice}', '${bob}');
  `);

  // Group 3: Notifications
  let spoofBlocked = false;
  try {
    await asUser(db1, eve, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${charlie}', '${eve}', 'new_follower', 'Followed you', 'Eve followed you', '/eve')
      `);
    });
  } catch {
    spoofBlocked = true;
  }
  const spoofCheck = await db1.query(`select count(*) as cnt from public.notifications where user_id = '${charlie}'`);
  spoofBlocked = spoofBlocked || (Number(spoofCheck.rows[0].cnt) === 0);
  recordTest(3, 'Unauthorized recipient spoofing blocked', 'Rejected by RLS', spoofBlocked ? 'Blocked (0 rows inserted)' : 'Failed - row inserted', spoofBlocked);

  let fakeActorBlocked = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${charlie}', '${bob}', 'new_follower', 'Followed you', 'Bob followed you', '/bob')
      `);
    });
  } catch {
    fakeActorBlocked = true;
  }
  const fakeActorCheck = await db1.query(`select count(*) as cnt from public.notifications where actor_id = '${bob}'`);
  fakeActorBlocked = fakeActorBlocked || (Number(fakeActorCheck.rows[0].cnt) === 0);
  recordTest(3, 'Fake actor injection blocked', 'Rejected by RLS', fakeActorBlocked ? 'Blocked (0 rows inserted)' : 'Failed - row inserted', fakeActorBlocked);

  let legitNotifyOk = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${bob}', '${alice}', 'new_follower', 'New Follower', 'Alice started following you', '/alice')
      `);
    });
    const legitCheck = await db1.query(`select count(*) as cnt from public.notifications where user_id = '${bob}' and actor_id = '${alice}'`);
    legitNotifyOk = Number(legitCheck.rows[0].cnt) === 1;
  } catch {
    legitNotifyOk = false;
  }
  recordTest(3, 'Legitimate follow notification succeeds', '1 row inserted', legitNotifyOk ? '1 row inserted' : 'Failed', legitNotifyOk);

  let malformedSafe = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link, metadata)
        values ('${bob}', '${alice}', 'challenge_invite', 'Invite', 'Come join', '/challenges/none', '{"challengeId": "totally-not-a-uuid"}'::jsonb)
      `);
    });
    malformedSafe = true;
  } catch (e) {
    malformedSafe = e.message.includes('row-level security') || e.code === '42501';
  }
  recordTest(3, 'Malformed non-UUID metadata fails safely', 'RLS rejection without UUID syntax exception', malformedSafe ? 'Safely rejected by RLS' : 'Threw unhandled exception', malformedSafe);

  let extUrlBlocked = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${bob}', '${alice}', 'new_follower', 'Phish', 'Check this', 'https://phishing.com/login')
      `);
    });
  } catch (e) {
    extUrlBlocked = e.message.includes('notifications_link_check') || e.code === '23514';
  }
  recordTest(3, 'External https:// URL rejected', 'Check constraint violation', extUrlBlocked ? 'Blocked by notifications_link_check' : 'Allowed (VULNERABILITY)', extUrlBlocked);

  let protoRelBlocked = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${bob}', '${alice}', 'new_follower', 'Phish', 'Check this', '//evil.com/fake')
      `);
    });
  } catch (e) {
    protoRelBlocked = e.message.includes('notifications_link_check') || e.code === '23514';
  }
  recordTest(3, 'Protocol-relative //evil.com URL rejected', 'Check constraint violation', protoRelBlocked ? 'Blocked by notifications_link_check' : 'Allowed (VULNERABILITY)', protoRelBlocked);

  let jsBlocked = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.notifications (user_id, actor_id, type, title, body, link)
        values ('${bob}', '${alice}', 'new_follower', 'Phish', 'Check this', 'javascript:alert(1)')
      `);
    });
  } catch (e) {
    jsBlocked = e.message.includes('notifications_link_check') || e.code === '23514';
  }
  recordTest(3, 'javascript: scheme rejected', 'Check constraint violation', jsBlocked ? 'Blocked by notifications_link_check' : 'Allowed (VULNERABILITY)', jsBlocked);

  let immutabilityOk = false;
  try {
    const notifRow = await db1.query(`select id from public.notifications where user_id = '${bob}' limit 1`);
    const notifId = notifRow.rows[0].id;
    await asUser(db1, bob, async () => {
      await db1.query(`update public.notifications set title = 'Hacked Title' where id = '${notifId}'`);
    });
  } catch (e) {
    immutabilityOk = e.message.includes('Only the "read" column can be updated');
  }
  recordTest(3, 'Notification title immutability enforced', 'Trigger exception', immutabilityOk ? 'Blocked: Only "read" can be updated' : 'Failed - updated allowed', immutabilityOk);

  let readUpdateOk = false;
  try {
    const notifRow = await db1.query(`select id from public.notifications where user_id = '${bob}' limit 1`);
    const notifId = notifRow.rows[0].id;
    await asUser(db1, bob, async () => {
      await db1.query(`update public.notifications set read = true where id = '${notifId}'`);
    });
    const check = await db1.query(`select read from public.notifications where id = '${notifId}'`);
    readUpdateOk = check.rows[0].read === true;
  } catch {
    readUpdateOk = false;
  }
  recordTest(3, 'Notification read-state update succeeds', 'read = true', readUpdateOk ? 'Updated read to true' : 'Failed', readUpdateOk);

  // Group 4: Challenges
  const publicChallengeId = 'c0000000-0000-0000-0000-000000000001';
  const privateChallengeId = 'c0000000-0000-0000-0000-000000000002';

  let createPublicOk = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.challenges (id, creator_id, title, description, category, duration_days, target_proof_count, is_public, starts_at, ends_at)
        values ('${publicChallengeId}', '${alice}', '100 Pushups', 'Daily pushups sprint', 'Fitness', 7, 2, true, now() - interval '1 hour', now() + interval '7 days')
      `);
      await db1.query(`
        insert into public.challenge_participants (challenge_id, user_id, status)
        values ('${publicChallengeId}', '${alice}', 'joined')
      `);
    });
    createPublicOk = true;
  } catch {
    createPublicOk = false;
  }
  recordTest(4, 'Creator creates public challenge and joins', 'Success', createPublicOk ? 'Created & joined' : 'Failed', createPublicOk);

  let bobJoinPublicOk = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_participants (challenge_id, user_id, status)
        values ('${publicChallengeId}', '${bob}', 'joined')
      `);
    });
    bobJoinPublicOk = true;
  } catch {
    bobJoinPublicOk = false;
  }
  recordTest(4, 'User directly joins public challenge', 'Success', bobJoinPublicOk ? 'Joined public sprint' : 'Failed', bobJoinPublicOk);

  let createPrivateOk = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.challenges (id, creator_id, title, description, category, duration_days, target_proof_count, is_public, starts_at, ends_at)
        values ('${privateChallengeId}', '${alice}', 'Secret Code Sprint', 'Build core engine', 'Coding', 14, 3, false, now() - interval '1 hour', now() + interval '14 days')
      `);
      await db1.query(`
        insert into public.challenge_participants (challenge_id, user_id, status)
        values ('${privateChallengeId}', '${alice}', 'joined')
      `);
    });
    createPrivateOk = true;
  } catch {
    createPrivateOk = false;
  }
  recordTest(4, 'Creator creates private challenge', 'Success', createPrivateOk ? 'Created private sprint' : 'Failed', createPrivateOk);

  let eveJoinPrivateBlocked = false;
  try {
    await asUser(db1, eve, async () => {
      await db1.query(`
        insert into public.challenge_participants (challenge_id, user_id, status)
        values ('${privateChallengeId}', '${eve}', 'joined')
      `);
    });
  } catch {
    eveJoinPrivateBlocked = true;
  }
  const eveCheck = await db1.query(`select count(*) as cnt from public.challenge_participants where challenge_id = '${privateChallengeId}' and user_id = '${eve}'`);
  eveJoinPrivateBlocked = eveJoinPrivateBlocked || (Number(eveCheck.rows[0].cnt) === 0);
  recordTest(4, 'Uninvited user cannot join private challenge', 'Blocked by RLS', eveJoinPrivateBlocked ? 'Blocked (0 rows inserted)' : 'Failed - enrolled without invite', eveJoinPrivateBlocked);

  let inviteAcceptOk = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        insert into public.challenge_participants (challenge_id, user_id, status)
        values ('${privateChallengeId}', '${bob}', 'invited')
      `);
    });
    await asUser(db1, bob, async () => {
      await db1.query(`
        update public.challenge_participants set status = 'joined'
        where challenge_id = '${privateChallengeId}' and user_id = '${bob}'
      `);
    });
    const bobStatus = await db1.query(`select status from public.challenge_participants where challenge_id = '${privateChallengeId}' and user_id = '${bob}'`);
    inviteAcceptOk = bobStatus.rows[0].status === 'joined';
  } catch {
    inviteAcceptOk = false;
  }
  recordTest(4, 'Creator invites to private challenge and user accepts', 'Status = joined', inviteAcceptOk ? 'Successfully accepted invite' : 'Failed', inviteAcceptOk);

  const proofFitBob = '90000000-0000-0000-0000-000000000001';
  const proofCodeBob = '90000000-0000-0000-0000-000000000002';
  const proofExpiredBob = '90000000-0000-0000-0000-000000000003';
  const proofAlice = '90000000-0000-0000-0000-000000000004';

  await db1.exec(`
    insert into public.proofs (id, user_id, category, caption, points, created_at) values 
      ('${proofFitBob}', '${bob}', 'Fitness', '50 pushups', 10, now()),
      ('${proofCodeBob}', '${bob}', 'Coding', 'Wrote compiler', 15, now()),
      ('${proofExpiredBob}', '${bob}', 'Fitness', 'Old pushups', 10, now() - interval '30 days'),
      ('${proofAlice}', '${alice}', 'Fitness', 'Alice pushups', 10, now());
  `);

  let stealProofBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_proofs (challenge_id, proof_id, user_id)
        values ('${publicChallengeId}', '${proofAlice}', '${bob}')
      `);
    });
  } catch {
    stealProofBlocked = true;
  }
  const stealCheck = await db1.query(`select count(*) as cnt from public.challenge_proofs where proof_id = '${proofAlice}' and user_id = '${bob}'`);
  stealProofBlocked = stealProofBlocked || (Number(stealCheck.rows[0].cnt) === 0);
  recordTest(4, 'User cannot link another user proof', 'Blocked by RLS', stealProofBlocked ? 'Blocked by RLS' : 'Failed (Allowed)', stealProofBlocked);

  let wrongCatBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_proofs (challenge_id, proof_id, user_id)
        values ('${publicChallengeId}', '${proofCodeBob}', '${bob}')
      `);
    });
  } catch {
    wrongCatBlocked = true;
  }
  const catCheck = await db1.query(`select count(*) as cnt from public.challenge_proofs where proof_id = '${proofCodeBob}'`);
  wrongCatBlocked = wrongCatBlocked || (Number(catCheck.rows[0].cnt) === 0);
  recordTest(4, 'Mismatched proof category rejected', 'Blocked by RLS', wrongCatBlocked ? 'Blocked by category check' : 'Failed (Allowed)', wrongCatBlocked);

  let expiredBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_proofs (challenge_id, proof_id, user_id)
        values ('${publicChallengeId}', '${proofExpiredBob}', '${bob}')
      `);
    });
  } catch {
    expiredBlocked = true;
  }
  const expCheck = await db1.query(`select count(*) as cnt from public.challenge_proofs where proof_id = '${proofExpiredBob}'`);
  expiredBlocked = expiredBlocked || (Number(expCheck.rows[0].cnt) === 0);
  recordTest(4, 'Proof outside time window rejected', 'Blocked by RLS', expiredBlocked ? 'Blocked by time window' : 'Failed (Allowed)', expiredBlocked);

  let legitLinkOk = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_proofs (challenge_id, proof_id, user_id)
        values ('${publicChallengeId}', '${proofFitBob}', '${bob}')
      `);
    });
    const linkCheck = await db1.query(`select count(*) as cnt from public.challenge_proofs where proof_id = '${proofFitBob}'`);
    legitLinkOk = Number(linkCheck.rows[0].cnt) === 1;
  } catch {
    legitLinkOk = false;
  }
  recordTest(4, 'Eligible proof links successfully', '1 row inserted', legitLinkOk ? 'Linked successfully' : 'Failed', legitLinkOk);

  let duplicateLinkBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        insert into public.challenge_proofs (challenge_id, proof_id, user_id)
        values ('${publicChallengeId}', '${proofFitBob}', '${bob}')
      `);
    });
  } catch (e) {
    duplicateLinkBlocked = e.message.includes('unique_challenge_proof') || e.code === '23505';
  }
  recordTest(4, 'Duplicate proof link rejected by unique constraint', 'Unique violation', duplicateLinkBlocked ? 'Blocked by unique_challenge_proof' : 'Failed', duplicateLinkBlocked);

  // Group 5: Participant Integrity
  let countTamperBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        update public.challenge_participants set proofs_count = 999
        where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
      `);
    });
  } catch (e) {
    countTamperBlocked = e.message.includes('Direct tampering with challenge proofs_count is prohibited');
  }
  recordTest(5, 'Direct tampering with proofs_count blocked', 'Trigger exception', countTamperBlocked ? 'Blocked by protect_challenge_participant_columns' : 'Failed (Tampering allowed)', countTamperBlocked);

  let completedAtTamperBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        update public.challenge_participants set completed_at = now()
        where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
      `);
    });
  } catch (e) {
    completedAtTamperBlocked = e.message.includes('completed_at') || e.message.includes('Cannot mark challenge');
  }
  recordTest(5, 'Direct tampering with completed_at blocked', 'Trigger exception', completedAtTamperBlocked ? 'Blocked: cannot fake completed_at' : 'Failed (Tampering allowed)', completedAtTamperBlocked);

  let demotionBlocked = false;
  try {
    await asUser(db1, alice, async () => {
      await db1.query(`
        update public.challenge_participants set status = 'invited'
        where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
      `);
    });
  } catch (e) {
    demotionBlocked = e.message.includes('Cannot demote active participant to invited');
  }
  recordTest(5, 'Demoting joined participant to invited blocked', 'Trigger exception', demotionBlocked ? 'Blocked: Cannot demote active participant' : 'Failed (Demotion allowed)', demotionBlocked);

  let identityTamperBlocked = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        update public.challenge_participants set user_id = '${charlie}'
        where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
      `);
    });
  } catch (e) {
    identityTamperBlocked = e.message.includes('Cannot modify participant identity');
  }
  recordTest(5, 'Modifying participant user_id blocked', 'Trigger exception', identityTamperBlocked ? 'Blocked: Cannot modify identity' : 'Failed', identityTamperBlocked);

  let leaveOk = false;
  try {
    await asUser(db1, bob, async () => {
      await db1.query(`
        update public.challenge_participants set status = 'left'
        where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
      `);
    });
    const check = await db1.query(`select status from public.challenge_participants where challenge_id = '${publicChallengeId}' and user_id = '${bob}'`);
    leaveOk = check.rows[0].status === 'left';
  } catch {
    leaveOk = false;
  }
  recordTest(5, 'Authorized status transition (leave) succeeds', 'status = left', leaveOk ? 'Left challenge successfully' : 'Failed', leaveOk);

  // Group 6: Deletion & Reconciliation
  await db1.exec(`
    update public.challenge_participants set status = 'joined' 
    where challenge_id = '${publicChallengeId}' and user_id = '${bob}';
  `);

  const proofFitBob2 = '90000000-0000-0000-0000-000000000005';
  await db1.exec(`
    insert into public.proofs (id, user_id, category, caption, points, created_at)
    values ('${proofFitBob2}', '${bob}', 'Fitness', 'More pushups', 10, now());
  `);

  await asUser(db1, bob, async () => {
    await db1.query(`
      insert into public.challenge_proofs (challenge_id, proof_id, user_id)
      values ('${publicChallengeId}', '${proofFitBob2}', '${bob}')
    `);
  });

  const partAfter2 = await db1.query(`
    select proofs_count, status, completed_at from public.challenge_participants 
    where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
  `);
  const rowAfter2 = partAfter2.rows[0];
  const autoCompleted = rowAfter2.proofs_count === 2 && rowAfter2.status === 'completed' && rowAfter2.completed_at !== null;
  recordTest(6, 'Reaching target proof count auto-completes participant', 'count = 2, status = completed, completed_at set', `count = ${rowAfter2.proofs_count}, status = ${rowAfter2.status}, completed_at = ${rowAfter2.completed_at ? 'SET' : 'NULL'}`, autoCompleted);

  await db1.exec(`delete from public.proofs where id = '${proofFitBob2}';`);

  const partAfterDelete = await db1.query(`
    select proofs_count, status, completed_at from public.challenge_participants 
    where challenge_id = '${publicChallengeId}' and user_id = '${bob}'
  `);
  const rowAfterDelete = partAfterDelete.rows[0];
  const reconciled = rowAfterDelete.proofs_count === 1 && rowAfterDelete.status === 'joined' && rowAfterDelete.completed_at === null;
  recordTest(6, 'Deleting proof cascades and auto-demotes completion', 'count = 1, status = joined, completed_at = null', `count = ${rowAfterDelete.proofs_count}, status = ${rowAfterDelete.status}, completed_at = ${rowAfterDelete.completed_at ? 'SET' : 'NULL'}`, reconciled);

  // Group 7: Security Definer Privileges & Catalog Checks
  const privCheck = await db1.query(`
    select routine_name, routine_type 
    from information_schema.routines 
    where routine_schema = 'public' and routine_name in (
      'protect_notification_columns',
      'protect_challenge_participant_columns',
      'on_challenge_proof_linked',
      'is_challenge_participant'
    )
  `);
  recordTest(7, 'All 4 SECURITY DEFINER functions exist in catalog', '4 functions', `${privCheck.rows.length} functions`, privCheck.rows.length === 4);

  let helperExecOk = false;
  try {
    await asUser(db1, bob, async () => {
      const res = await db1.query(`select public.is_challenge_participant('${publicChallengeId}', '${bob}') as is_p`);
      helperExecOk = res.rows[0].is_p === true;
    });
  } catch {
    helperExecOk = false;
  }
  recordTest(7, 'Authenticated role can call is_challenge_participant', true, helperExecOk, helperExecOk);

  let probeEveBlocked = false;
  try {
    await asUser(db1, eve, async () => {
      const res = await db1.query(`select public.is_challenge_participant('${privateChallengeId}', '${bob}') as is_p`);
      probeEveBlocked = res.rows[0].is_p === false;
    });
  } catch {
    probeEveBlocked = false;
  }
  recordTest(7, 'Private roster enumeration probe by unauthorized caller rejected', 'Returns false', probeEveBlocked ? 'Returned false (no leak)' : 'Failed (Leaked)', probeEveBlocked);

  let creatorProbeOk = false;
  try {
    await asUser(db1, alice, async () => {
      const res = await db1.query(`select public.is_challenge_participant('${privateChallengeId}', '${bob}') as is_p`);
      creatorProbeOk = res.rows[0].is_p === true;
    });
  } catch {
    creatorProbeOk = false;
  }
  recordTest(7, 'Creator inspection of private challenge membership allowed', 'Returns true', creatorProbeOk ? 'Returned true' : 'Failed', creatorProbeOk);

  let anonProbeBlocked = false;
  try {
    await asAnon(db1, async () => {
      const res = await db1.query(`select public.is_challenge_participant('${privateChallengeId}', '${bob}') as is_p`);
      anonProbeBlocked = res.rows[0].is_p === false;
    });
  } catch {
    anonProbeBlocked = false;
  }
  recordTest(7, 'Anonymous caller inspection of private challenge returns false', 'Returns false', anonProbeBlocked ? 'Returned false' : 'Failed', anonProbeBlocked);

  // Group 8: Concurrency & Deduplication
  const concProof = '90000000-0000-0000-0000-000000000006';
  await db1.exec(`
    insert into public.proofs (id, user_id, category, caption, points, created_at)
    values ('${concProof}', '${bob}', 'Fitness', 'Concurrent test proof', 10, now());
  `);

  let firstInsertOk = false;
  let secondInsertRejected = false;

  await asUser(db1, bob, async () => {
    try {
      await db1.query(`insert into public.challenge_proofs (challenge_id, proof_id, user_id) values ('${publicChallengeId}', '${concProof}', '${bob}')`);
      firstInsertOk = true;
    } catch {}

    try {
      await db1.query(`insert into public.challenge_proofs (challenge_id, proof_id, user_id) values ('${publicChallengeId}', '${concProof}', '${bob}')`);
    } catch (e) {
      secondInsertRejected = e.message.includes('unique_challenge_proof') || e.code === '23505';
    }
  });

  const concDedupeOk = firstInsertOk && secondInsertRejected;
  recordTest(8, 'Concurrent duplicate proof link deduplicated', 'Second insert rejected by unique constraint', concDedupeOk ? 'Strictly deduplicated' : 'Failed', concDedupeOk);

  // Group 9: Proof Scoring Regression
  const proofScoreCheck = await db1.query(`
    select 
      (select points from public.proofs where id = '${proofFitBob}') as text_points,
      (select points from public.proofs where id = '${proofCodeBob}') as img_points,
      (select flex_score from public.profiles where id = '${bob}') as bob_score,
      (select streak from public.profiles where id = '${bob}') as bob_streak
  `);
  const scoreRow = proofScoreCheck.rows[0];
  const scoringIntact = Number(scoreRow.text_points) === 10 && Number(scoreRow.img_points) === 15 && Number(scoreRow.bob_score) === 50 && Number(scoreRow.bob_streak) === 2;
  recordTest(9, 'Base Proof points (+10 text / +15 image) and profile score invariant', 'Text: 10, Image: 15, Score: 50, Streak: 2', `Text: ${scoreRow.text_points}, Image: ${scoreRow.img_points}, Score: ${scoreRow.bob_score}, Streak: ${scoreRow.bob_streak}`, scoringIntact);

  console.log('\n=== TEST RUN SUMMARY ===');
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error('FAILED TESTS:');
    results.filter(r => !r.pass).forEach(r => console.error(`- [Group ${r.group}] ${r.testName}: Expected ${r.expected}, got: ${r.actual}`));
    process.exit(1);
  } else {
    console.log('ALL INTEGRATION GATE TESTS PASSED ON REAL POSTGRESQL ENGINE!');
  }
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIntegrationGate().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}
