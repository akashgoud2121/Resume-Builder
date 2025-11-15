
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import type { ResumeData } from './types';
import { initialResumeData } from './defaults';
import { defaultsDeep } from './utils';
import { encryptData, decryptData } from './encryption';
import { 
  createHistoryState, 
  addToHistory, 
  undo as undoHistory, 
  redo as redoHistory, 
  canUndo as checkCanUndo, 
  canRedo as checkCanRedo,
  type HistoryState 
} from './history';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: Dispatch<SetStateAction<ResumeData>>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryState>(createHistoryState(initialResumeData));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const resumeData = history.present;

  // Load encrypted data from localStorage on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      setIsInitialized(true);
      return;
    }
    
    try {
      const encryptedData = localStorage.getItem('resumeData');
      if (encryptedData) {
        // Check if data looks like encrypted (base64-like) or plain JSON
        const looksLikeEncrypted = /^[A-Za-z0-9+/=]+$/.test(encryptedData) && 
                                   !encryptedData.trim().startsWith('{') && 
                                   !encryptedData.trim().startsWith('[');
        
        if (looksLikeEncrypted) {
          // Try to decrypt (new format)
          const decrypted = decryptData<ResumeData>(encryptedData);
          if (decrypted && typeof decrypted === 'object' && decrypted !== null) {
            // Merge with defaults to ensure all fields exist
            const merged = defaultsDeep(decrypted, initialResumeData);
            setHistory(createHistoryState(merged));
            setIsInitialized(true);
            return;
          }
          // If decryption failed, data is corrupted - clear it
          localStorage.removeItem('resumeData');
        } else {
          // Fallback: try to parse as plain JSON (old format)
          try {
            const trimmed = encryptedData.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              const plainData = JSON.parse(encryptedData);
              if (plainData && typeof plainData === 'object' && plainData !== null) {
                const merged = defaultsDeep(plainData, initialResumeData);
                setHistory(createHistoryState(merged));
                // Re-save as encrypted
                const encrypted = encryptData(merged);
                if (encrypted) {
                  localStorage.setItem('resumeData', encrypted);
                }
                setIsInitialized(true);
                return;
              }
            }
          } catch (parseError) {
            // Silently handle parse errors - data is corrupted
          }
          
          // If all parsing failed, clear corrupted data
          localStorage.removeItem('resumeData');
        }
      }
    } catch (error) {
      // Silently handle errors - clear corrupted data
      try {
        localStorage.removeItem('resumeData');
      } catch {
        // Ignore errors when clearing
      }
    }
    
    // Always set initialized to true, even if data load failed
    setIsInitialized(true);
  }, []);

  // Save encrypted data to localStorage when resumeData changes
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    if (isInitialized && !isUndoRedoAction) {
      try {
        const encrypted = encryptData(resumeData);
        if (encrypted) {
          localStorage.setItem('resumeData', encrypted);
        }
      } catch {
        // Silently fail - don't break the app if storage is unavailable
      }
    }
    // Reset the flag
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
    }
  }, [resumeData, isInitialized, isUndoRedoAction]);

  const setResumeData: Dispatch<SetStateAction<ResumeData>> = useCallback((value) => {
    setHistory((prevHistory) => {
      const newState = typeof value === 'function' ? value(prevHistory.present) : value;
      return addToHistory(prevHistory, newState);
    });
    setIsInitialized(true);
  }, []);

  const undo = useCallback(() => {
    setIsUndoRedoAction(true);
    setHistory((prevHistory) => undoHistory(prevHistory));
  }, []);

  const redo = useCallback(() => {
    setIsUndoRedoAction(true);
    setHistory((prevHistory) => redoHistory(prevHistory));
  }, []);

  const canUndo = checkCanUndo(history);
  const canRedo = checkCanRedo(history);

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, undo, redo, canUndo, canRedo }}>
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
