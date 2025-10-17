
"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Download, Eye, Loader2, Rocket, Printer } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function ResumeBuilder() {
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
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
          <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </header>
      <main className="flex-1 md:grid md:grid-cols-10">
        <div className="md:col-span-6 h-full overflow-y-auto p-4 md:p-6 no-print">
          <ResumeForm />
        </div>
        <div id="resume-preview-container" className="hidden md:col-span-4 md:block h-full bg-muted/40 p-6 overflow-y-auto print:!block">
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
            <ResumePreview ref={resumePreviewRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
