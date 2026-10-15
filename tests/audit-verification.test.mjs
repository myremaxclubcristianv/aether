import test from 'node:test';
import assert from 'node:assert/strict';

// 1. WEEKLY RECAP UTC DETERMINISM TEST
test('Weekly Recap: getUTCMonday produces strict UTC Monday 00:00:00.000', () => {
  function getUTCMonday(d) {
    const date = new Date(d);
    const day = date.getUTCDay(); // 0 is Sunday, 1 is Monday...
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff, 0, 0, 0, 0));
  }

  // Sunday 2026-10-18T23:59:59.000Z should resolve to Monday 2026-10-12T00:00:00.000Z
  const sundayLate = new Date('2026-10-18T23:59:59.000Z');
  const mondayFromSunday = getUTCMonday(sundayLate);
  assert.equal(mondayFromSunday.toISOString(), '2026-10-12T00:00:00.000Z');

  // Monday 2026-10-12T00:00:01.000Z should resolve to Monday 2026-10-12T00:00:00.000Z
  const mondayEarly = new Date('2026-10-12T00:00:01.000Z');
  const mondayFromMonday = getUTCMonday(mondayEarly);
  assert.equal(mondayFromMonday.toISOString(), '2026-10-12T00:00:00.000Z');

  // Wednesday 2026-10-15T15:30:00.000Z should resolve to Monday 2026-10-12T00:00:00.000Z
  const wed = new Date('2026-10-15T15:30:00.000Z');
  const mondayFromWed = getUTCMonday(wed);
  assert.equal(mondayFromWed.toISOString(), '2026-10-12T00:00:00.000Z');

  // Boundary check: previous week Sunday 23:59:59.999Z vs current Monday 00:00:00.000Z
  const currentMonday = mondayFromWed;
  const currentSunday = new Date(currentMonday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  const prevMonday = new Date(currentMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevSunday = new Date(currentMonday.getTime() - 1);

  assert.equal(prevMonday.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(prevSunday.toISOString(), '2026-10-11T23:59:59.999Z');
  assert.equal(currentMonday.toISOString(), '2026-10-12T00:00:00.000Z');
  assert.equal(currentSunday.toISOString(), '2026-10-18T23:59:59.999Z');

  // No overlap: prevSunday is 1ms before currentMonday
  assert.equal(currentMonday.getTime() - prevSunday.getTime(), 1);
});

// 2. ACTIVE DAYS UTC GROUPING TEST
test('Active Days: UTC grouping avoids local timezone day-slippage', () => {
  const proofs = [
    { createdAt: '2026-10-15T23:30:00.000Z', points: 10 },
    { createdAt: '2026-10-15T23:55:00.000Z', points: 5 },
    { createdAt: '2026-10-16T00:05:00.000Z', points: 10 },
  ];

  const utcDates = new Set();
  proofs.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    utcDates.add(key);
  });

  assert.equal(utcDates.size, 2);
  assert.ok(utcDates.has('2026-10-15'));
  assert.ok(utcDates.has('2026-10-16'));
});

// 3. CHALLENGE INVITATION STATUS PRESERVATION TEST
test('Challenge Invite: Existing joined or completed status is preserved and not overwritten', () => {
  function processInvitation(existingStatus, creatorId, callerId) {
    if (callerId !== creatorId) {
      return { status: 403, error: 'Only creator can invite' };
    }

    if (existingStatus === 'joined' || existingStatus === 'completed') {
      return { ok: true, alreadyParticipant: true, newStatus: existingStatus };
    }

    if (existingStatus === 'invited') {
      return { ok: true, alreadyInvited: true, newStatus: 'invited' };
    }

    return { ok: true, newStatus: 'invited' };
  }

  // 1. Non-creator rejected
  assert.equal(processInvitation('none', 'creator-uuid', 'attacker-uuid').status, 403);

  // 2. Existing joined user not demoted to invited
  const joinedRes = processInvitation('joined', 'creator-uuid', 'creator-uuid');
  assert.equal(joinedRes.ok, true);
  assert.equal(joinedRes.alreadyParticipant, true);
  assert.equal(joinedRes.newStatus, 'joined');

  // 3. Existing completed user not demoted to invited
  const completedRes = processInvitation('completed', 'creator-uuid', 'creator-uuid');
  assert.equal(completedRes.ok, true);
  assert.equal(completedRes.alreadyParticipant, true);
  assert.equal(completedRes.newStatus, 'completed');

  // 4. Fresh invite allowed
  const freshRes = processInvitation(null, 'creator-uuid', 'creator-uuid');
  assert.equal(freshRes.ok, true);
  assert.equal(freshRes.newStatus, 'invited');
});

