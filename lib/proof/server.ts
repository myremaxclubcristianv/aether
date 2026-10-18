import { createClient } from '@/lib/supabase/server';
import { calculateProofPoints } from '@/lib/score';
import { ProofRecord } from '@/types';
import { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from './constants';
import { linkProofToEligibleChallenges } from '@/lib/challenges';

export { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES };

export interface CreateProofServerParams {
  userId?: string;
  category: string;
  caption: string;
  imageFile?: File | Blob | null;
}

/**
 * Authoritative server-side proof creation.
 * Enforces authenticated server session, validates ownership, checks/repairs profile safely,
 * enforces storage folder isolation and database RLS, and calculates score authoritatively.
 */
export async function createProofServer(params: CreateProofServerParams): Promise<ProofRecord> {
  const supabase = await createClient();

  // 1. Authoritative server-side authentication check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to create a proof. Please sign in.');
  }

  // 2. Strict authorization: reject if client attempts to act on behalf of another user
  if (params.userId && params.userId !== user.id) {
    throw new Error('Unauthorized proof creation attempt.');
  }

  // 3. Handle profile existence safely and deterministically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawProfile, error: profileFetchErr } = await (supabase.from('profiles') as any)
    .select('id, flex_score, streak, username')
    .eq('id', user.id)
    .maybeSingle();

  if (profileFetchErr) {
    console.error('[AETHER PROOF] Profile fetch error:', profileFetchErr.message || profileFetchErr);
  }

  let profile = rawProfile;

  if (!profile) {
    // If authenticated user has a missing profile, deterministically ensure it with least privilege
    const candidateUsername =
      (typeof user.user_metadata?.username === 'string' && user.user_metadata.username.trim()
        ? user.user_metadata.username.trim()
        : '') || `user_${user.id.replace(/-/g, '').substring(0, 10)}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: createdProfile, error: createErr } = await (supabase.from('profiles') as any)
      .insert({
        id: user.id,
        username: candidateUsername,
        flex_score: 0,
        streak: 0,
      })
      .select('id, flex_score, streak, username')
      .maybeSingle();

    if (createErr || !createdProfile) {
      const errCode = createErr?.code || 'UNKNOWN';
      const errMsg = createErr?.message || 'Failed to initialize profile.';
      console.error(`[AETHER PROOF] Missing profile repair error: [${errCode}] ${errMsg}`);
      throw new Error('User profile is required to create a proof. Please complete onboarding.');
    }
    profile = createdProfile;
  }

  // 4. Validate category and caption
  const validCategory = ALLOWED_CATEGORIES.has(params.category) ? params.category : 'General';
  const cleanCaption = (params.caption || '').trim().slice(0, 1000);
  if (!cleanCaption) {
    throw new Error('Please describe what you actually accomplished.');
  }

  let uploadedFileName: string | null = null;
  let imageUrl: string | null = null;

  // 5. Image upload handling with strict MIME and size validation
  if (params.imageFile && params.imageFile.size > 0) {
    if (params.imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image file exceeds the 10MB size limit.');
    }

    const mime = (params.imageFile.type || '').toLowerCase();
    const safeExt = ALLOWED_MIME_TYPES[mime];
    if (!safeExt) {
      throw new Error('Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.');
    }

    const safeRandom = Math.random().toString(36).substring(2, 10);
    const fileName = `${user.id}/${Date.now()}_${safeRandom}.${safeExt}`;

    const arrayBuffer = await params.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('proof-images')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: mime,
      });

    if (uploadError) {
      const rawMsg = uploadError.message || String(uploadError);
      console.error('[AETHER PROOF] Storage upload error:', rawMsg);
      const hasNoSuchBucketCode = typeof uploadError === 'object' && uploadError !== null && 'code' in uploadError && (uploadError as Record<string, unknown>).code === 'NoSuchBucket';
      if (rawMsg.includes('Bucket not found') || hasNoSuchBucketCode) {
        throw new Error('Image storage bucket "proof-images" is not found. Please complete storage setup in Supabase.');
      }
      throw new Error(`Image upload failed: ${rawMsg}`);
    }

    uploadedFileName = fileName;

    const { data } = supabase.storage
      .from('proof-images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // 6. Calculate points authoritatively using centralized score module
  const points = calculateProofPoints(Boolean(imageUrl));

  // 7. Insert proof record with authoritative user_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proof, error: proofError } = await (supabase.from('proofs') as any)
    .insert({
      user_id: user.id,
      category: validCategory,
      caption: cleanCaption,
      image_url: imageUrl,
      points,
    })
    .select()
    .single();

  if (proofError || !proof) {
    const errCode = proofError?.code || 'UNKNOWN';
    const errMsg = proofError?.message || 'Failed to create proof record.';
    console.error(`[AETHER PROOF] Proof insertion error: [${errCode}] ${errMsg}`, {
      details: proofError?.details,
      hint: proofError?.hint,
    });

    // Cleanup uploaded storage object to prevent orphan files if DB insertion fails
    if (uploadedFileName) {
      await supabase.storage
        .from('proof-images')
        .remove([uploadedFileName])
        .catch((cleanupErr) => {
          console.error('[AETHER PROOF] Failed to cleanup orphaned image:', cleanupErr);
        });
    }

    throw new Error(errMsg);
  }

  // 8. Update user's flex_score authoritatively in profiles table
  const currentScore = profile?.flex_score || 0;
  const newScore = currentScore + points;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase.from('profiles') as any)
    .update({ flex_score: newScore })
    .eq('id', user.id);

  if (profileError) {
    console.error('[AETHER PROOF] Failed to update flex score:', profileError.message || profileError);
  }

  // 9. Authoritatively link proof to active eligible challenges
  linkProofToEligibleChallenges(proof.id, user.id, validCategory).catch((err) => {
    console.error('[AETHER PROOF] Challenge link error:', err);
  });

  return {
    id: proof.id,
    userId: proof.user_id,
    imageUrl: proof.image_url,
    category: proof.category,
    caption: proof.caption,
    points: proof.points,
    createdAt: proof.created_at,
  };
}
