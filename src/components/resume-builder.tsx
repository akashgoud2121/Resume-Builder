
"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Printer } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function ResumeBuilder() {
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-secondary">
      <header className="no-print flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <span className="font-headline text-xl font-bold">Resume Builder</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
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
      <div className="flex-1 md:grid md:grid-cols-10 md:gap-8 overflow-hidden">
        <aside className="md:col-span-6 h-full overflow-y-auto p-4 md:p-8 no-print no-scrollbar">
          <ResumeForm />
        </aside>
        <main id="resume-preview-container" className="hidden md:col-span-4 md:block h-full bg-secondary overflow-y-auto print:!block">
          <div className="flex flex-col items-center py-8 sticky top-0">
            <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
            <ResumePreview ref={resumePreviewRef} />
          </div>
        </main>
      </div>
    </div>
  );
}
