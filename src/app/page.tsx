import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">ResumeRocket</span>
        </Link>
        <Button asChild>
          <Link href="/build">Get Started</Link>
        </Button>
      </header>
      <main className="flex-1">
        <div className="container flex h-full max-w-4xl flex-col items-center justify-center text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create Your Perfect Resume
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Build a professional resume in minutes.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/build">Start Building Now</Link>
          </Button>
        </div>
      </main>
      <footer className="flex h-12 items-center justify-center border-t">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeRocket. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
