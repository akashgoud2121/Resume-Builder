'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    signOut: () => signOut({ callbackUrl: '/' }),
  };
}

export function useAuthActions() {
  return {
    signInWithGoogle: () => signIn('google', { callbackUrl: '/' }),
    signInWithGitHub: () => signIn('github', { callbackUrl: '/' }),
    signOut: () => signOut({ callbackUrl: '/' }),
  };
}

