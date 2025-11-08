import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Migration endpoint to remove 'other' field from all resume data
 * Run this once to clean up the database after removing the Other section
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

    // Get all resumes for the current user
    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
    });

    let updatedCount = 0;

    // Update each resume to remove the 'other' field
    for (const resume of resumes) {
      const data = resume.data as any;
      
      if (data && 'other' in data) {
        // Remove 'other' field
        const { other, ...cleanedData } = data;
        
        await prisma.resume.update({
          where: { id: resume.id },
          data: {
            data: cleanedData,
          },
        });
        
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned ${updatedCount} resume(s). Removed 'other' field from database.`,
      updatedCount,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate data', details: error.message },
      { status: 500 }
    );
  }
}