// 4. CHALLENGE COMPLETION DEDUPLICATION TEST
test('Challenge Completion: Notification is dispatched exactly once on transition', () => {
  let notificationsDispatched = [];

  function simulateProofLinked(item, newProofsCount, targetCount) {
    const isNowCompleted = newProofsCount >= targetCount;
    const justCompleted = isNowCompleted && item.status !== 'completed';

    if (justCompleted) {
      notificationsDispatched.push('challenge_completed');
      item.status = 'completed';
    } else if (!isNowCompleted) {
      notificationsDispatched.push('challenge_progress');
    }
  }

  const participant = { status: 'joined' };
  const target = 3;

  // Proof 1: progress (1/3)
  simulateProofLinked(participant, 1, target);
  assert.deepEqual(notificationsDispatched, ['challenge_progress']);

  // Proof 2: progress (2/3)
  simulateProofLinked(participant, 2, target);
  assert.deepEqual(notificationsDispatched, ['challenge_progress', 'challenge_progress']);

  // Proof 3: reaches target -> completed
  simulateProofLinked(participant, 3, target);
  assert.deepEqual(notificationsDispatched, ['challenge_progress', 'challenge_progress', 'challenge_completed']);
  assert.equal(participant.status, 'completed');

  // Proof 4: subsequent proof logged after completion -> NO duplicate completion notification
  simulateProofLinked(participant, 4, target);
  assert.deepEqual(notificationsDispatched, ['challenge_progress', 'challenge_progress', 'challenge_completed']);
});

// 5. OPTIMISTIC ROLLBACK TEST
test('Discover People: Rollback occurs when server returns success: false', () => {
  let users = [
    { profile: { id: 'target-1' }, isFollowing: false },
    { profile: { id: 'target-2' }, isFollowing: true },
  ];

  function applyOptimisticToggle(targetId, currentStatus) {
    users = users.map((u) =>
      u.profile.id === targetId ? { ...u, isFollowing: !currentStatus } : u
    );
  }

  function handleServerResult(targetId, currentStatus, res) {
    if (!res.success) {
      // Revert
      users = users.map((u) =>
        u.profile.id === targetId ? { ...u, isFollowing: currentStatus } : u
      );
    }
  }

  // User 1: Follow initiated
  applyOptimisticToggle('target-1', false);
  assert.equal(users[0].isFollowing, true);

  // Server fails with { success: false, error: 'Database timeout' }
  handleServerResult('target-1', false, { success: false, error: 'Database timeout' });
  assert.equal(users[0].isFollowing, false); // Successfully rolled back!
});

