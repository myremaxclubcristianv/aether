import { createClient } from '@/lib/supabase/server';
import {
  ChallengeWithDetails,
  ChallengeParticipantRecord,
  UserProfile,
  ProofWithProfile,
  DbProfile,
  DbProof,
} from '@/types';
import { createNotification } from '@/lib/notifications';

export interface CreateChallengeInput {
  creatorId: string;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  targetProofCount: number;
  isPublic?: boolean;
  inviteUserIds?: string[];
}

/**
 * Fetches challenges list with participation status.
 * Resilient against missing DB tables before migration is executed.
 */
export async function getChallenges(
  currentUserId?: string,
  categoryFilter?: string,
  statusFilter?: string
): Promise<ChallengeWithDetails[]> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('challenges') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (categoryFilter && categoryFilter !== 'All') {
      query = query.eq('category', categoryFilter);
    }

    if (statusFilter && statusFilter !== 'All') {
      query = query.eq('status', statusFilter);
    }

    const { data: challengesData, error } = (await query.limit(50)) as {
      data: Array<{
        id: string;
        creator_id: string;
        title: string;
        description: string;
        category: string;
        duration_days: number;
        target_proof_count: number;
        status: 'active' | 'completed' | 'cancelled';
        is_public: boolean;
        starts_at: string;
        ends_at: string;
        created_at: string;
      }> | null;
      error: { code?: string; message?: string } | null;
    };

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return [];
      }
      console.error('[CHALLENGES] Fetch error:', error.message);
      return [];
    }

    if (!challengesData || challengesData.length === 0) return [];

    const challengeIds = challengesData.map((c) => c.id);
    const creatorIds = [...new Set(challengesData.map((c) => c.creator_id))];

    // Fetch creators
    const { data: creatorsData } = (await supabase
      .from('profiles')
      .select('*')
      .in('id', creatorIds)) as { data: DbProfile[] | null };

    const creatorMap = new Map<string, UserProfile>(
      (creatorsData || []).map((p) => [
        p.id,
        {
          id: p.id,
          username: p.username,
          avatarUrl: p.avatar_url,
          bio: p.bio,
          flexScore: p.flex_score,
          streak: p.streak,
          createdAt: p.created_at,
        },
      ])
    );

    // Fetch participants counts & user participation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participantsData } = (await (supabase.from('challenge_participants') as any)
      .select('*')
      .in('challenge_id', challengeIds)) as {
      data: Array<{
        id: string;
        challenge_id: string;
        user_id: string;
        status: 'invited' | 'joined' | 'declined' | 'completed' | 'left';
        proofs_count: number;
        joined_at: string;
        completed_at: string | null;
      }> | null;
    };

    const participantsByChallenge = new Map<string, number>();
    const userParticipationMap = new Map<string, ChallengeParticipantRecord>();

    (participantsData || []).forEach((p) => {
      if (p.status === 'joined' || p.status === 'completed') {
        const cur = participantsByChallenge.get(p.challenge_id) || 0;
        participantsByChallenge.set(p.challenge_id, cur + 1);
      }

      if (currentUserId && p.user_id === currentUserId) {
        userParticipationMap.set(p.challenge_id, {
          id: p.id,
          challengeId: p.challenge_id,
          userId: p.user_id,
          status: p.status,
          proofsCount: p.proofs_count,
          joinedAt: p.joined_at,
          completedAt: p.completed_at,
        });
      }
    });

    return challengesData.map((c) => ({
      id: c.id,
      creatorId: c.creator_id,
      creator: creatorMap.get(c.creator_id),
      title: c.title,
      description: c.description,
      category: c.category,
      durationDays: c.duration_days,
      targetProofCount: c.target_proof_count,
      status: c.status,
      isPublic: c.is_public,
      startsAt: c.starts_at,
      endsAt: c.ends_at,
      createdAt: c.created_at,
      participantsCount: participantsByChallenge.get(c.id) || 0,
      userParticipation: userParticipationMap.get(c.id),
    }));
  } catch (err) {
    console.error('[CHALLENGES] Unexpected error in getChallenges:', err);
    return [];
  }
}

/**
 * Fetches a single challenge with participants and associated proofs.
 */
