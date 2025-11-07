
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: { id: string; name: string }[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg overflow-x-auto no-scrollbar">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => onStepClick(index)}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isActive ? "border-primary bg-primary text-primary-foreground" : 
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                  "border-muted-foreground/50 bg-background text-muted-foreground/80 group-hover:border-primary"
                )}
              >
                <span className="font-semibold">{index + 1}</span>
              </div>
              <p className={cn(
                "mt-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 transition-colors",
                isCompleted || isActive ? "bg-primary" : "bg-border"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
