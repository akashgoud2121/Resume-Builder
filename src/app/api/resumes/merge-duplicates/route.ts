import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/resumes/merge-duplicates
 * 
 * Utility endpoint to merge duplicate resumes for a user.
 * Keeps the latest resume and deletes others.
 * 
 * Returns: { success: true, message: string, resume: Resume, deletedCount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all resumes for user
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    if (resumes.length <= 1) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found',
        resume: resumes[0] || null,
        deletedCount: 0,
      });
    }

    // Keep the latest resume (first in sorted array)
    const latestResume = resumes[0];
    
    // Get IDs of resumes to delete (all except the latest)
    const idsToDelete = resumes.slice(1).map(r => r.id);
    
    // Delete duplicate resumes
    const deleteResult = await prisma.resume.deleteMany({
      where: {
        id: { in: idsToDelete },
        userId: session.user.id, // Extra safety check
      },
    });

    return NextResponse.json({
      success: true,
      message: `Merged ${resumes.length - 1} duplicate resume(s). Kept the latest resume.`,
      resume: latestResume,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to merge duplicates' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/resumes/merge-duplicates
 * 
 * Check for duplicate resumes without merging.
 * 
 * Returns: { hasDuplicates: boolean, count: number, resumes: Resume[] }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      hasDuplicates: resumes.length > 1,
      count: resumes.length,
      resumes: resumes,
      message: resumes.length > 1 
        ? `Found ${resumes.length} resumes. You should have only 1. Run POST /api/resumes/merge-duplicates to remove duplicates.`
        : `Found ${resumes.length} resume(s). No duplicates.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}


