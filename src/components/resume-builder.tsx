
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
    const element = resumePreviewRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
        // A4 page dimensions in mm and pixels at 96 DPI
        const a4WidthMM = 210;
        const a4HeightMM = 297;
        const a4WidthPX = (a4WidthMM / 25.4) * 96;
        
        const canvas = await html2canvas(element, {
            scale: 2, // Use a higher scale for better quality
            useCORS: true,
            logging: false,
            width: a4WidthPX,
            windowWidth: a4WidthPX,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = a4WidthMM;
        const pdfHeight = a4HeightMM;
        
        // Calculate the height of the image in the PDF
        const ratio = imgWidth / imgHeight;
        const imgHeightInPdf = pdfWidth / ratio;
        
        let heightLeft = imgHeightInPdf;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content overflows
        while (heightLeft > 0) {
            position = heightLeft - imgHeightInPdf;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;
        }
        
        pdf.save('resume.pdf');
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
                <SheetContent side="bottom" className="h-[90vh]">
                  <SheetHeader>
                    <SheetTitle>Live Resume Preview</SheetTitle>
                  </SheetHeader>
                  <div className="h-full overflow-auto py-4">
                    <div className="w-[210mm] min-h-[297mm] mx-auto shadow-lg bg-background">
                      <ResumePreview />
                    </div>
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

            <main id="resume-preview-container" className="hidden md:block w-full bg-muted/30">
              <div className="flex flex-col items-center py-8 sticky top-[80px] h-[calc(100vh-80px)] overflow-auto">
                <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
                <div id="resume-preview-wrapper" className="w-[210mm] h-auto shadow-lg bg-background rounded-sm">
                    <ResumePreview ref={resumePreviewRef} />
                </div>
              </div>
            </main>
        </div>
      </div>
  );
}
