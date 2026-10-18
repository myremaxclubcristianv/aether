import { NextRequest, NextResponse } from 'next/server';
import { createProofServer } from '@/lib/proof/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let category = 'General';
    let caption = '';
    let userId: string | undefined;
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      category = (formData.get('category') as string) || 'General';
      caption = (formData.get('caption') as string) || '';
      const formUserId = formData.get('userId');
      if (typeof formUserId === 'string' && formUserId.trim()) {
        userId = formUserId.trim();
      }

      const fileEntry = formData.get('image');
      if (fileEntry instanceof File && fileEntry.size > 0) {
        imageFile = fileEntry;
      }
    } else {
      const body = await request.json().catch(() => ({}));
      category = body.category || 'General';
      caption = body.caption || '';
      if (typeof body.userId === 'string' && body.userId.trim()) {
        userId = body.userId.trim();
      }
    }

    const proof = await createProofServer({
      userId,
      category,
      caption,
      imageFile,
    });

    return NextResponse.json({ ok: true, proof }, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = 'Failed to create proof.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      errorMessage = (error as { message: string }).message;
    }

    console.error('[AETHER PROOF API] POST /api/proof failure:', {
      error,
      resolvedMessage: errorMessage,
    });

    let status = 400;
    if (errorMessage.includes('Authentication required')) {
      status = 401;
    } else if (errorMessage.includes('Unauthorized proof creation attempt')) {
      status = 403;
    }

    return NextResponse.json({ ok: false, error: errorMessage }, { status });
  }
}
