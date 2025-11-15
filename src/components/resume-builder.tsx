
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, Settings, User, Edit, Loader2, LogOut, Cloud, Save, CheckCircle, Undo2, Redo2 } from 'lucide-react';
import { ResumeForm } from './resume-form';
import { ResumePreview } from './resume-preview';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useResume } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/debounce';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotification } from '@/lib/notification-context';
import { NavNotification } from '@/components/nav-notification';
import { clearEncryptionKey } from '@/lib/encryption';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ResumeBuilder() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [showExtensionWarning, setShowExtensionWarning] = useState(false);
  const { showNotification } = useNotification();
  const { resumeData, setResumeData, undo, redo, canUndo, canRedo } = useResume();
  const { user, signOut: handleSignOut } = useAuth();
  const router = useRouter();
  const token = user ? 'authenticated' : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedKey = localStorage.getItem('userApiKey');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, []);
  
  useEffect(() => {
    if (user?.name) {
        setDisplayName(user.name);
    }
  }, [user]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          showNotification({
            title: 'Undo',
            description: 'Action undone successfully.',
            type: 'info',
          });
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for Redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          redo();
          showNotification({
            title: 'Redo',
            description: 'Action redone successfully.',
            type: 'info',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, showNotification]);

  // Validate resume data before allowing PDF download
  const validateResumeForDownload = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check required contact fields
    if (!resumeData.contact.name?.trim()) {
      errors.push('Full Name is required');
    }
    if (!resumeData.contact.email?.trim()) {
      errors.push('Email is required');
    }
    if (!resumeData.contact.phone?.trim()) {
      errors.push('Phone is required');
    }
    if (!resumeData.contact.location?.trim()) {
      errors.push('Location is required');
    }
    
    // Check summary
    if (!resumeData.summary?.trim()) {
      errors.push('Summary is required');
    }
    
    // Check at least one education entry
    const hasValidEducation = resumeData.education.some(edu => 
      edu.school?.trim() && edu.degree?.trim() && edu.startDate?.trim() && edu.endDate?.trim() && edu.city?.trim()
    );
    if (!hasValidEducation) {
      errors.push('At least one complete Education entry is required');
    }
    
    // Check other links - if any link exists, both label and URL must be filled
    const incompleteLinks = resumeData.contact.otherLinks.filter(link => 
      (link.label?.trim() && !link.url?.trim()) || (!link.label?.trim() && link.url?.trim())
    );
    if (incompleteLinks.length > 0) {
      errors.push('All Other Links must have both Label and URL filled');
    }
    
    // Validate LinkedIn URL if provided
    if (resumeData.contact.linkedin?.trim()) {
      const linkedinPattern = /^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[\w-]+|linkedin\.com\/company\/[\w-]+)\/?$/i;
      if (!linkedinPattern.test(resumeData.contact.linkedin.trim())) {
        errors.push('LinkedIn URL must be in valid format (e.g., linkedin.com/in/johndoe or https://linkedin.com/in/johndoe)');
      }
    }
    
    // Validate GitHub URL if provided
    if (resumeData.contact.github?.trim()) {
      const githubPattern = /^(https?:\/\/)?(www\.)?(github\.com\/[\w-]+)\/?$/i;
      if (!githubPattern.test(resumeData.contact.github.trim())) {
        errors.push('GitHub URL must be in valid format (e.g., github.com/johndoe or https://github.com/johndoe)');
      }
    }
    
    // URL validation patterns (reusable)
    const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    const localPattern = /^(https?:\/\/)?(localhost|[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})(:\d+)?([\/\w \.-]*)*\/?$/i;
    
    // Validate project links
    const invalidProjectLinks = resumeData.projects.filter(proj => 
      proj.link?.trim() && !urlPattern.test(proj.link.trim()) && !localPattern.test(proj.link.trim())
    );
    if (invalidProjectLinks.length > 0) {
      errors.push('All Project Links must have valid URL format (e.g., example.com or https://example.com)');
    }
    
    // Validate certification links
    const invalidCertLinks = resumeData.certifications.filter(cert => 
      cert.link?.trim() && !urlPattern.test(cert.link.trim()) && !localPattern.test(cert.link.trim())
    );
    if (invalidCertLinks.length > 0) {
      errors.push('All Certification Links must have valid URL format (e.g., example.com or https://example.com)');
    }
    
    // Validate achievement links
    const invalidAchievementLinks = resumeData.achievements.filter(ach => 
      ach.link?.trim() && !urlPattern.test(ach.link.trim()) && !localPattern.test(ach.link.trim())
    );
    if (invalidAchievementLinks.length > 0) {
      errors.push('All Achievement Links must have valid URL format (e.g., example.com or https://example.com)');
    }
    
    // Validate URL format for other links
    const invalidUrls = resumeData.contact.otherLinks.filter(link => 
      link.url?.trim() && !urlPattern.test(link.url.trim()) && !localPattern.test(link.url.trim())
    );
    if (invalidUrls.length > 0) {
      errors.push('All Other Links must have valid URL format (e.g., example.com or https://example.com)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleDownloadPdf = () => {
    // Validate resume data first
    const validation = validateResumeForDownload();
    
    if (!validation.isValid) {
      showNotification({
        title: 'Validation Error',
        description: validation.errors.join('. ') + '. Please complete all required fields before downloading.',
        type: 'error',
      });
      return;
    }
    
    // Check for common browser extensions that might interfere
    const hasExtensions = document.querySelector('grammarly-extension, [data-lastpass-icon-root], com-1password-button, [data-dashlane-root]');
    
    if (hasExtensions) {
      setShowExtensionWarning(true);
    } else {
      window.print();
    }
  };

  const proceedWithDownload = () => {
    // Re-validate before proceeding (in case data changed)
    const validation = validateResumeForDownload();
    
    if (!validation.isValid) {
      showNotification({
        title: 'Validation Error',
        description: validation.errors.join('. ') + '. Please complete all required fields before downloading.',
        type: 'error',
      });
      setShowExtensionWarning(false);
      return;
    }
    
    setShowExtensionWarning(false);
    window.print();
  };

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('userApiKey', apiKey);
    }
    setIsSettingsOpen(false);
    showNotification({
      title: "API Key Saved",
      description: "Your Google AI API key has been saved locally.",
      type: "success",
    });
    // User is already on build page, no redirect needed
  };
  
  const handleRemoveApiKey = () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('userApiKey');
    }
    setApiKey('');
    setIsSettingsOpen(false);
    showNotification({
      title: "API Key Removed",
      description: "Your Google AI API key has been removed.",
      type: "error",
    });
  }

  const handleLogout = async () => {
    try {
      // Save resume before logging out (if user is authenticated and has data)
      if (token && resumeData) {
        try {
          // Wait for any ongoing save to complete first
          if (isSavingRef.current) {
            // Wait up to 2 seconds for ongoing save to complete
            let waitCount = 0;
            while (isSavingRef.current && waitCount < 20) {
              await new Promise(resolve => setTimeout(resolve, 100));
              waitCount++;
            }
          }
          
          // Perform save before logout
          await performAutoSave();
          
          // Give a brief moment to ensure save completes
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (saveError: any) {
          // Silently fail - don't block logout
        }
      }
      
      // Clear resume ID from session on logout
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('currentResumeId');
      }
      setResumeId(null);
      
      // Clear encryption key and local storage for security
      clearEncryptionKey();
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('resumeData');
      }
      
      await handleSignOut();
      showNotification({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        type: 'success',
      });
    } catch (error: any) {
      showNotification({
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred.',
        type: 'error',
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user || !displayName.trim()) {
        showNotification({
            title: 'Validation Error',
            description: 'Display name cannot be empty.',
            type: 'error',
        });
        return;
    }
    setIsUpdatingProfile(true);
    try {
        // Profile update would require API endpoint - simplified for now
        showNotification({
            title: 'Profile Update',
            description: 'Profile update feature will be available soon.',
            type: 'info',
        });
        setIsProfileOpen(false);
    } catch (error: any) {
        showNotification({
            title: 'Update Failed',
            description: error.message || 'Could not update your profile.',
            type: 'error',
        });
    } finally {
        setIsUpdatingProfile(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      showNotification({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
        type: 'error',
      });
      return;
    }

    if (password !== confirmPassword) {
      showNotification({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        type: 'error',
      });
      return;
    }

    setIsSettingPassword(true);
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      showNotification({
        title: 'Password Set',
        description: 'You can now login with email/password.',
        type: 'success',
      });

      setPassword('');
      setConfirmPassword('');
      setHasPassword(true);
    } catch (error: any) {
      showNotification({
        title: 'Failed to Set Password',
        description: error.message || 'Could not set password.',
        type: 'error',
      });
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Check if user has password when profile opens
  useEffect(() => {
    if (isProfileOpen && user) {
      // We'll check this by trying to set password - API will tell us if password exists
      // For now, we'll show the option and let API handle it
      setHasPassword(null); // Unknown until we check
    }
  }, [isProfileOpen, user]);

  // Helper function to save resume ID to both storages
  const saveResumeId = useCallback((id: string) => {
    // Validate that id is a string and looks like a valid MongoDB ObjectId
    if (!id || typeof id !== 'string' || id.trim().length !== 24) {
      return;
    }
    
    setResumeId(id);
    if (typeof window !== 'undefined') {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('currentResumeId', id);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('currentResumeId', id);
      }
    }
  }, []);

  // Helper function to check for existing resume with retry logic
  const checkForExistingResume = useCallback(async (retries = 3): Promise<string | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/api/resumes');
        if (response.ok) {
          const { resumes } = await response.json();
          if (resumes && resumes.length > 0) {
            return resumes[0].id; // Return latest resume ID
          }
          return null; // No resumes found
        }
      } catch (error) {
        // If not last retry, wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }
    }
    return null; // Failed after all retries
  }, []);

  // Helper function to validate resume ID format (MongoDB ObjectId is 24 hex characters)
  const isValidResumeId = useCallback((id: string | null): boolean => {
    if (!id || typeof id !== 'string') return false;
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    // Also reject if it looks like JSON (starts with { or [)
    if (id.trim().startsWith('{') || id.trim().startsWith('[')) return false;
    return /^[0-9a-fA-F]{24}$/.test(id.trim());
  }, []);

  // Helper function to clean invalid data from storage
  const cleanInvalidResumeId = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionId = sessionStorage.getItem('currentResumeId');
      const localId = localStorage.getItem('currentResumeId');
      
      // If stored value is JSON (user object) or invalid format, remove it
      if (sessionId && !isValidResumeId(sessionId)) {
        sessionStorage.removeItem('currentResumeId');
      }
      
      if (localId && !isValidResumeId(localId)) {
        localStorage.removeItem('currentResumeId');
      }
    } catch {
      // Silently ignore errors
    }
  }, [isValidResumeId]);

  // Load user's resume from cloud
  const handleLoadFromCloud = useCallback(async () => {
    if (!token) {
      return;
    }
    
    // Don't load if user is actively editing (prevents overwriting unsaved changes)
    if (isUserEditingRef.current) {
      // User is editing, skip load to prevent data loss
      // Will retry later when user stops editing
      return;
    }
    
    try {
      const resumeId = await checkForExistingResume();
      
      if (resumeId) {
        saveResumeId(resumeId);
        
        // Load full resume data
        const detailResponse = await fetch(`/api/resumes/${resumeId}`);
        if (detailResponse.ok) {
          const { resume } = await detailResponse.json();
          if (resume && resume.data && typeof resume.data === 'object') {
            // Double-check before setting data (race condition protection)
            // Only update if user is not actively editing
            if (!isUserEditingRef.current) {
              setResumeData(resume.data);
              // Update last saved data ref to prevent unnecessary saves
              lastSavedDataRef.current = JSON.stringify(resume.data);
              // Silently load - no notification needed for successful background operation
            }
          } else {
            // Only show notification for errors/invalid data
            showNotification({
              title: 'Load Warning',
              description: 'Resume found but data is invalid. Starting with empty resume.',
              type: 'warning',
            });
          }
        } else if (detailResponse.status === 404) {
          // Resume not found, clear the ID
          setResumeId(null);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('currentResumeId');
            localStorage.removeItem('currentResumeId');
          }
        } else {
          showNotification({
            title: 'Load Failed',
            description: `Could not load resume (${detailResponse.status}). Please try again.`,
            type: 'error',
          });
        }
      }
    } catch (error: any) {
      showNotification({
        title: 'Load Failed',
        description: 'Could not load resume from cloud. Please refresh the page or check your connection.',
        type: 'error',
      });
    }
  }, [token, setResumeData, checkForExistingResume, saveResumeId, setResumeId, showNotification]);

  // Restore resume ID from storage on mount (check multiple sources)
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      // First, clean any invalid data
      cleanInvalidResumeId();
      
      // 1. Check sessionStorage first (current session)
      const sessionId = sessionStorage.getItem('currentResumeId');
      if (sessionId && isValidResumeId(sessionId)) {
        setResumeId(sessionId.trim());
        return;
      }
      
      // 2. Check localStorage (persistent across sessions)
      const localId = localStorage.getItem('currentResumeId');
      if (localId && isValidResumeId(localId)) {
        const validId = localId.trim();
        setResumeId(validId);
        // Also save to sessionStorage for current session
        sessionStorage.setItem('currentResumeId', validId);
        return;
      }
      
      // 3. If no valid ID found, load from cloud (will set ID if resume exists)
      // This is handled by handleLoadFromCloud which is called separately
    }
  }, [token, cleanInvalidResumeId, isValidResumeId]);

  // Clean up empty sections before saving
  const cleanResumeData = (data: any) => {
    const cleanedCustomSections: Record<string, any> = {};
    
    if (data.customSections) {
      Object.entries(data.customSections).forEach(([id, section]: [string, any]) => {
        const cleanedItems = section.items?.filter((item: any) => item.content?.trim()) || [];
        if (cleanedItems.length > 0) {
          cleanedCustomSections[id] = {
            ...section,
            items: cleanedItems
          };
        }
      });
    }
    
    // Remove 'other' field completely (no longer used)
    const { other, ...cleanedData } = data;
    
    return {
      ...cleanedData,
      // Clean up empty custom section items
      customSections: cleanedCustomSections
    };
  };

  // Save resume to cloud (manual save button)
  const handleSaveToCloud = async () => {
    if (!token) {
      showNotification({
        title: 'Not Authenticated',
        description: 'Please log in to save your resume to the cloud.',
        type: 'error',
      });
      return;
    }

    // Validate that data is not empty
    if (isEmptyResumeData(resumeData)) {
      showNotification({
        title: 'Cannot Save',
        description: 'Please add some content to your resume before saving.',
        type: 'warning',
      });
      return;
    }

    // Use the same performAutoSave function for consistency
    const success = await performAutoSave(0, true);
    
    if (!success) {
      // Error notification is already shown in performAutoSave if max retries reached
      // But show immediate feedback for manual save
      if (saveStatus !== 'error') {
        showNotification({
          title: 'Save In Progress',
          description: 'Saving resume to cloud...',
          type: 'info',
        });
      }
    }
  };

  // Check if resume data is empty (just defaults)
  const isEmptyResumeData = useCallback((data: any): boolean => {
    if (!data) return true;
    
    // Check if contact info is empty
    const hasContactInfo = data.contact?.name?.trim() || 
                          data.contact?.email?.trim() || 
                          data.contact?.phone?.trim();
    
    // Check if there's any meaningful content
    const hasContent = hasContactInfo ||
                      data.summary?.trim() ||
                      (data.education && data.education.length > 0) ||
                      (data.experience && data.experience.length > 0) ||
                      (data.projects && data.projects.length > 0) ||
                      (data.skills && data.skills.length > 0) ||
                      (data.certifications && data.certifications.length > 0) ||
                      (data.achievements && data.achievements.length > 0) ||
                      (data.customSections && Object.keys(data.customSections).length > 0);
    
    return !hasContent;
  }, []);

  // Core save logic for autosave (with retry mechanism)
  const performAutoSave = useCallback(async (retryCount = 0, isImmediate = false): Promise<boolean> => {
    if (!token) {
      return false;
    }

    // If already saving and not an immediate save, queue the save
    if (isSavingRef.current && !isImmediate) {
      pendingSaveRef.current = { data: resumeData, retries: 0 };
      return false;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveError(null);

    try {
      let response;
      let currentResumeId = resumeId;

      // Step 1: Try to get resumeId from storage (multiple sources)
      if (!currentResumeId && typeof window !== 'undefined') {
        const sessionId = sessionStorage.getItem('currentResumeId');
        const localId = localStorage.getItem('currentResumeId');
        
        // Validate that stored values are valid resume IDs (not user objects)
        if (sessionId && isValidResumeId(sessionId)) {
          currentResumeId = sessionId.trim();
        } else if (localId && isValidResumeId(localId)) {
          currentResumeId = localId.trim();
        } else {
          // Clean invalid data (user objects, invalid formats, etc.)
          if (sessionId && !isValidResumeId(sessionId)) {
            sessionStorage.removeItem('currentResumeId');
          }
          if (localId && !isValidResumeId(localId)) {
            localStorage.removeItem('currentResumeId');
          }
          currentResumeId = null;
        }
        
        if (currentResumeId) {
          setResumeId(currentResumeId);
        }
      }

      // Step 2: If still no ID, check API with retry logic
      if (!currentResumeId) {
        currentResumeId = await checkForExistingResume();
        if (currentResumeId) {
          saveResumeId(currentResumeId);
        }
      }
      
      // Step 3: Validate that data is not empty before saving
      if (isEmptyResumeData(resumeData)) {
        // Don't save empty data - this prevents overwriting existing data with empty values
        isSavingRef.current = false;
        setIsSaving(false);
        setSaveStatus('idle');
        return false;
      }
      
      // Step 4: Clean data before saving
      const cleanedData = cleanResumeData(resumeData);
      
      // Step 5: Use upsert endpoint (handles both create and update, prevents duplicates)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        response = await fetch('/api/resumes/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: cleanedData,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Save timeout - request took too long');
        }
        throw fetchError;
      }
      
      if (response.ok) {
        const { resume, isUpdate } = await response.json();
        // Always save the resume ID (in case it was created or we didn't have it)
        saveResumeId(resume.id);
        
        // Reset retry count on success
        saveRetryCountRef.current = 0;
        pendingSaveRef.current = null;
        
        // Update save status
        setSaveStatus('saved');
        setShowSavedIndicator(true);
        setTimeout(() => {
          setShowSavedIndicator(false);
          setSaveStatus('idle');
        }, 3000);
        
        return true;
      } else if (response.status === 404 && currentResumeId) {
        // Resume was deleted, clear ID (next save will create new one)
        setResumeId(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentResumeId');
          localStorage.removeItem('currentResumeId');
        }
        // Don't retry for 404 - let next autosave attempt handle it
        setSaveStatus('error');
        setSaveError('Resume not found. Will create new one on next save.');
        return false;
      } else {
        // Other errors - might be retryable
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Save failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save resume';
      saveRetryCountRef.current = retryCount;
      
      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && !isImmediate) {
        const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        
        // Queue retry
        pendingSaveRef.current = { data: resumeData, retries: retryCount + 1 };
        
        setTimeout(() => {
          if (pendingSaveRef.current) {
            performAutoSave(retryCount + 1, false);
          }
        }, delay);
        
        // Don't update status yet - will retry
        return false;
      } else {
        // Max retries reached or immediate save failed
        setSaveStatus('error');
        setSaveError(errorMessage);
        saveRetryCountRef.current = 0;
        pendingSaveRef.current = null;
        
        // Show notification for persistent errors
        if (retryCount >= MAX_RETRIES) {
          showNotification({
            title: 'Save Failed',
            description: `Could not save resume after ${MAX_RETRIES} attempts. ${errorMessage}`,
            type: 'error',
          });
        }
        
        return false;
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [token, resumeId, resumeData, setResumeId, checkForExistingResume, saveResumeId, isValidResumeId, showNotification, isEmptyResumeData]);

  // Load user's resume when component mounts (auto-load on login)
  const hasLoadedRef = useRef<string | null>(null); // Track which user's data was loaded
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storeInitializedRef = useRef(false);
  const isUserEditingRef = useRef(false); // Track if user is actively editing (prevents overwrite)
  const lastUserActionRef = useRef<number>(0); // Track last user action timestamp
  
  // Wait for store to be initialized before loading from cloud
  useEffect(() => {
    // Check if store is initialized by checking if resumeData has been set
    // This is a workaround since we don't have direct access to isInitialized
    if (resumeData && Object.keys(resumeData).length > 0) {
      storeInitializedRef.current = true;
    }
  }, [resumeData]);
  
  // Track user editing activity to prevent data overwrite
  useEffect(() => {
    // Mark as editing when resumeData changes (user is actively editing)
    if (resumeData && !isEmptyResumeData(resumeData)) {
      isUserEditingRef.current = true;
      lastUserActionRef.current = Date.now();
      
      // Reset editing flag after 10 seconds of inactivity
      const timeoutId = setTimeout(() => {
        // Only reset if no recent activity (more than 10 seconds ago)
        if (Date.now() - lastUserActionRef.current > 10000) {
          isUserEditingRef.current = false;
        }
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, isEmptyResumeData]);
  
  useEffect(() => {
    // Clear any pending timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    if (token && user?.id) {
      // Check if we need to load (new user or not loaded yet)
      const needsLoad = hasLoadedRef.current !== user.id;
      
        if (needsLoad) {
        // Wait for store to be initialized, then load from cloud
        // Use a longer delay and check store initialization
        const attemptLoad = () => {
          // Don't load if user is actively editing (prevents overwrite)
          if (isUserEditingRef.current) {
            // User is editing, delay load to prevent overwrite
            loadingTimeoutRef.current = setTimeout(attemptLoad, 5000);
            return;
          }
          
          if (storeInitializedRef.current) {
            handleLoadFromCloud();
            hasLoadedRef.current = user.id; // Mark as loaded for this user
          } else {
            // Store not initialized yet, try again after a short delay
            loadingTimeoutRef.current = setTimeout(attemptLoad, 200);
          }
        };
        
        // Start attempting to load after initial delay
        loadingTimeoutRef.current = setTimeout(attemptLoad, 500);
      }
    }
    
    if (!token) {
      hasLoadedRef.current = null; // Reset when logged out
      storeInitializedRef.current = false; // Reset store initialization flag
      isUserEditingRef.current = false; // Reset editing flag
      // Clear resume data when logged out
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentResumeId');
        localStorage.removeItem('currentResumeId');
      }
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [token, user?.id, handleLoadFromCloud]);

  // Track last saved data to prevent unnecessary saves
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const saveRetryCountRef = useRef(0);
  const pendingSaveRef = useRef<{ data: any; retries: number } | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
  const debouncedAutoSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Store refs for values used in debounced function to avoid recreating it
  const resumeDataRef = useRef(resumeData);
  const tokenRef = useRef(token);
  const performAutoSaveRef = useRef(performAutoSave);
  
  // Update refs when values change
  resumeDataRef.current = resumeData;
  tokenRef.current = token;
  performAutoSaveRef.current = performAutoSave;

  // Create debounced function once on mount, using refs for latest values
  useEffect(() => {
    // Only create debounced function if token exists
    if (!tokenRef.current) {
      return;
    }

    debouncedAutoSaveRef.current = debounce(() => {
      const currentData = resumeDataRef.current;
      const currentToken = tokenRef.current;
      const currentPerformAutoSave = performAutoSaveRef.current;
      
      if (currentToken && currentData && !isSavingRef.current) {
        // Skip saving if data is empty (just defaults)
        if (isEmptyResumeData(currentData)) {
          return;
        }
        
        // Only save if data actually changed
        const currentDataString = JSON.stringify(currentData);
        if (currentDataString !== lastSavedDataRef.current) {
          lastSavedDataRef.current = currentDataString;
          currentPerformAutoSave();
        }
      }
    }, 8000); // Increased to 8 seconds for better debouncing - reduces API calls significantly

    return () => {
      // Cleanup: cancel pending debounced calls
      if (debouncedAutoSaveRef.current && typeof debouncedAutoSaveRef.current.cancel === 'function') {
        debouncedAutoSaveRef.current.cancel();
      }
    };
  }, [token, isEmptyResumeData]); // Only recreate when token changes, not when resumeData changes

  // Trigger autosave when resume data changes
  useEffect(() => {
    if (token && resumeData && !isSavingRef.current) {
      // Skip saving if data is empty
      if (isEmptyResumeData(resumeData)) {
        return;
      }
      
      // Only trigger if debounced function exists and token is available
      if (debouncedAutoSaveRef.current && token) {
        debouncedAutoSaveRef.current();
      }
    }
  }, [resumeData, token, isEmptyResumeData]);

  // Listen for force-save events (e.g., when clicking Next button or after AI generation)
  useEffect(() => {
    const handleForceSave = () => {
      if (token && resumeData && !isSavingRef.current) {
        // Skip saving if data is empty
        if (isEmptyResumeData(resumeData)) {
          return;
        }
        
        // Cancel any pending debounced autosave to prevent duplicate saves
        if (debouncedAutoSaveRef.current && typeof debouncedAutoSaveRef.current.cancel === 'function') {
          debouncedAutoSaveRef.current.cancel();
        }
        // Update last saved data ref to prevent duplicate saves
        const currentData = JSON.stringify(resumeData);
        lastSavedDataRef.current = currentData;
        
        // Mark as user editing to prevent data overwrite during save
        isUserEditingRef.current = true;
        lastUserActionRef.current = Date.now();
        
        performAutoSave(0, true).then((success) => {
          // After save completes, reset editing flag after a delay
          if (success) {
            setTimeout(() => {
              isUserEditingRef.current = false;
            }, 2000); // Wait 2 seconds after successful save
          }
        });
      }
    };

    // Handle immediate save after AI generation
    const handleImmediateSave = (event: CustomEvent) => {
      if (token && resumeData && !isSavingRef.current) {
        // Cancel any pending debounced autosave
        if (debouncedAutoSaveRef.current && typeof debouncedAutoSaveRef.current.cancel === 'function') {
          debouncedAutoSaveRef.current.cancel();
        }
        
        // Mark as user editing to prevent data overwrite (CRITICAL: set BEFORE save)
        isUserEditingRef.current = true;
        lastUserActionRef.current = Date.now();
        
        // Update last saved data ref
        const currentData = JSON.stringify(resumeData);
        lastSavedDataRef.current = currentData;
        
        // Immediate save (bypass debounce)
        performAutoSave(0, true).then((success) => {
          if (success) {
            // Wait longer after AI generation save to ensure it completes and prevents overwrite
            // Keep editing flag true for 10 seconds to prevent cloud load from overwriting
            setTimeout(() => {
              // Only reset if no recent activity (double-check)
              const timeSinceLastAction = Date.now() - lastUserActionRef.current;
              if (timeSinceLastAction > 10000) {
                isUserEditingRef.current = false;
              }
            }, 10000); // Wait 10 seconds after successful save from AI generation
          } else {
            // If save failed, keep editing flag true longer to allow retry
            setTimeout(() => {
              isUserEditingRef.current = false;
            }, 30000); // Wait 30 seconds if save failed
          }
        });
      }
    };

    // Handle user editing signal (from AI generation or other actions)
    const handleUserEditing = (event: CustomEvent) => {
      if (event.detail?.isEditing) {
        isUserEditingRef.current = true;
        lastUserActionRef.current = Date.now();
      }
    };

    window.addEventListener('force-save-resume', handleForceSave);
    window.addEventListener('force-save-resume-immediate', handleImmediateSave as EventListener);
    window.addEventListener('user-editing-resume', handleUserEditing as EventListener);
    return () => {
      window.removeEventListener('force-save-resume', handleForceSave);
      window.removeEventListener('force-save-resume-immediate', handleImmediateSave as EventListener);
      window.removeEventListener('user-editing-resume', handleUserEditing as EventListener);
    };
  }, [token, resumeData, performAutoSave, isEmptyResumeData]);

  // Save on page unload with fetch keepalive for reliable save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (token && resumeData) {
        // Cancel any pending debounced save
        if (debouncedAutoSaveRef.current && typeof debouncedAutoSaveRef.current.cancel === 'function') {
          debouncedAutoSaveRef.current.cancel();
        }
        
        // Try to save immediately using fetch with keepalive (reliable for beforeunload)
        try {
          const cleanedData = cleanResumeData(resumeData);
          const dataToSave = JSON.stringify({
            title: `Resume - ${new Date().toLocaleDateString()}`,
            data: cleanedData,
          });
          
          // Use fetch with keepalive flag - allows request to complete after page unload
          // This is more reliable than sendBeacon for JSON data with headers
          const blob = new Blob([dataToSave], { type: 'application/json' });
          const sent = navigator.sendBeacon('/api/resumes/upsert', blob);
          
          if (!sent) {
            // Fallback: try synchronous fetch (limited support)
            // This is a last resort and may not work in all browsers
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/resumes/upsert', false); // synchronous
            xhr.setRequestHeader('Content-Type', 'application/json');
            try {
              xhr.send(dataToSave);
            } catch {
              // Ignore errors in synchronous save
            }
          }
        } catch {
          // Ignore errors - data is already in localStorage
        }
      }
    };

    const handleVisibilityChange = () => {
      // Save when tab becomes hidden (user switches tabs or minimizes)
      if (document.visibilityState === 'hidden' && token && resumeData && !isSavingRef.current && !isEmptyResumeData(resumeData)) {
        // Cancel debounced save and save immediately
        if (debouncedAutoSaveRef.current && typeof debouncedAutoSaveRef.current.cancel === 'function') {
          debouncedAutoSaveRef.current.cancel();
        }
        performAutoSave(0, true); // Immediate save
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, resumeData, resumeId, cleanResumeData, performAutoSave, isEmptyResumeData]);

  // Multi-browser sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Disabled for now
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, handleLoadFromCloud]);

  return (
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b-2 px-4 md:px-6 sticky top-0 z-30 bg-background">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/images/cognisys-logo.svg" 
                alt="Cognisys AI Logo" 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
              />
              <span className="font-headline text-lg sm:text-xl font-bold">Resume Builder</span>
            </Link>
          </div>

          {/* Notification indicator in nav */}
          <NavNotification />
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* Undo/Redo buttons */}
            <div className="hidden sm:flex items-center gap-1 border-r pr-2 md:pr-4">
              <Button
                onClick={undo}
                disabled={!canUndo}
                variant="ghost"
                size="icon"
                title="Undo (Ctrl+Z)"
                className="h-8 w-8"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={redo}
                disabled={!canRedo}
                variant="ghost"
                size="icon"
                title="Redo (Ctrl+Y)"
                className="h-8 w-8"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Save button with status indicator */}
            {token && (
              <TooltipProvider>
                <div className="hidden md:flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSaveToCloud}
                        variant="ghost"
                        className="items-center gap-2"
                        disabled={isSaving || saveStatus === 'saving'}
                      >
                        {saveStatus === 'saving' || isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saveStatus === 'saved' || showSavedIndicator ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : saveStatus === 'error' ? (
                          <Cloud className="h-4 w-4 text-red-500" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span className="hidden lg:inline">
                          {saveStatus === 'saving' || isSaving ? 'Saving...' : 
                           saveStatus === 'saved' || showSavedIndicator ? 'Saved' : 
                           saveStatus === 'error' ? 'Error' : 'Save'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    {saveStatus === 'error' && saveError && (
                      <TooltipContent>
                        <p className="max-w-xs">{saveError}</p>
                      </TooltipContent>
                    )}
                    {(saveStatus === 'saved' || showSavedIndicator) && (
                      <TooltipContent>
                        <p>Resume saved to cloud</p>
                      </TooltipContent>
                    )}
                    {saveStatus === 'saving' && (
                      <TooltipContent>
                        <p>Saving resume to cloud...</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <span>Welcome, {user.name || 'User'}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>My Account</span>
                  </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 focus:bg-transparent cursor-default">
                      <span className='font-semibold'>{user.name}</span>
                      <span className='text-xs text-muted-foreground'>{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                      <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Profile</span>
                          </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                              <DialogDescription>
                                  Update your account information. Click save when you're done.
                              </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <Label htmlFor="displayName-builder">Display Name</Label>
                                  <Input
                                      id="displayName-builder"
                                      value={displayName}
                                      onChange={(e) => setDisplayName(e.target.value)}
                                  />
                              </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email-builder">Email</Label>
                                  <Input id="email-builder" value={user.email || ''} disabled />
                              </div>
                              
                              {/* Password Setup Section - Show if user might be OAuth user */}
                              <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                  <Label htmlFor="password-builder">Set Password (Optional)</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Add a password to login with email/password. You can still use Google login.
                                  </p>
                                  <Input
                                      id="password-builder"
                                      type="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      placeholder="Enter new password (min 6 characters)"
                                  />
                                </div>
                                {password && (
                                  <div className="space-y-2">
                                    <Label htmlFor="confirmPassword-builder">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword-builder"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                    />
                                  </div>
                                )}
                                {password && (
                                  <Button
                                    onClick={handleSetPassword}
                                    disabled={isSettingPassword || password.length < 6 || password !== confirmPassword}
                                    className="w-full"
                                  >
                                    {isSettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Set Password
                                  </Button>
                                )}
                              </div>
                          </div>
                          <DialogFooter>
                              <Button variant="secondary" onClick={() => {
                                setIsProfileOpen(false);
                                setPassword('');
                                setConfirmPassword('');
                              }}>Cancel</Button>
                              <Button onClick={handleProfileUpdate} disabled={isUpdatingProfile}>
                                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Save Changes
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                  </Dialog>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Settings">
                        <Settings className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Generation Settings</DialogTitle>
                        <DialogDescription>
                            To use the AI features, you need a Google AI API key. Your key is stored securely in your browser's local storage and is never sent to our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                       <div className="space-y-2">
                        <Label htmlFor="apiKey-builder">Your Google AI API Key</Label>
                        <Input 
                            id="apiKey-builder" 
                            type="password" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                        />
                       </div>
                       <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-md border">
                          <p className="font-semibold text-foreground">How to get your API key:</p>
                          <ol className="list-decimal list-inside space-y-1">
                              <li>Go to{' '}
                                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                                      Google AI Studio
                                  </a>.
                              </li>
                              <li>Click <span className="font-bold">"Create API key in new project"</span>. It's free.</li>
                              <li>Copy the generated API key.</li>
                              <li>Paste it into the input box above and click "Save".</li>
                          </ol>
                      </div>
                    </div>
                    <DialogFooter className='sm:justify-between pt-4'>
                       <Button variant="destructive" onClick={handleRemoveApiKey} disabled={!apiKey}>
                           Remove Key
                       </Button>
                       <div className="flex gap-2">
                           <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                           <Button onClick={handleSaveApiKey} disabled={!apiKey}>Save</Button>
                       </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Eye className="h-5 w-5" />
                    <span className="sr-only">View Resume</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[95vh] bg-muted/40 p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Live Resume Preview</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-1 justify-center overflow-auto p-4">
                     <div className="w-fit" style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                        <ResumePreview />
                     </div>
                  </div>
                </SheetContent>
              </Sheet>
               <Button variant="outline" size="icon" onClick={handleDownloadPdf}>
                <Download className="h-5 w-5" />
                <span className="sr-only">Download PDF</span>
              </Button>
            </div>

            <Button onClick={handleDownloadPdf} className="hidden md:flex">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </header>

        <div className="grid flex-1 md:grid-cols-2 overflow-hidden">
            <div className="overflow-y-auto p-3 sm:p-4 md:p-6 no-scrollbar no-print resume-form-column">
                <ResumeForm />
            </div>

            <main id="resume-preview-container" className="hidden md:block bg-muted/30 overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center py-6 lg:py-8 h-full">
                <p className="text-sm text-muted-foreground mb-4 font-semibold no-print">Live Preview</p>
                <div id="resume-preview-wrapper" className="origin-top" style={{ transform: 'scale(0.75)' }}>
                    <ResumePreview />
                </div>
              </div>
            </main>
        </div>

        {/* Browser Extension Warning Dialog */}
        <Dialog open={showExtensionWarning} onOpenChange={setShowExtensionWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Browser Extension Detected
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-4">
                <p>
                  We've detected a browser extension (like Grammarly, password manager, etc.) that may appear in your PDF.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-foreground text-sm">For best results:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Temporarily disable browser extensions</li>
                    <li>Refresh the page</li>
                    <li>Download your resume again</li>
                  </ol>
                </div>
                <p className="text-sm">
                  <strong>Or continue anyway:</strong> Our system will automatically attempt to hide extension icons from the PDF.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowExtensionWarning(false)}>
                Cancel
              </Button>
              <Button onClick={proceedWithDownload}>
                Continue Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}

    
    