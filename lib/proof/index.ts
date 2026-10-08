import { createClient } from '@/lib/supabase/client';
import { calculateProofPoints } from '@/lib/score';
import { ProofRecord } from '@/types';

const ALLOWED_CATEGORIES = new Set([
  'Fitness',
  'Learning',
  'Creating',
  'Building',
  'Lifestyle',
  'Achievement',
  'General',
]);

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Creates a proof: uploads image to storage, inserts proof record, and updates user profile flex score.
 */
export async function createProof(
  userId: string,
  category: string,
  caption: string,
  imageFile?: File | null
): Promise<ProofRecord> {
  const supabase = createClient();

  // 1. Verify active authenticated user session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || user.id !== userId) {
    throw new Error('Unauthorized proof creation attempt.');
  }

  // 2. Validate category and caption
  const validCategory = ALLOWED_CATEGORIES.has(category) ? category : 'General';
  const cleanCaption = (caption || '').trim().slice(0, 1000);
  if (!cleanCaption) {
    throw new Error('Please describe what you actually accomplished.');
  }

  let imageUrl: string | null = null;

  // 3. Upload image if provided with strict type & size validation
  if (imageFile) {
    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SECURITY_EVENT',
          eventTitle: 'Oversized image upload rejected',
          endpoint: '/proof',
          authStatus: 'Authenticated',
          result: '400 Bad Request',
          details: `Attempted file size: ${Math.round(imageFile.size / (1024 * 1024))}MB`,
        }),
      }).catch(() => {});
      throw new Error('Image file exceeds the 10MB size limit.');
    }

    const mime = (imageFile.type || '').toLowerCase();
    const safeExt = ALLOWED_MIME_TYPES[mime];
    if (!safeExt) {
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
      throw new Error('Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.');
    }

    const safeRandom = Math.random().toString(36).substring(2, 10);
    const fileName = `${user.id}/${Date.now()}_${safeRandom}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('proof-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: mime,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('proof-images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // 4. Calculate points authoritatively using centralized score module
  const points = calculateProofPoints(!!imageFile);

  // 5. Create proof record
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
    throw proofError || new Error('Failed to create proof record.');
  }

  // 6. Update user's flex_score in profiles table
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
    console.error('Failed to update flex score:', profileError);
  }

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
