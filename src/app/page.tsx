import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-2xl font-bold text-primary">
        <Rocket className="h-8 w-8" />
        <h1 className="font-headline">ResumeRocket</h1>
      </div>
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Rocket className="h-8 w-8" />
          </div>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Build Your Professional Resume in 5 Minutes.
          </h2>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-8 text-lg text-muted-foreground">
            Simple input forms. Instant PDF download.
          </p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/build">Start Building Now</Link>
          </Button>
        </CardContent>
      </Card>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ResumeRocket. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
