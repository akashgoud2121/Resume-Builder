
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('google-ai-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('google-ai-api-key', apiKey);
    toast({
      title: 'API Key Saved',
      description: 'Your Google AI API key has been saved.',
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">ResumeRocket</span>
        </Link>
        <div className="flex items-center gap-4">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Provide your own Google AI API key to use the AI features. This key is stored only in your browser.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="api-key-home">Google AI API Key</Label>
                <Input
                  id="api-key-home"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>
              <Button onClick={handleSaveApiKey}>Save Key</Button>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/build">Get Started</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-4xl text-center">
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
