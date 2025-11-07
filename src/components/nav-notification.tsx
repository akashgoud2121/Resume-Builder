'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNotification } from '@/lib/notification-context';
import { cn } from '@/lib/utils';

export function NavNotification() {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        colors[notification.type]
      )}
    >
      {icons[notification.type]}
      <div className="flex flex-col">
        <span className="font-semibold">{notification.title}</span>
        {notification.description && (
          <span className="text-xs opacity-90">{notification.description}</span>
        )}
      </div>
      <button
        onClick={hideNotification}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

