
"use client";

import React, { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { ResumeData } from './types';
import { initialResumeData } from './defaults';
import { defaultsDeep } from './utils';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: Dispatch<SetStateAction<ResumeData>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isInitialized, setIsInitialized] = useState(false);

  const safeSetResumeData: typeof setResumeData = (value) => {
    if (typeof value === 'function') {
      setResumeData(value);
    } else {
      setResumeData(value);
    }
    setIsInitialized(true);
  };

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData: safeSetResumeData }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
