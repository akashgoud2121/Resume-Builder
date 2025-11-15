import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Cleanup duplicate resumes
 * 
 * This endpoint removes duplicate resume documents for the current user,
 * keeping only the most recent one (by updatedAt).
 * 
 * Usage: POST /api/resumes/cleanup
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all user's resumes, sorted by most recent first
    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (resumes.length === 0) {
      return NextResponse.json({
        message: 'No resumes found',
        totalResumes: 0,
        kept: 0,
        deleted: 0,
      });
    }

    if (resumes.length === 1) {
      return NextResponse.json({
        message: 'No duplicates found. You have only one resume.',
        totalResumes: 1,
        kept: 1,
        deleted: 0,
        keptResumeId: resumes[0].id,
      });
    }

    // Keep the most recent resume (first in list)
    const keptResume = resumes[0];
    const duplicatesToDelete = resumes.slice(1);

    // Delete duplicate resumes
    const deleteResult = await prisma.resume.deleteMany({
      where: {
        id: {
          in: duplicatesToDelete.map(r => r.id),
        },
      },
    });

    return NextResponse.json({
      message: 'Cleanup successful! Duplicates removed.',
      totalResumes: resumes.length,
      kept: 1,
      deleted: deleteResult.count,
      keptResumeId: keptResume.id,
      deletedResumeIds: duplicatesToDelete.map(r => r.id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cleanup resumes' },
      { status: 500 }
    );
  }
}

/**
 * Get cleanup status (check for duplicates without deleting)
 * 
 * Usage: GET /api/resumes/cleanup
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all user's resumes
    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      totalResumes: resumes.length,
      hasDuplicates: resumes.length > 1,
      resumes: resumes,
      message: resumes.length > 1 
        ? `Found ${resumes.length} resumes. You should have only 1. Run POST /api/resumes/cleanup to remove duplicates.`
        : 'No duplicates found. You have the correct number of resumes.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check resumes' },
      { status: 500 }
    );
  }
}

