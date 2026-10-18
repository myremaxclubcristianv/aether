import { createClient } from '@/lib/supabase/client';
import { calculateProofPoints } from '@/lib/score';
import { ProofRecord } from '@/types';
import { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from './constants';

export { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES };

/**
 * Creates a proof:
 * In the browser, executes directly via createBrowserClient with the user's active session,
 * seamlessly uploading images to 'proof-images' with storage isolation and inserting proofs
 * under database RLS (auth.uid() = user_id), updating flex_score (+10 text / +15 image),
 * and dispatching asynchronous challenge linking.
 */
export async function createProof(
  userIdOrCategory: string,
  categoryOrCaption?: string,
  captionOrFile?: string | File | null,
  maybeImageFile?: File | null
): Promise<ProofRecord> {
  let targetUserId: string | undefined;
  let targetCategory: string;
  let targetCaption: string;
  let targetImageFile: File | null = null;

  if (typeof captionOrFile === 'string') {
    // 4 arguments: (userId, category, caption, imageFile)
    targetUserId = userIdOrCategory;
    targetCategory = categoryOrCaption || 'General';
    targetCaption = captionOrFile;
    targetImageFile = maybeImageFile || null;
  } else {
    // 3 arguments: (category, caption, imageFile)
    targetCategory = userIdOrCategory;
    targetCaption = categoryOrCaption || '';
    targetImageFile = (captionOrFile as File | null) || null;
  }

  // Pre-validate for immediate responsive feedback
  if (targetImageFile && targetImageFile.size > MAX_IMAGE_SIZE_BYTES) {
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SECURITY_EVENT',
          eventTitle: 'Oversized image upload rejected',
          endpoint: '/proof',
          authStatus: 'Authenticated',
          result: '400 Bad Request',
          details: `Attempted file size: ${Math.round(targetImageFile.size / (1024 * 1024))}MB`,
        }),
      }).catch(() => {});
    }
    throw new Error('Image file exceeds the 10MB size limit.');
  }

  if (targetImageFile) {
    const mime = (targetImageFile.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES[mime]) {
      if (typeof window !== 'undefined') {
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'SECURITY_EVENT',
            eventTitle: 'Disallowed file type upload rejected',
            endpoint: '/proof',
            authStatus: 'Authenticated',
            result: '400 Bad Request',
            details: `Rejected MIME: ${mime || 'unknown'}`,
          }),
        }).catch(() => {});
      }
      throw new Error('Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.');
    }
  }

  const cleanCaption = (targetCaption || '').trim().slice(0, 1000);
  if (!cleanCaption) {
    throw new Error('Please describe what you actually accomplished.');
  }

  const validCategory = ALLOWED_CATEGORIES.has(targetCategory) ? targetCategory : 'General';

  // If executing in browser or client context, use direct client-side Supabase client
  // (Restores the proven, zero-latency working flow from 1aa6548)
  if (typeof window !== 'undefined') {
    const supabase = createClient();

    // 1. Verify active authenticated user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required to create a proof. Please sign in.');
    }

    if (targetUserId && targetUserId !== user.id) {
      throw new Error('Unauthorized proof creation attempt.');
    }

    let imageUrl: string | null = null;
    let uploadedFileName: string | null = null;

    // 2. Upload image if provided with strict type & size validation
    if (targetImageFile) {
      const mime = (targetImageFile.type || '').toLowerCase();
      const safeExt = ALLOWED_MIME_TYPES[mime] || 'jpg';
      const safeRandom = Math.random().toString(36).substring(2, 10);
      const fileName = `${user.id}/${Date.now()}_${safeRandom}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('proof-images')
        .upload(fileName, targetImageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: mime,
        });

      if (uploadError) {
        const rawMsg = uploadError.message || String(uploadError);
        console.error('[AETHER PROOF] Storage upload error:', rawMsg);
        const hasNoSuchBucket =
          typeof uploadError === 'object' &&
          uploadError !== null &&
          'code' in uploadError &&
          (uploadError as Record<string, unknown>).code === 'NoSuchBucket';
        if (rawMsg.includes('Bucket not found') || hasNoSuchBucket) {
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

    // 3. Calculate points authoritatively using centralized score module
    const points = calculateProofPoints(Boolean(imageUrl));

    // 4. Create proof record in database
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
      const errMsg = proofError?.message || 'Failed to create proof record.';
      console.error('[AETHER PROOF] Proof insertion error:', errMsg);

      // Clean up uploaded file if DB insertion failed
      if (uploadedFileName) {
        await supabase.storage
          .from('proof-images')
          .remove([uploadedFileName])
          .catch(() => {});
      }

      throw new Error(errMsg);
    }

    // 5. Update user's flex_score in profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('flex_score')
      .eq('id', user.id)
      .maybeSingle();

    const currentScore = profile?.flex_score || 0;
    const newScore = currentScore + points;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({ flex_score: newScore })
      .eq('id', user.id);

    if (profileError) {
      console.error('[AETHER PROOF] Failed to update flex score:', profileError.message || profileError);
    }

    // 6. Asynchronously sync proof with active eligible challenges
    fetch('/api/proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'link_challenges',
        proofId: proof.id,
        category: validCategory,
      }),
    }).catch((err) => {
      console.error('[AETHER PROOF] Challenge link dispatch error:', err);
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

  // Non-browser fallback: post to /api/proof
  const formData = new FormData();
  formData.append('category', validCategory);
  formData.append('caption', cleanCaption);
  if (targetUserId) {
    formData.append('userId', targetUserId);
  }
  if (targetImageFile) {
    formData.append('image', targetImageFile);
  }

  const response = await fetch('/api/proof', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error || 'Failed to create proof.');
  }

  return result.proof;
}