export async function getChallengeById(
  challengeId: string,
  currentUserId?: string
): Promise<ChallengeWithDetails | null> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: challengeData, error } = (await (supabase.from('challenges') as any)
      .select('*')
      .eq('id', challengeId)
      .maybeSingle()) as {
      data: {
        id: string;
        creator_id: string;
        title: string;
        description: string;
        category: string;
        duration_days: number;
        target_proof_count: number;
        status: 'active' | 'completed' | 'cancelled';
        is_public: boolean;
        starts_at: string;
        ends_at: string;
        created_at: string;
      } | null;
      error: { code?: string; message?: string } | null;
    };

    if (error || !challengeData) return null;

    // Fetch creator profile
    const { data: creatorProfile } = (await supabase
      .from('profiles')
      .select('*')
      .eq('id', challengeData.creator_id)
      .maybeSingle()) as { data: DbProfile | null };

    const creator: UserProfile | undefined = creatorProfile
      ? {
          id: creatorProfile.id,
          username: creatorProfile.username,
          avatarUrl: creatorProfile.avatar_url,
          bio: creatorProfile.bio,
          flexScore: creatorProfile.flex_score,
          streak: creatorProfile.streak,
          createdAt: creatorProfile.created_at,
        }
      : undefined;

    // Fetch participants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawParticipants } = (await (supabase.from('challenge_participants') as any)
      .select('*')
      .eq('challenge_id', challengeId)
      .order('proofs_count', { ascending: false })) as {
      data: Array<{
        id: string;
        challenge_id: string;
        user_id: string;
        status: 'invited' | 'joined' | 'declined' | 'completed' | 'left';
        proofs_count: number;
        joined_at: string;
        completed_at: string | null;
      }> | null;
    };

    const participantUserIds = (rawParticipants || []).map((p) => p.user_id);
    let participantProfilesMap = new Map<string, UserProfile>();

    if (participantUserIds.length > 0) {
      const { data: participantProfiles } = (await supabase
        .from('profiles')
        .select('*')
        .in('id', participantUserIds)) as { data: DbProfile[] | null };

      if (participantProfiles) {
        participantProfilesMap = new Map(
          participantProfiles.map((p) => [
            p.id,
            {
              id: p.id,
              username: p.username,
              avatarUrl: p.avatar_url,
              bio: p.bio,
              flexScore: p.flex_score,
              streak: p.streak,
              createdAt: p.created_at,
            },
          ])
        );
      }
    }

    const participants: ChallengeParticipantRecord[] = (rawParticipants || []).map((p) => ({
      id: p.id,
      challengeId: p.challenge_id,
      userId: p.user_id,
      user: participantProfilesMap.get(p.user_id),
      status: p.status,
      proofsCount: p.proofs_count,
      joinedAt: p.joined_at,
      completedAt: p.completed_at,
    }));

    const userParticipation = currentUserId
      ? participants.find((p) => p.userId === currentUserId)
      : undefined;

    // Fetch proofs attached to this challenge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: challengeProofsData } = (await (supabase.from('challenge_proofs') as any)
      .select('proof_id, user_id, created_at')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false })
      .limit(30)) as { data: { proof_id: string; user_id: string }[] | null };

    let proofsWithProfiles: ProofWithProfile[] = [];
    if (challengeProofsData && challengeProofsData.length > 0) {
      const proofIds = challengeProofsData.map((cp) => cp.proof_id);
      const { data: proofsRecords } = (await supabase
        .from('proofs')
        .select('*')
        .in('id', proofIds)) as { data: DbProof[] | null };

      if (proofsRecords) {
        proofsWithProfiles = proofsRecords.map((p) => {
          const author = participantProfilesMap.get(p.user_id);
          return {
            id: p.id,
            userId: p.user_id,
            imageUrl: p.image_url,
            category: p.category,
            caption: p.caption,
            points: p.points,
            createdAt: p.created_at,
            profile: author || {
              id: p.user_id,
              username: 'builder',
              avatarUrl: null,
              bio: null,
              flexScore: 0,
              streak: 0,
              createdAt: p.created_at,
            },
          };
        });
      }
    }

    const activeCount = participants.filter(
      (p) => p.status === 'joined' || p.status === 'completed'
    ).length;

    return {
      id: challengeData.id,
      creatorId: challengeData.creator_id,
      creator,
      title: challengeData.title,
      description: challengeData.description,
      category: challengeData.category,
      durationDays: challengeData.duration_days,
      targetProofCount: challengeData.target_proof_count,
      status: challengeData.status,
      isPublic: challengeData.is_public,
      startsAt: challengeData.starts_at,
      endsAt: challengeData.ends_at,
      createdAt: challengeData.created_at,
      participantsCount: activeCount,
      userParticipation,
      participants,
      proofs: proofsWithProfiles,
    };
  } catch (err) {
    console.error('[CHALLENGES] Unexpected error in getChallengeById:', err);
    return null;
  }
}

