'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    signOut: () => signOut({ callbackUrl: '/login' }),
  };
}

export function useAuthActions() {
  return {
    signInWithGoogle: () => signIn('google', { callbackUrl: '/' }),
    signInWithGitHub: () => signIn('github', { callbackUrl: '/' }),
    signIn: (email: string, password: string) =>
      signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/',
      }),
    signOut: () => signOut({ callbackUrl: '/login' }),
  };
}

