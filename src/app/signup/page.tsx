'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg">
        <div>
          <Link href="/" className="flex items-center justify-center gap-3">
            <img
              src="/images/cognisys-logo.svg"
              alt="Cognisys AI Logo"
              className="h-10 w-10 object-contain rounded-md"
            />
            <h1 className="text-2xl font-bold font-headline">Cognisys AI Resume Builder</h1>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            Create a new account
          </h2>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
