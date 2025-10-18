
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Rocket, Settings } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

export function ResumeBuilder() {
  const resumePreviewRef = React.useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handlePrint = () => {
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
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-bold">Resume Builder</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Settings">
                        <Settings className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                        <DialogDescription>
                            Provide your own Google AI API key to use the AI generation features. Your key is stored securely in your browser's local storage and never sent to our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">Google AI API Key</Label>
                        <Input 
                            id="apiKey" 
                            type="password" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                        />
                         <p className="text-xs text-muted-foreground">
                            You can get your free API key from{' '}
                            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                                Google AI Studio
                            </a>.
                        </p>
                    </div>
                    <DialogFooter className='sm:justify-between'>
                       <Button variant="destructive" onClick={handleRemoveApiKey} disabled={!apiKey}>
                           Remove Key
                       </Button>
                       <div className="flex gap-2">
                           <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                           <Button onClick={handleSaveApiKey}>Save</Button>
                       </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Eye className="h-5 w-5" />
                    <span className="sr-only">View Resume</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader>
                    <SheetTitle>Live Resume Preview</SheetTitle>
                  </SheetHeader>
                  <div className="h-full overflow-auto py-4">
                    <ResumePreview ref={resumePreviewRef} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-[1fr,auto] flex-1">
            <div className="h-full w-full overflow-y-auto p-4 md:p-6 no-scrollbar no-print">
                <ResumeForm />
            </div>

            <main id="resume-preview-container" className="hidden md:block w-full print:!block">
              <div className="flex flex-col items-center py-8 sticky top-[80px]">
                <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
                <ResumePreview ref={resumePreviewRef} />
              </div>
            </main>
        </div>
      </div>
  );
}
