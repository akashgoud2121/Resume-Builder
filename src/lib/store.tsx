"use client";

import React, { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { ResumeData } from './types';
import { initialResumeData } from './defaults';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: Dispatch<SetStateAction<ResumeData>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    if (typeof window === 'undefined') {
      return initialResumeData;
    }
    try {
      const storedData = localStorage.getItem('resumeData');
      return storedData ? JSON.parse(storedData) : initialResumeData;
    } catch (error) {
      console.error("Failed to parse resume data from localStorage", error);
      return initialResumeData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    } catch (error) {
      console.error("Failed to save resume data to localStorage", error);
    }
  }, [resumeData]);

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData }}>
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