/**
 * Creates a new social challenge with creator joined automatically.
 */
export async function createChallenge(input: CreateChallengeInput): Promise<{
  success: boolean;
  challengeId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Authoritative auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== input.creatorId) {
      return { success: false, error: 'Unauthorized challenge creation attempt' };
    }

    // 2. Validate inputs
    const title = (input.title || '').trim().slice(0, 100);
    if (title.length < 3) {
      return { success: false, error: 'Title must be at least 3 characters long.' };
    }

    const description = (input.description || '').trim().slice(0, 1000);
    if (description.length < 5) {
      return { success: false, error: 'Description must be at least 5 characters long.' };
    }

    const validDurations = [7, 14, 21, 30, 60, 90];
    const durationDays = validDurations.includes(input.durationDays) ? input.durationDays : 7;
    const targetProofCount = Math.min(Math.max(1, input.targetProofCount || 7), 100);
    const category = input.category?.trim() || 'All';
    const isPublic = input.isPublic !== false;

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 3. Insert challenge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: challenge, error: insertError } = (await (supabase.from('challenges') as any)
      .insert({
        creator_id: user.id,
        title,
        description,
        category,
        duration_days: durationDays,
        target_proof_count: targetProofCount,
        status: 'active',
        is_public: isPublic,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single()) as { data: { id: string } | null; error: { code?: string; message?: string } | null };

    if (insertError || !challenge) {
      if (insertError?.code === 'PGRST205' || insertError?.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'Social Challenges database tables are pending creation in Supabase.',
        };
      }
      return { success: false, error: insertError?.message || 'Failed to create challenge.' };
    }

    // 4. Automatically join creator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('challenge_participants') as any).insert({
      challenge_id: challenge.id,
      user_id: user.id,
      status: 'joined',
      proofs_count: 0,
    });

    // 5. Send invitations if specified
    if (input.inviteUserIds && input.inviteUserIds.length > 0) {
      const invitees = input.inviteUserIds.filter((id) => id !== user.id).slice(0, 20);

      for (const inviteeId of invitees) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('challenge_participants') as any).insert({
          challenge_id: challenge.id,
          user_id: inviteeId,
          status: 'invited',
          proofs_count: 0,
        });

        // Trigger in-app notification
        createNotification({
          userId: inviteeId,
          actorId: user.id,
          type: 'challenge_invite',
          title: 'Challenge Invitation',
          body: `You were invited to join "${title}".`,
          link: `/challenges/${challenge.id}`,
          metadata: { challengeId: challenge.id },
        }).catch(() => {});
      }
    }

    return { success: true, challengeId: challenge.id };
  } catch (err) {
    console.error('[CHALLENGES] Unexpected error creating challenge:', err);
    return { success: false, error: 'Internal error creating challenge.' };
  }
}

/**
 * Join an active challenge.
 */
export async function joinChallenge(challengeId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Verify challenge exists and is active
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: challenge } = await (supabase.from('challenges') as any)
      .select('id, title, creator_id, status')
      .eq('id', challengeId)
      .maybeSingle();

    if (!challenge || challenge.status !== 'active') return false;

    // Check existing participation state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingParticipant } = await (supabase.from('challenge_participants') as any)
      .select('status, proofs_count')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingParticipant?.status === 'completed') {
      // Already completed. Preserve completed status.
      return true;
    }

    if (existingParticipant?.status === 'joined') {
      // Already joined. Idempotent success.
      return true;
    }

    // Upsert participant record with status 'joined' and preserving proofs_count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('challenge_participants') as any).upsert(
      {
        challenge_id: challengeId,
        user_id: userId,
        status: 'joined',
        proofs_count: existingParticipant?.proofs_count || 0,
      },
      { onConflict: 'challenge_id,user_id' }
    );

    if (error) {
      console.error('[CHALLENGES] Failed to join challenge:', error.message);
      return false;
    }

    // Notify creator if participant is someone else and this is a new join
    if (challenge.creator_id !== userId) {
      // Fetch joining user's username
      const { data: profile } = (await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle()) as { data: { username: string } | null };

      createNotification({
        userId: challenge.creator_id,
        actorId: userId,
        type: 'challenge_accepted',
        title: 'New Challenge Participant',
        body: `@${profile?.username || 'A builder'} joined "${challenge.title}".`,
        link: `/challenges/${challengeId}`,
        metadata: { challengeId },
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('[CHALLENGES] Unexpected error joining challenge:', err);
    return false;
  }
}

/**
 * Leave a challenge.
 */
export async function leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('challenge_participants') as any)
      .update({ status: 'left' })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Authoritatively link a created proof to eligible active challenges.
 * Called automatically upon successful proof creation in lib/proof/server.ts.
 */
