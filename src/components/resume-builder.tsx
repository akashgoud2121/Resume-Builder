"use client";

import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Download, Eye, Loader2, Rocket } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function ResumeBuilder() {
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

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
      // Temporarily set the preview to its ideal print size for canvas capture
      const originalStyle = {
        width: input.style.width,
        height: input.style.height,
        transform: input.style.transform,
      };
      input.style.width = `800px`; // A good resolution for A4
      input.style.height = `1120px`; // Maintain A4 aspect ratio
      input.style.transform = 'scale(1)';

      const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      // Revert styles
      input.style.width = originalStyle.width;
      input.style.height = originalStyle.height;
      input.style.transform = originalStyle.transform;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = -pdf.internal.pageSize.getHeight() + (pdfHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
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
        <div className="md:col-span-6 h-full overflow-y-auto p-4 md:p-6 no-print">
          <ResumeForm />
        </div>
        <div id="resume-preview-container" className="hidden md:col-span-4 md:flex h-full flex-col items-center justify-start bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
          <ResumePreview ref={resumePreviewRef} />
        </div>
      </main>
    </div>
  );
}
