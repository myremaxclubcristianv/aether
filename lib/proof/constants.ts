export const ALLOWED_CATEGORIES = new Set([
  'Fitness',
  'Learning',
  'Creating',
  'Building',
  'Lifestyle',
  'Achievement',
  'General',
]);

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