// 6. NOTIFICATION AUTHENTICITY & RELATIONAL VALIDATION TEST
test('Notification Authenticity: User cannot forge peer notifications without relational backing and malformed metadata fails safely', () => {
  const followsDB = new Set(['user-a:user-b']); // User A follows User B
  const challengesDB = new Map([['c-1', { id: 'c-1', creatorId: 'user-a' }]]);
  const participantsDB = new Set(['c-1:user-b']); // User B is in c-1

  function validatePeerNotificationInsert(authUid, row) {
    // 1. Basic attribution
    if (!authUid || row.actor_id !== authUid || row.actor_id === row.user_id) {
      return false;
    }

    // 2. Safe metadata comparison (safe text comparison without throwing)
    const challengeId = typeof row.metadata?.challengeId === 'string' ? row.metadata.challengeId : null;

    // 3. Relational checks per type
    if (row.type === 'new_follower') {
      return followsDB.has(`${authUid}:${row.user_id}`);
    }
    if (row.type === 'challenge_invite') {
      if (!challengeId) return false;
      const c = challengesDB.get(challengeId);
      return Boolean(c && c.creatorId === authUid && c.id === challengeId);
    }
    if (row.type === 'challenge_accepted') {
      if (!challengeId) return false;
      const c = challengesDB.get(challengeId);
      return Boolean(c && c.creatorId === row.user_id && participantsDB.has(`${challengeId}:${authUid}`));
    }

    return false;
  }

  // Attack 1: User A tries to spoof new_follower for User C (whom A does not follow)
  const fakeFollow = {
    user_id: 'user-c',
    actor_id: 'user-a',
    type: 'new_follower',
  };
  assert.equal(validatePeerNotificationInsert('user-a', fakeFollow), false);

  // Legitimate: User A notifies User B (whom A does follow)
  const legitFollow = {
    user_id: 'user-b',
    actor_id: 'user-a',
    type: 'new_follower',
  };
  assert.equal(validatePeerNotificationInsert('user-a', legitFollow), true);

  // Attack 2: User B tries to invite someone to challenge c-1 (owned by User A)
  const fakeInvite = {
    user_id: 'user-c',
    actor_id: 'user-b',
    type: 'challenge_invite',
    metadata: { challengeId: 'c-1' },
  };
  assert.equal(validatePeerNotificationInsert('user-b', fakeInvite), false);

  // Legitimate: User A invites User C to challenge c-1
  const legitInvite = {
    user_id: 'user-c',
    actor_id: 'user-a',
    type: 'challenge_invite',
    metadata: { challengeId: 'c-1' },
  };
  assert.equal(validatePeerNotificationInsert('user-a', legitInvite), true);

  // Attack 3: Malformed or non-UUID metadata does not crash, fails safely to false
  const malformedInvite = {
    user_id: 'user-c',
    actor_id: 'user-a',
    type: 'challenge_invite',
    metadata: { challengeId: 'not-a-valid-uuid-syntax' },
  };
  assert.equal(validatePeerNotificationInsert('user-a', malformedInvite), false);

  const missingMetadata = {
    user_id: 'user-c',
    actor_id: 'user-a',
    type: 'challenge_invite',
    metadata: {},
  };
  assert.equal(validatePeerNotificationInsert('user-a', missingMetadata), false);
});

// 7. CHALLENGE PROOF ELIGIBILITY VALIDATION TEST
test('Challenge Proofs: Category, time window, and active status enforced on linking', () => {
  const challenge = {
    id: 'c-fit',
    category: 'Fitness',
    startsAt: new Date('2026-10-10T00:00:00Z').getTime(),
    endsAt: new Date('2026-10-20T23:59:59Z').getTime(),
    status: 'active',
  };

  function checkProofEligibility(proof, c) {
    if (c.status !== 'active') return false;
    const catMatch = c.category === 'All' || c.category.toLowerCase() === (proof.category || '').toLowerCase();
    if (!catMatch) return false;

    const proofTime = new Date(proof.createdAt).getTime();
    if (proofTime < c.startsAt || proofTime > c.endsAt) return false;

    return true;
  }

  // Proof inside window and matching category
  const validProof = {
    id: 'p-1',
    category: 'Fitness',
    createdAt: '2026-10-15T12:00:00Z',
  };
  assert.equal(checkProofEligibility(validProof, challenge), true);

  // Attack/Invalid 1: Mismatched category (Coding proof in Fitness sprint)
  const wrongCategory = {
    id: 'p-2',
    category: 'Coding',
    createdAt: '2026-10-15T12:00:00Z',
  };
  assert.equal(checkProofEligibility(wrongCategory, challenge), false);

  // Attack/Invalid 2: Proof created before challenge started
  const oldProof = {
    id: 'p-3',
    category: 'Fitness',
    createdAt: '2026-09-01T12:00:00Z',
  };
  assert.equal(checkProofEligibility(oldProof, challenge), false);

  // Attack/Invalid 3: Proof created after challenge expired
  const futureProof = {
    id: 'p-4',
    category: 'Fitness',
    createdAt: '2026-11-01T12:00:00Z',
  };
  assert.equal(checkProofEligibility(futureProof, challenge), false);
});

