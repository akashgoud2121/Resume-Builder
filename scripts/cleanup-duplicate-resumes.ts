/**
 * Cleanup Script: Remove Duplicate Resumes
 * 
 * This script removes duplicate resumes, keeping only the most recent one per user.
 * Run this BEFORE applying the unique constraint to the database.
 * 
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-resumes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateResumes() {
  try {
    console.log('🔍 Finding duplicate resumes...\n');

    // Find all resumes grouped by userId
    const allResumes = await prisma.resume.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc', // Most recent first
      },
    });

    // Group resumes by userId
    const resumesByUser = new Map<string, typeof allResumes>();
    
    for (const resume of allResumes) {
      const userId = resume.userId;
      if (!resumesByUser.has(userId)) {
        resumesByUser.set(userId, []);
      }
      resumesByUser.get(userId)!.push(resume);
    }

    // Find users with multiple resumes
    const usersWithDuplicates: Array<{
      userId: string;
      resumes: typeof allResumes;
    }> = [];

    for (const [userId, resumes] of resumesByUser.entries()) {
      if (resumes.length > 1) {
        usersWithDuplicates.push({ userId, resumes });
      }
    }

    if (usersWithDuplicates.length === 0) {
      console.log('✅ No duplicate resumes found!');
      return;
    }

    console.log(`📊 Found ${usersWithDuplicates.length} user(s) with duplicate resumes:\n`);

    // Show summary
    let totalDuplicatesToDelete = 0;
    for (const { userId, resumes } of usersWithDuplicates) {
      const toDelete = resumes.length - 1;
      totalDuplicatesToDelete += toDelete;
      console.log(`  User ${userId}:`);
      console.log(`    - Total resumes: ${resumes.length}`);
      console.log(`    - Keeping: 1 (most recent: ${resumes[0].id})`);
      console.log(`    - Deleting: ${toDelete}`);
      console.log('');
    }

    console.log(`⚠️  Total resumes to delete: ${totalDuplicatesToDelete}\n`);

    // Delete duplicates (keep the most recent one)
    let deletedCount = 0;
    for (const { userId, resumes } of usersWithDuplicates) {
      // Keep the first one (most recent), delete the rest
      const toDelete = resumes.slice(1);

      for (const resume of toDelete) {
        try {
          await prisma.resume.delete({
            where: { id: resume.id },
          });
          deletedCount++;
          console.log(`  ✅ Deleted resume ${resume.id} (User: ${userId})`);
        } catch (error: any) {
          console.error(`  ❌ Failed to delete resume ${resume.id}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   - Deleted: ${deletedCount} duplicate resume(s)`);
    console.log(`   - Users affected: ${usersWithDuplicates.length}`);
    console.log(`\n🎯 You can now run: npx prisma db push`);

  } catch (error: any) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicateResumes()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


