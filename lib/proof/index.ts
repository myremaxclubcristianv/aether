import { ProofRecord } from '@/types';
import { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from './constants';

export { ALLOWED_CATEGORIES, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE_BYTES };

/**
 * Creates a proof by dispatching to the authoritative server-side endpoint.
 * Ensures the user's identity is derived strictly from the trusted server session,
 * RLS and storage isolation policies are enforced, and Flex Score is updated.
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

  // Pre-validate in browser for immediate responsive feedback
  if (targetImageFile && targetImageFile.size > MAX_IMAGE_SIZE_BYTES) {
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
    throw new Error('Image file exceeds the 10MB size limit.');
  }

  if (targetImageFile) {
    const mime = (targetImageFile.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES[mime]) {
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
  }

  const cleanCaption = (targetCaption || '').trim().slice(0, 1000);
  if (!cleanCaption) {
    throw new Error('Please describe what you actually accomplished.');
  }

  const formData = new FormData();
  formData.append('category', targetCategory);
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