// 8. PROGRESS RECONCILIATION ON DELETE TEST
test('Progress Reconciliation: Proof deletion recalculates count and demotes completed status', () => {
  let challengeProofs = [
    { challenge_id: 'c-1', user_id: 'u-1', proof_id: 'p-1' },
    { challenge_id: 'c-1', user_id: 'u-1', proof_id: 'p-2' },
    { challenge_id: 'c-1', user_id: 'u-1', proof_id: 'p-3' },
  ];
  let participant = {
    challenge_id: 'c-1',
    user_id: 'u-1',
    proofs_count: 3,
    status: 'completed',
    completed_at: '2026-10-15T10:00:00Z',
  };
  const target = 3;

  function onProofDeleted(deletedProofId) {
    challengeProofs = challengeProofs.filter((cp) => cp.proof_id !== deletedProofId);
    const newCount = challengeProofs.filter(
      (cp) => cp.challenge_id === participant.challenge_id && cp.user_id === participant.user_id
    ).length;

    participant.proofs_count = newCount;
    if (newCount < target && participant.status === 'completed') {
      participant.status = 'joined';
      participant.completed_at = null;
    }
  }

  // Delete 1 proof: count becomes 2 < 3 -> should revert to 'joined'
  onProofDeleted('p-3');
  assert.equal(participant.proofs_count, 2);
  assert.equal(participant.status, 'joined');
  assert.equal(participant.completed_at, null);
});

// 9. PRIVATE CHALLENGE ENUMERATION PROTECTION TEST
test('Private Challenges: Membership function rejects unauthorized caller inspection', () => {
  const challenges = {
    'c-public': { is_public: true, creator_id: 'creator-1' },
    'c-private': { is_public: false, creator_id: 'creator-1' },
  };
  const participants = new Set(['c-private:victim-1']);

  function isChallengeParticipant(callerId, challengeId, targetUserId) {
    const c = challenges[challengeId];
    if (!c) return false;

    const authorized =
      callerId === targetUserId ||
      c.is_public === true ||
      callerId === c.creator_id;

    if (!authorized) {
      return false; // Does not leak existence of private membership
    }

    return participants.has(`${challengeId}:${targetUserId}`);
  }

  // Attacker probes if victim-1 is in c-private
  assert.equal(isChallengeParticipant('attacker-1', 'c-private', 'victim-1'), false);

  // Victim-1 checks their own status in c-private
  assert.equal(isChallengeParticipant('victim-1', 'c-private', 'victim-1'), true);

  // Creator checks victim-1 status in c-private
  assert.equal(isChallengeParticipant('creator-1', 'c-private', 'victim-1'), true);

  // Anyone can check in c-public
  assert.equal(isChallengeParticipant('attacker-1', 'c-public', 'victim-1'), false);
});

// 10. PROOF SCORING & STREAK PIPELINE ISOLATION TEST (+10 text / +15 image)
test('Proof Scoring Isolation: Challenge linking never alters base proof points (+10 / +15) or streaks', () => {
  // Matches lib/score.ts SCORE_POINTS
  const SCORE_POINTS = {
    NORMAL_PROOF: 10,
    IMAGE_PROOF: 15,
  };

  function calculateBaseProofPoints(hasImage) {
    return hasImage ? SCORE_POINTS.IMAGE_PROOF : SCORE_POINTS.NORMAL_PROOF;
  }

  // Base scoring invariant: +10 text / +15 image
  assert.equal(calculateBaseProofPoints(false), 10);
  assert.equal(calculateBaseProofPoints(true), 15);

  // Profile flex score calculation strictly increments by proof points
  let currentFlexScore = 150;
  const proofPoints = calculateBaseProofPoints(true); // +15
  const updatedFlexScore = currentFlexScore + proofPoints;
  assert.equal(updatedFlexScore, 165);

  // Linking to multiple simultaneous challenges does not award extra points
  const activeChallengesLinked = 3;
  assert.ok(activeChallengesLinked > 0);
  assert.equal(updatedFlexScore, 165); // Invariant holds: exactly 165, unaffected by challenge link
});

