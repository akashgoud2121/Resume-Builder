
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, GraduationCap, Settings, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';
import Footer from '@/components/footer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { useAuthActions } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { signOut } = useAuthActions();
  const router = useRouter();


  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('userApiKey', apiKey);
    setIsSettingsOpen(false);
    toast({
      title: "API Key Saved",
      description: "Your Google AI API key has been saved locally.",
    });
  };
  
  const handleRemoveApiKey = () => {
    localStorage.removeItem('userApiKey');
    setApiKey('');
    setIsSettingsOpen(false);
     toast({
      title: "API Key Removed",
      description: "Your Google AI API key has been removed.",
      variant: "destructive"
    });
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Resume Builder</span>
        </Link>
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-block text-sm font-medium">Welcome, {user.displayName || 'User'}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                   <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                      <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Settings">
                              <Settings className="h-5 w-5" />
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>AI Generation Settings</DialogTitle>
                              <DialogDescription>
                                  To use the AI features, you need a Google AI API key. Your key is stored securely in your browser's local storage and is never sent to our servers.
                              </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="apiKey">Your Google AI API Key</Label>
                                <Input 
                                    id="apiKey" 
                                    type="password" 
                                    value={apiKey} 
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your API key"
                                />
                              </div>
                               <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-md border">
                                  <p className="font-semibold text-foreground">How to get your API key:</p>
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Go to{' '}
                                          <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                                              Google AI Studio
                                          </a>.
                                      </li>
                                      <li>Click <span className="font-bold">"Create API key in new project"</span>. It's free.</li>
                                      <li>Copy the generated API key.</li>
                                      <li>Paste it into the input box above and click "Save".</li>
                                  </ol>
                              </div>
                          </div>
                          <DialogFooter className='sm:justify-between pt-4'>
                             <Button variant="destructive" onClick={handleRemoveApiKey} disabled={!apiKey}>
                                 Remove Key
                             </Button>
                             <div className="flex gap-2">
                                 <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                                 <Button onClick={handleSaveApiKey} disabled={!apiKey}>Save</Button>
                             </div>
                          </DialogFooter>
                      </DialogContent>
                  </Dialog>
                  <Button asChild className="rounded-full w-10 h-10 p-0">
                      <Link href="/build" aria-label="Go to builder"><ArrowRight className="h-5 w-5" /></Link>
                  </Button>
                </div>
            ) : (
              <>
                <Button asChild>
                    <Link href="/login">Get Started</Link>
                </Button>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Settings">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>AI Generation Settings</DialogTitle>
                            <DialogDescription>
                                To use the AI features, you need a Google AI API key. Your key is stored securely in your browser's local storage and is never sent to our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                           <div className="space-y-2">
                            <Label htmlFor="apiKey-loggedout">Your Google AI API Key</Label>
                            <Input 
                                id="apiKey-loggedout" 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                            />
                           </div>
                           <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-md border">
                              <p className="font-semibold text-foreground">How to get your API key:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                  <li>Go to{' '}
                                      <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                                          Google AI Studio
                                      </a>.
                                  </li>
                                  <li>Click <span className="font-bold">"Create API key in new project"</span>. It's free.</li>
                                  <li>Copy the generated API key.</li>
                                  <li>Paste it into the input box above and click "Save".</li>
                              </ol>
                          </div>
                        </div>
                        <DialogFooter className='sm:justify-between pt-4'>
                           <Button variant="destructive" onClick={handleRemoveApiKey} disabled={!apiKey}>
                               Remove Key
                           </Button>
                           <div className="flex gap-2">
                               <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                               <Button onClick={handleSaveApiKey} disabled={!apiKey}>Save</Button>
                           </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </>
            )}
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
