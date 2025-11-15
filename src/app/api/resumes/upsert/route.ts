import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/resumes/upsert
 * 
 * Upsert endpoint: Updates existing resume if one exists, creates new one if not.
 * This prevents duplicate resume creation.
 * 
 * Body: { title?: string, data: ResumeData }
 * Returns: { success: true, resume: Resume, isUpdate: boolean }
 */
export async function POST(request: NextRequest) {
  // Parse body - handle both JSON and FormData (for sendBeacon compatibility)
  let body: any;
  const contentType = request.headers.get('content-type') || '';
  
  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('text/plain')) {
      // Handle sendBeacon/FormData - read as text and parse
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        // If text is not JSON, try to parse as FormData (unlikely but handle gracefully)
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        );
      }
    } else {
      // Fallback: try to parse as JSON
      body = await request.json();
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
  
  const { title, data } = body;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Atomic upsert: Either update existing resume or create new one
    // Uses @@unique([userId]) constraint to guarantee one resume per user
    // This eliminates race conditions and guarantees data integrity at the database level
    const resume = await prisma.resume.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        title: title || undefined, // Only update title if provided, otherwise keep existing
        data: data,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        title: title || `Resume - ${new Date().toLocaleDateString()}`,
        data: data,
      },
    });

    // Determine if this was an update or create based on createdAt vs updatedAt
    // If updatedAt is significantly later than createdAt, it's an update
    const isUpdate = resume.updatedAt.getTime() > resume.createdAt.getTime() + 1000; // 1 second threshold

    return NextResponse.json({
      success: true,
      resume,
      isUpdate: isUpdate,
    }, { status: isUpdate ? 200 : 201 });
  } catch (error: any) {
    // Handle unique constraint violation (should not happen with upsert, but safety check)
    if (error.code === 'P2002' || error.meta?.target?.includes('userId')) {
      // This should not happen with atomic upsert, but if it does, retry once
      // Get session again for retry logic
      const retrySession = await getServerSession(authOptions);
      if (!retrySession?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      try {
        const resume = await prisma.resume.update({
          where: { userId: retrySession.user.id },
          data: {
            title: title || undefined,
            data: data,
            updatedAt: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          resume,
          isUpdate: true,
        }, { status: 200 });
      } catch (retryError) {
        return NextResponse.json(
          { error: 'Failed to update resume due to constraint violation' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upsert resume' },
      { status: 500 }
    );
  }
}

