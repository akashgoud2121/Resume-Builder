
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, GraduationCap } from 'lucide-react';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Resume Builder</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/build">Get Started</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="container max-w-4xl">
           <GraduationCap className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Career Journey Starts Here
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Build a standout resume for internships, part-time jobs, and your first career step. It's fast, easy, and completely free.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/build">Create My Resume</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
