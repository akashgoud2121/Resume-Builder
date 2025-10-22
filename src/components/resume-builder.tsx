
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, Rocket, Settings } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { generatePdf } from '@/ai/flows/generate-pdf-flow';

export function ResumeBuilder() {
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

 const handleDownloadPdf = async () => {
    const elementToCapture = resumePreviewRef.current;
    if (!elementToCapture) {
      console.error("Resume preview element not found.");
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Generating PDF...",
      description: "This may take a moment. We're creating a high-quality PDF on the server.",
    });

    try {
        // Fetch all stylesheets from the document head
        const styleSheets = Array.from(document.styleSheets)
            .filter(
                (sheet) =>
                    sheet.href &&
                    !sheet.href.startsWith('blob:') && // Exclude blob URLs which can't be fetched
                    sheet.ownerNode instanceof HTMLLinkElement &&
                    (sheet.ownerNode as HTMLLinkElement).rel === 'stylesheet'
            )
            .map((sheet) => sheet.href);
            
        // Create <style> tags from the fetched CSS content
        const styleTags = await Promise.all(
            styleSheets.map(async (href) => {
                try {
                    const response = await fetch(href);
                    if (response.ok) {
                      const cssText = await response.text();
                      return `<style>${cssText}</style>`;
                    }
                    return '';
                } catch (e) {
                    console.warn(`Could not fetch stylesheet: ${href}`, e);
                    return ''; // Return empty string on fetch error
                }
            })
        );
        
        const headContent = styleTags.join('\n');
        const resumeHtml = elementToCapture.innerHTML;
        // Construct a full, self-contained HTML document
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">${headContent}</head><body>${resumeHtml}</body></html>`;
        
        // Call the server-side flow with the complete HTML
        const result = await generatePdf({ htmlContent: fullHtml });
        
        // Trigger the download on the client
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Download Complete!",
            description: "Your PDF has been successfully generated.",
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            title: "Download Failed",
            description: "An error occurred while generating the PDF. Please check the console for more details and try again.",
            variant: "destructive",
        });
    } finally {
        setIsDownloading(false);
    }
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
                <SheetContent side="bottom" className="h-[90vh] bg-muted/30">
                  <SheetHeader>
                    <SheetTitle>Live Resume Preview</SheetTitle>
                  </SheetHeader>
                  <div className="h-full overflow-auto py-4">
                     <ResumePreview />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
              Download PDF
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-[1fr,auto] flex-1">
            <div className="h-full w-full overflow-y-auto p-4 md:p-6 no-scrollbar no-print">
                <ResumeForm />
            </div>

            <main id="resume-preview-container" className="hidden md:block bg-muted/30">
              <div className="flex flex-col items-center py-8 h-[calc(100vh-64px)] overflow-auto no-scrollbar">
                <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
                <div id="resume-preview-wrapper" >
                    <ResumePreview ref={resumePreviewRef} />
                </div>
              </div>
            </main>
        </div>
      </div>
  );
}
