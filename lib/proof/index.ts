import { createClient } from '@/lib/supabase/client';
import { calculateProofPoints } from '@/lib/score';
import { ProofRecord } from '@/types';

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
  let imageUrl: string | null = null;

  // 1. Upload image if provided
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('proof-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('proof-images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // 2. Calculate points using centralized score module
  const points = calculateProofPoints(!!imageFile);

  // 3. Create proof record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: proof, error: proofError } = await (supabase.from('proofs') as any)
    .insert({
      user_id: userId,
      category,
      caption,
      image_url: imageUrl,
      points,
    })
    .select()
    .single();

  if (proofError || !proof) {
    throw proofError || new Error('Failed to create proof record.');
  }

  // 4. Update user's flex_score in profiles table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('flex_score')
    .eq('id', userId)
    .single();

  const currentScore = profile?.flex_score || 0;
  const newScore = currentScore + points;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase.from('profiles') as any)
    .update({ flex_score: newScore })
    .eq('id', userId);

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
