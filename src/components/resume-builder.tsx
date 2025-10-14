"use client";

import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Download, Eye, Loader2, Rocket, Settings } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function ResumeBuilder() {
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    const storedKey = localStorage.getItem('google-ai-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('google-ai-api-key', apiKey);
    toast({
      title: 'API Key Saved',
      description: 'Your Google AI API key has been saved.',
    });
    setIsSettingsOpen(false);
    // This is a good place to re-initialize the AI client if needed,
    // for this app we pass it on each call.
  };

  const handleDownloadPdf = async () => {
    const input = resumePreviewRef.current;
    if (!input) {
      toast({
        title: "Error",
        description: "Could not find the resume preview to download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const a4_width_mm = 210;
      const a4_height_mm = 297;
      const a4_ratio = a4_height_mm / a4_width_mm;
      
      // We'll render the content in a fixed-width container off-screen to ensure consistency
      const print_container = document.createElement('div');
      print_container.style.position = 'fixed';
      print_container.style.left = '-9999px';
      print_container.style.top = '0';
      print_container.style.width = '800px'; // A standard width for consistent rendering
      print_container.style.background = 'white';
      
      const contentClone = input.cloneNode(true) as HTMLElement;
      contentClone.style.transform = 'none';
      contentClone.style.boxShadow = 'none';
      contentClone.style.borderRadius = '0';
      
      print_container.appendChild(contentClone);
      document.body.appendChild(print_container);

      const canvas = await html2canvas(print_container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: 800,
        windowWidth: 800,
      });
      
      document.body.removeChild(print_container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const pdfRatio = pdfWidth / pdfHeight;
      
      let imgWidth, imgHeight;

      if (ratio > pdfRatio) {
          imgWidth = pdfWidth;
          imgHeight = pdfWidth / ratio;
      } else {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * ratio;
      }
      
      const totalPDFPages = Math.ceil(canvasHeight / (canvasWidth * (pdfHeight / pdfWidth)));
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      const pageHeight = canvas.width * (pdfHeight/pdfWidth);
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeight;

      for (let page = 0; page < totalPDFPages; page++) {
        if (page > 0) pdf.addPage();
        const sourceY = page * pageHeight;
        
        pageCtx?.drawImage(canvas, 0, sourceY, canvas.width, pageHeight, 0, 0, pageCanvas.width, pageCanvas.height);
        
        pdf.addImage(
          pageCanvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          0,
          pdfWidth,
          pdfHeight
        );
      }
      
      pdf.save('resume.pdf');
      toast({
        title: "Success!",
        description: "Your resume has been downloaded.",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Download Failed",
        description: "Something went wrong while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30 no-print">
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
                <Label htmlFor="api-key">Google AI API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>
              <Button onClick={handleSaveApiKey}>Save Key</Button>
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
      <main className="flex-1 md:grid md:grid-cols-10">
        <div className="md:col-span-4 h-full overflow-y-auto p-4 md:p-6 no-print">
          <ResumeForm />
        </div>
        <div id="resume-preview-container" className="hidden md:col-span-6 md:flex h-full flex-col items-center justify-start bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
          <ResumePreview ref={resumePreviewRef} />
        </div>
      </main>
    </div>
  );
}
