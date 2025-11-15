/**
 * Cleanup Script: Remove authuser from localStorage
 * 
 * This script removes the 'authuser' key from localStorage if it exists.
 * This key should not be used by NextAuth (which uses cookies instead).
 * 
 * Usage:
 *   npx tsx scripts/cleanup-authuser-storage.ts
 * 
 * Or run in browser console:
 *   localStorage.removeItem('authuser');
 *   sessionStorage.removeItem('authuser');
 */

console.log('🧹 Cleaning up authuser from storage...\n');

if (typeof window === 'undefined') {
  console.error('❌ This script must be run in a browser environment');
  process.exit(1);
}

try {
  // Check localStorage
  const localAuthUser = localStorage.getItem('authuser');
  if (localAuthUser) {
    console.log('📦 Found authuser in localStorage:');
    try {
      const parsed = JSON.parse(localAuthUser);
      console.log('   Content:', JSON.stringify(parsed, null, 2));
    } catch {
      console.log('   Content:', localAuthUser.substring(0, 100));
    }
    localStorage.removeItem('authuser');
    console.log('   ✅ Removed from localStorage\n');
  } else {
    console.log('✅ No authuser found in localStorage\n');
  }

  // Check sessionStorage
  const sessionAuthUser = sessionStorage.getItem('authuser');
  if (sessionAuthUser) {
    console.log('📦 Found authuser in sessionStorage:');
    try {
      const parsed = JSON.parse(sessionAuthUser);
      console.log('   Content:', JSON.stringify(parsed, null, 2));
    } catch {
      console.log('   Content:', sessionAuthUser.substring(0, 100));
    }
    sessionStorage.removeItem('authuser');
    console.log('   ✅ Removed from sessionStorage\n');
  } else {
    console.log('✅ No authuser found in sessionStorage\n');
  }

  // Check all localStorage keys for debugging
  console.log('📋 Current localStorage keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`   - ${key}`);
    }
  }

  console.log('\n✅ Cleanup complete!');
  console.log('ℹ️  Note: NextAuth uses HTTP-only cookies, not localStorage');
  console.log('ℹ️  User data should come from NextAuth session, not localStorage');
} catch (error: any) {
  console.error('❌ Error during cleanup:', error.message);
}


