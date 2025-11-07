
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, GraduationCap, Settings, LogOut, ArrowRight, User, Edit, Loader2 } from 'lucide-react';
import Footer from '@/components/footer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotification } from '@/lib/notification-context';
import { NavNotification } from '@/components/nav-notification';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const { showNotification } = useNotification();
  const { user, signOut: handleSignOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  useEffect(() => {
    if (user?.name) {
        setDisplayName(user.name);
    }
  }, [user]);

  const handleSaveApiKey = () => {
    localStorage.setItem('userApiKey', apiKey);
    setIsSettingsOpen(false);
    showNotification({
      title: "API Key Saved",
      description: "Your Google AI API key has been saved locally.",
      type: "success",
    });
  };
  
  const handleRemoveApiKey = () => {
    localStorage.removeItem('userApiKey');
    setApiKey('');
    setIsSettingsOpen(false);
    showNotification({
      title: "API Key Removed",
      description: "Your Google AI API key has been removed.",
      type: "error",
    });
  }

  const handleLogout = async () => {
    try {
      await handleSignOut();
      showNotification({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        type: 'success',
      });
    } catch (error: any) {
      showNotification({
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred.',
        type: 'error',
      });
    }
  };

  const handleGoToBuilderClick = () => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
        router.push('/build');
    } else {
        setIsSettingsOpen(true);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user || !displayName.trim()) {
        showNotification({
            title: 'Validation Error',
            description: 'Display name cannot be empty.',
            type: 'error',
        });
        return;
    }
    setIsUpdatingProfile(true);
    try {
        // Profile update would require API endpoint - simplified for now
        showNotification({
            title: 'Profile Update',
            description: 'Profile update feature will be available soon.',
            type: 'info',
        });
        setIsProfileOpen(false);
    } catch (error: any) {
        showNotification({
            title: 'Update Failed',
            description: error.message || 'Could not update your profile.',
            type: 'error',
        });
    } finally {
        setIsUpdatingProfile(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <img 
            src="/images/cognisys-logo.svg" 
            alt="Cognisys AI Logo" 
            className="h-8 w-8 object-contain"
          />
          <span className="font-headline text-xl">Resume Builder</span>
        </Link>
        
        {/* Notification indicator in nav */}
        <NavNotification />
        
        <div className="flex items-center gap-4">
            {user ? (
                 <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <span>Welcome, {user.name || 'User'}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>My Account</span>
                      </DropdownMenuLabel>
                       <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex flex-col items-start gap-1 focus:bg-transparent cursor-default">
                          <span className='font-semibold'>{user.name}</span>
                          <span className='text-xs text-muted-foreground'>{user.email}</span>
                      </DropdownMenuItem>
                       <DropdownMenuSeparator />
                        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Profile</span>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your account information. Click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Display Name</Label>
                                        <Input
                                            id="displayName"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={user.email || ''} disabled />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
                                    <Button onClick={handleProfileUpdate} disabled={isUpdatingProfile}>
                                        {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                  
                  <Button onClick={handleGoToBuilderClick} className="rounded-full w-10 h-10 p-0" aria-label="Go to builder">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
            ) : (
              <>
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
                <Button asChild>
                    <Link href="/login">Get Started</Link>
                </Button>
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
          <Button onClick={handleGoToBuilderClick} size="lg" className="mt-8">
            Create My Resume
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    