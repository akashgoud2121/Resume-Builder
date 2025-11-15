"use client";

import { ResumeBuilder } from '@/components/resume-builder';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/lib/notification-context';

export default function BuildPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if API key exists in localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const apiKey = localStorage.getItem('userApiKey');
      
      if (!apiKey || apiKey.trim() === '') {
        // No API key found, redirect to home page
        showNotification({
          title: 'API Key Required',
          description: 'Please set your Google AI API key in settings before accessing the builder.',
          type: 'warning',
        });
        router.push('/');
        return;
      }
    }
    
    setIsChecking(false);
  }, [router, showNotification]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <ResumeBuilder />;
}