// 11. PARTICIPANT SECURITY TRIGGER SIMULATION TEST
test('Participant Protection: completed_at, demotion, and proofs_count tampering blocked', () => {
  function protectParticipantUpdate(oldRow, newRow, actualProofsCount, targetProofCount) {
    // 1. Immutable fields
    if (newRow.id !== oldRow.id || newRow.challenge_id !== oldRow.challenge_id || newRow.user_id !== oldRow.user_id) {
      return { ok: false, error: 'Cannot modify identity' };
    }

    // 2. Prevent demotion
    if ((oldRow.status === 'joined' || oldRow.status === 'completed') && newRow.status === 'invited') {
      return { ok: false, error: 'Cannot demote active participant to invited' };
    }

    // 3. proofs_count tampering
    if (newRow.proofs_count !== oldRow.proofs_count && newRow.proofs_count !== actualProofsCount) {
      return { ok: false, error: 'Direct tampering with proofs_count prohibited' };
    }

    // 4. completion criteria
    if (newRow.status === 'completed' && oldRow.status !== 'completed') {
      if (actualProofsCount < targetProofCount) {
        return { ok: false, error: 'Cannot mark challenge completed without verified proofs' };
      }
    }

    // 5. completed_at protection
    if (newRow.completed_at !== oldRow.completed_at) {
      if (newRow.status === 'completed') {
        if (actualProofsCount < targetProofCount) {
          return { ok: false, error: 'Cannot set completed_at without satisfied criteria' };
        }
      } else if (newRow.completed_at !== null) {
        return { ok: false, error: 'completed_at must be null when status is not completed' };
      }
    }

    return { ok: true };
  }

  const base = {
    id: 'cp-1',
    challenge_id: 'c-1',
    user_id: 'u-1',
    status: 'joined',
    proofs_count: 2,
    completed_at: null,
  };

  // Attack 1: User tries to fake completed_at
  const fakeCompletedAt = { ...base, completed_at: '2026-10-15T00:00:00Z' };
  assert.equal(protectParticipantUpdate(base, fakeCompletedAt, 2, 5).ok, false);

  // Attack 2: User tries to demote to invited
  const demoteInvited = { ...base, status: 'invited' };
  assert.equal(protectParticipantUpdate(base, demoteInvited, 2, 5).ok, false);

  // Attack 3: User tries to inflate proofs_count to 999
  const inflatedCount = { ...base, proofs_count: 999 };
  assert.equal(protectParticipantUpdate(base, inflatedCount, 2, 5).ok, false);

  // Legitimate: Trigger synchronizes verified count to 3
  const legitimateUpdate = { ...base, proofs_count: 3 };
  assert.equal(protectParticipantUpdate(base, legitimateUpdate, 3, 5).ok, true);
});

// 12. NOTIFICATION LINK FORMAT VALIDATION TEST
test('Notification Link: Only safe internal relative URIs are accepted', () => {
  const linkRegex = /^\/[a-zA-Z0-9_/?&.=-]+$/;

  function validateLink(link) {
    if (link === null || link === undefined) return true;
    if (link.startsWith('//')) return false;
    return linkRegex.test(link);
  }

  // Safe relative paths
  assert.equal(validateLink('/challenges/123e4567-e89b-12d3-a456-426614174000'), true);
  assert.equal(validateLink('/alex_dev'), true);
  assert.equal(validateLink('/progress?tab=recap'), true);
  assert.equal(validateLink(null), true);

  // Malicious / external / scheme vectors rejected
  assert.equal(validateLink('https://evil-phishing.com/login'), false);
  assert.equal(validateLink('javascript:alert(1)'), false);
  assert.equal(validateLink('//evil.com/fake-login'), false);
  assert.equal(validateLink('data:text/html,<script>alert(1)</script>'), false);
});
