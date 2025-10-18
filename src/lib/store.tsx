
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
  const [isClient, setIsClient] = useState(false);

  // This effect runs once on the client to indicate it has mounted.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect loads data from localStorage once the client has mounted.
  useEffect(() => {
    if (isClient) {
      try {
        const storedData = localStorage.getItem('resumeData');
        if (storedData) {
          let parsedData = JSON.parse(storedData);
          
          // Backwards compatibility check for skills data structure
          if (typeof parsedData.skills === 'string' || !Array.isArray(parsedData.skills)) {
            // If old format is detected, reset skills to the new default structure
            parsedData.skills = initialResumeData.skills;
          }

          // Deep merge parsed data with initial data to ensure all fields are present
          setResumeData(defaultsDeep(parsedData, initialResumeData));
        }
      } catch (error) {
        console.error("Failed to parse resume data from localStorage", error);
        // Stick with initialResumeData if parsing fails
      }
    }
  }, [isClient]);

  // This effect saves data to localStorage whenever it changes.
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
      } catch (error) {
        console.error("Failed to save resume data to localStorage", error);
      }
    }
  }, [resumeData, isClient]);

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
