'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg">
        <div>
          <Link href="/" className="flex items-center justify-center gap-3">
             <Image
              src="https://media.licdn.com/dms/image/v2/D560BAQFK4uppQGwRcg/company-logo_200_200/company-logo_200_200/0/1735737431638?e=1762387200&v=beta&t=Xbh4cXQiNT16QKv_YTNoxdzEfN9TVrpbfxh4rR1sd-U"
              alt="Cognisys AI Logo"
              width={40}
              height={40}
              className="rounded-md"
              data-ai-hint="company logo"
            />
            <h1 className="text-2xl font-bold font-headline">Cognisys AI Resume Builder</h1>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not a member?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
