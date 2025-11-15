'use client';

import { useEffect } from 'react';

/**
 * StorageCleanup Component
 * 
 * Automatically cleans up unused storage keys that are not used by the application.
 * This includes:
 * - authuser: Not used by NextAuth (NextAuth uses cookies instead)
 * - authToken: Not used by NextAuth (NextAuth uses HTTP-only cookies)
 * - authUser: Not used by NextAuth (NextAuth uses cookies instead)
 * 
 * This component runs once on mount and removes invalid/unused data.
 */
export function StorageCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Remove unused authentication-related keys (NextAuth uses HTTP-only cookies)
      const keysToRemove = ['authuser', 'authToken', 'authUser'];
      
      keysToRemove.forEach(key => {
        try {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
          }
          if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
          }
        } catch {
          // Silently ignore errors for individual keys
        }
      });
    } catch {
      // Silently fail - don't break the app if storage is unavailable
    }
  }, []);

  // This component doesn't render anything
  return null;
}