export async function linkProofToEligibleChallenges(
  proofId: string,
  userId: string,
  category: string
): Promise<number> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. Find all active joined challenges for this user that are currently running
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participations, error } = (await (supabase.from('challenge_participants') as any)
      .select('id, challenge_id, proofs_count, status, challenges!inner(id, title, category, target_proof_count, status, starts_at, ends_at)')
      .eq('user_id', userId)
      .eq('status', 'joined')
      .eq('challenges.status', 'active')
      .lte('challenges.starts_at', now)
      .gte('challenges.ends_at', now)) as {
      data: Array<{
        id: string;
        challenge_id: string;
        proofs_count: number;
        status: string;
        challenges: {
          id: string;
          title: string;
          category: string;
          target_proof_count: number;
        };
      }> | null;
      error: unknown;
    };

    if (error || !participations || participations.length === 0) {
      return 0;
    }

    let linkedCount = 0;

    for (const item of participations) {
      const challenge = item.challenges;

      // Check category match
      const isEligibleCategory =
        challenge.category === 'All' ||
        challenge.category.toLowerCase() === category.toLowerCase();

      if (!isEligibleCategory) continue;

      // Prevent duplicate proof link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingLink } = await (supabase.from('challenge_proofs') as any)
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('proof_id', proofId)
        .maybeSingle();

      if (existingLink) continue;

      // Insert link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: linkErr } = await (supabase.from('challenge_proofs') as any).insert({
        challenge_id: challenge.id,
        proof_id: proofId,
        user_id: userId,
      });

      if (linkErr) continue;

      linkedCount += 1;

      // Query authoritative count from DB (maintained by trigger on challenge_proofs)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updatedParticipant } = await (supabase.from('challenge_participants') as any)
        .select('proofs_count, status, completed_at')
        .eq('id', item.id)
        .maybeSingle();

      const currentCount = updatedParticipant?.proofs_count ?? ((item.proofs_count || 0) + 1);
      const isNowCompleted = updatedParticipant?.status === 'completed' || currentCount >= challenge.target_proof_count;
      const justCompleted = isNowCompleted && item.status !== 'completed';

      // Ensure participant record is synchronized if trigger is pending
      if (!updatedParticipant || updatedParticipant.proofs_count !== currentCount) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('challenge_participants') as any)
          .update({
            proofs_count: currentCount,
            status: isNowCompleted ? 'completed' : 'joined',
            completed_at: isNowCompleted ? new Date().toISOString() : null,
          })
          .eq('id', item.id);
      }

      // Trigger notification once on completion, or progress notification
      if (justCompleted) {
        createNotification({
          userId,
          type: 'challenge_completed',
          title: 'Challenge Completed!',
          body: `You accomplished "${challenge.title}" with ${currentCount} verified proofs!`,
          link: `/challenges/${challenge.id}`,
          metadata: { challengeId: challenge.id },
        }).catch(() => {});
      } else if (!isNowCompleted) {
        createNotification({
          userId,
          type: 'challenge_progress',
          title: 'Challenge Progress',
          body: `Proof recorded in "${challenge.title}". ${currentCount}/${challenge.target_proof_count} completed.`,
          link: `/challenges/${challenge.id}`,
          metadata: { challengeId: challenge.id },
        }).catch(() => {});
      }
    }

    return linkedCount;
  } catch (err) {
    console.error('[CHALLENGES] Error linking proof to challenges:', err);
    return 0;
  }
}
