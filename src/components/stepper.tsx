
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';

interface StepperProps {
  steps: { id: string; name: string }[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  onAddSection?: () => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function Stepper({ steps, currentStep, onStepClick, onAddSection, onDeleteSection }: StepperProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to active step when it changes
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.children[currentStep * 2] as HTMLElement; // *2 because of connectors
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep]);

  return (
    <div className="w-full bg-muted/20 rounded-lg p-2 sm:p-3 border">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar px-1 sm:px-2 py-2"
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="relative flex flex-col items-center text-center cursor-pointer group min-w-[60px] sm:min-w-[70px] flex-shrink-0">
                <div
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                    isActive ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110" : 
                    isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                    "border-muted-foreground/50 bg-background text-muted-foreground/80 group-hover:border-primary group-hover:scale-105"
                  )}
                >
                  <span className="font-semibold text-xs">{index + 1}</span>
                </div>
                <p 
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                    isActive ? "text-primary font-semibold" : isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {step.name}
                </p>
                {/* Delete button for custom sections */}
                {step.id.startsWith('custom-') && onDeleteSection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${step.name}" section?`)) {
                        onDeleteSection(step.id);
                      }
                    }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
                    title="Delete section"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-shrink-0 h-0.5 w-3 sm:w-4 transition-colors",
                  isCompleted || isActive ? "bg-primary" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
        
        {/* Add Custom Section Button */}
        {onAddSection && (
          <>
            <div className="flex-shrink-0 h-0.5 w-3 sm:w-4 bg-border" />
            <div
              onClick={onAddSection}
              className="flex flex-col items-center text-center cursor-pointer group min-w-[60px] sm:min-w-[70px] flex-shrink-0"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 bg-background text-muted-foreground/80 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-200 group-hover:scale-105">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                Add Section
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
