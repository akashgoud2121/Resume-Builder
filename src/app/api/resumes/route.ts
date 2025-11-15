import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/resumes - Get all resumes for the current user
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
        // Don't return full data in list view for performance
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST /api/resumes - Create a new resume (or update existing if one exists)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, data } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Atomic upsert: Either update existing resume or create new one
    // Uses @@unique([userId]) constraint to guarantee one resume per user
    const resume = await prisma.resume.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        title: title || undefined, // Only update title if provided
        data: data,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        title: title || 'Untitled Resume',
        data: data,
      },
    });

    // Determine if this was an update or create based on createdAt vs updatedAt
    const isUpdate = resume.updatedAt.getTime() > resume.createdAt.getTime() + 1000; // 1 second threshold

    return NextResponse.json({
      success: true,
      resume,
      isUpdate: isUpdate,
    }, { status: isUpdate ? 200 : 201 });
  } catch (error: any) {
    // Handle unique constraint violation (should not happen with upsert, but safety check)
    if (error.code === 'P2002' || error.meta?.target?.includes('userId')) {
      return NextResponse.json(
        { error: 'Resume already exists for this user. Please use update endpoint.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create or update resume' },
      { status: 500 }
    );
  }
}

