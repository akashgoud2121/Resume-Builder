
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, Settings, User, Edit, Loader2, LogOut, Cloud, Save, CheckCircle } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useResume } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { debounce } from '@/lib/debounce';
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
} from "@/components/ui/dropdown-menu";

export function ResumeBuilder() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { resumeData, setResumeData } = useResume();
  const { user, signOut: handleSignOut } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user ? 'authenticated' : null;

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

  const handleDownloadPdf = () => {
    alert("Your browser's print dialog will now open. Please choose 'Save as PDF' as the destination to download your resume.");
    window.print();
  };

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
      // Save resume before logging out
      if (token && resumeData) {
        console.log('Saving resume before logout...');
        await performAutoSave();
      }
      
      // Clear resume ID from session on logout
      sessionStorage.removeItem('currentResumeId');
      setResumeId(null);
      
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

  // Load user's resume from cloud
  const handleLoadFromCloud = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/resumes');
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      
      const { resumes } = await response.json();
      
      if (resumes && resumes.length > 0) {
        const latestResume = resumes[0];
        setResumeId(latestResume.id);
        sessionStorage.setItem('currentResumeId', latestResume.id);
        
        const detailResponse = await fetch(`/api/resumes/${latestResume.id}`);
        if (detailResponse.ok) {
          const { resume } = await detailResponse.json();
          if (resume.data && typeof resume.data === 'object') {
            setResumeData(resume.data);
          }
        }
      }
    } catch (error: any) {
      // Silently fail - user can still work with local data
    }
  }, [token, setResumeData]);

  // Restore resume ID from sessionStorage on mount
  useEffect(() => {
    const storedResumeId = sessionStorage.getItem('currentResumeId');
    if (storedResumeId && token) {
      setResumeId(storedResumeId);
    }
  }, [token]);

  // Save resume to cloud (with subtle indicator instead of toast)
  const handleSaveToCloud = async () => {
    if (!token) {
      showNotification({
        title: 'Not Authenticated',
        description: 'Please log in to save your resume to the cloud.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    setShowSavedIndicator(false);
    
    try {
      let response;
      
      if (resumeId) {
        response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: resumeData,
          }),
        });
      } else {
        response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: resumeData,
          }),
        });
        
        if (response.ok) {
          const { resume } = await response.json();
          setResumeId(resume.id);
          sessionStorage.setItem('currentResumeId', resume.id);
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      setShowSavedIndicator(true);
      setTimeout(() => {
        setShowSavedIndicator(false);
      }, 3000);
      
    } catch (error: any) {
      showNotification({
        title: 'Save Failed',
        description: error.message || 'Could not save your resume.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Core save logic for autosave (without toast)
  const performAutoSave = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsSaving(true);

    try {
      let response;
      let currentResumeId = resumeId;

      if (!currentResumeId) {
        const storedId = sessionStorage.getItem('currentResumeId');
        if (storedId && storedId.trim()) {
          currentResumeId = storedId;
          setResumeId(storedId);
        }
      }

      if (!currentResumeId) {
        const checkResponse = await fetch('/api/resumes');
        if (checkResponse.ok) {
          const { resumes } = await checkResponse.json();
          if (resumes && resumes.length > 0) {
            const existingId = resumes[0].id;
            if (existingId) {
              currentResumeId = existingId;
              setResumeId(existingId);
              sessionStorage.setItem('currentResumeId', existingId);
            }
          }
        }
      }
      
      if (currentResumeId) {
        response = await fetch(`/api/resumes/${currentResumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: resumeData,
          }),
        });
      } else {
        response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: resumeData,
          }),
        });
        
        if (response.ok) {
          const { resume } = await response.json();
          setResumeId(resume.id);
          sessionStorage.setItem('currentResumeId', resume.id);
        }
      }
    } catch (error) {
      // Silently fail
    } finally {
      setIsSaving(false);
    }
  }, [token, resumeId, resumeData, setResumeId]);

  // Load user's resume when component mounts (auto-load on login)
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (token && !hasLoadedRef.current) {
      handleLoadFromCloud();
      hasLoadedRef.current = true;
    }
    
    if (!token) {
      hasLoadedRef.current = false;
    }
  }, [token, handleLoadFromCloud]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (token && resumeData) {
        performAutoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token, resumeData, performAutoSave]);

  // Multi-browser sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Disabled for now
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, handleLoadFromCloud]);

  return (
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b-2 px-4 md:px-6 sticky top-0 z-30 bg-background">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <img 
                src="/images/cognisys-logo.svg" 
                alt="Cognisys AI Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="font-headline text-xl font-bold">Resume Builder</span>
            </Link>
          </div>

          {/* Notification indicator in nav */}
          <NavNotification />
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Save button with indicator */}
            {token && (
              <Button
                onClick={handleSaveToCloud}
                variant="ghost"
                className="hidden md:flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : showSavedIndicator ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className={showSavedIndicator ? "text-green-500" : ""}>
                  {isSaving ? "Saving..." : showSavedIndicator ? "Saved!" : "Save"}
                </span>
              </Button>
            )}

            {user && (
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
                                  <Label htmlFor="displayName-builder">Display Name</Label>
                                  <Input
                                      id="displayName-builder"
                                      value={displayName}
                                      onChange={(e) => setDisplayName(e.target.value)}
                                  />
                              </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email-builder">Email</Label>
                                  <Input id="email-builder" value={user.email || ''} disabled />
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
            )}

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
                        <Label htmlFor="apiKey-builder">Your Google AI API Key</Label>
                        <Input 
                            id="apiKey-builder" 
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

            <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Eye className="h-5 w-5" />
                    <span className="sr-only">View Resume</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[95vh] bg-muted/40 p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Live Resume Preview</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-1 justify-center overflow-auto p-4">
                     <div className="w-fit" style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                        <ResumePreview />
                     </div>
                  </div>
                </SheetContent>
              </Sheet>
               <Button variant="outline" size="icon" onClick={handleDownloadPdf}>
                <Download className="h-5 w-5" />
                <span className="sr-only">Download PDF</span>
              </Button>
            </div>

            <Button onClick={handleDownloadPdf} className="hidden md:flex">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </header>

        <div className="grid flex-1 md:grid-cols-2 overflow-hidden">
            <div className="overflow-y-auto p-4 md:p-6 no-scrollbar">
                <ResumeForm />
            </div>

            <main id="resume-preview-container" className="hidden md:block bg-muted/30 overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center py-8 h-full">
                <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
                <div id="resume-preview-wrapper" className="origin-top" style={{ transform: 'scale(0.75)' }}>
                    <ResumePreview />
                </div>
              </div>
            </main>
        </div>
      </div>
  );
}

    