
"use client";

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    if (!elementToCapture) return;

    setIsDownloading(true);
    toast({
      title: "Generating PDF...",
      description: "This may take a moment. Please wait.",
    });

    try {
        const canvas = await html2canvas(elementToCapture, {
            scale: 2,
            useCORS: true,
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        const a4WidthPt = 595.28;
        const a4HeightPt = 841.89;
        const marginPt = 72; // 1 inch = 72 points

        const contentWidthPt = a4WidthPt - (marginPt * 2);
        const contentHeightPt = a4HeightPt - (marginPt * 2);
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        const imgHeightPt = contentWidthPt / canvasAspectRatio;

        let position = 0;
        let pages = 0;
        const totalPages = Math.ceil(imgHeightPt / contentHeightPt);

        while (position < imgHeightPt) {
            if (pages > 0) {
              pdf.addPage();
            }
            
            pdf.addImage(
                imgData,
                'PNG',
                marginPt, // Left margin
                position === 0 ? marginPt : -position + marginPt, // Top margin for first page, then adjust
                contentWidthPt,
                imgHeightPt
            );

            position += contentHeightPt;
            pages++;
            
            // This is a safeguard against an infinite loop.
            if (pages > 20) {
                console.error("Too many pages generated, aborting PDF creation.");
                break;
            }
        }
        
        // This is a workaround for a jsPDF bug where adding a new page
        // doesn't correctly handle the subsequent positioning on the first page
        // if the content spans more than one page. We delete the incorrect first page
        // and create it again correctly.
        if (totalPages > 1) {
          const tempPdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
          });

          position = 0;
          for (let i = 0; i < totalPages; i++) {
            if (i > 0) {
              tempPdf.addPage();
            }
            tempPdf.addImage(
              imgData, 'PNG', 
              marginPt, // x
              -position + marginPt, // y
              contentWidthPt, 
              imgHeightPt
            );
            position += contentHeightPt;
          }
          tempPdf.save('resume.pdf');

        } else {
          pdf.save('resume.pdf');
        }


    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            title: "Download Failed",
            description: "An error occurred while generating the PDF.",
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