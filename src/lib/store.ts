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
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('resumeData');
      if (storedData) {
        setResumeData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to parse resume data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
      } catch (error) {
        console.error("Failed to save resume data to localStorage", error);
      }
    }
  }, [resumeData, isLoaded]);

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
