
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, Settings } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useResume } from '@/lib/store';
import { initialResumeData } from '@/lib/defaults';
import { useUser } from '@/firebase/auth/use-user';

export function ResumeBuilder() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { setResumeData } = useResume();
  const { user } = useUser();

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleDownloadPdf = () => {
    alert("Your browser's print dialog will now open. Please choose 'Save as PDF' as the destination to download your resume.");
    window.print();
  };


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

  return (
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b-2 px-4 md:px-6 sticky top-0 z-30 bg-background">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold">Resume Builder</span>
            </Link>
          </div>
          
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
              Welcome, {user.displayName || 'User'}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4">
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
