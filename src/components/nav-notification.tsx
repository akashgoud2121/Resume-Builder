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
    success: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground border-blue-300/50 dark:from-blue-500/20 dark:to-purple-500/20 dark:border-blue-500/30',
    error: 'bg-gradient-to-r from-red-500/10 to-orange-500/10 text-foreground border-red-300/50 dark:from-red-500/20 dark:to-orange-500/20 dark:border-red-500/30',
    warning: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-foreground border-yellow-300/50 dark:from-yellow-500/20 dark:to-amber-500/20 dark:border-yellow-500/30',
    info: 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-foreground border-cyan-300/50 dark:from-cyan-500/20 dark:to-blue-500/20 dark:border-cyan-500/30',
  };

  const iconColors = {
    success: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-sm text-sm backdrop-blur-sm',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        colors[notification.type]
      )}
    >
      <div className={cn('shrink-0', iconColors[notification.type])}>
        {icons[notification.type]}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-sm">{notification.title}</span>
        {notification.description && (
          <span className="text-xs opacity-75 mt-0.5">{notification.description}</span>
        )}
      </div>
      <button
        onClick={hideNotification}
        className="ml-2 shrink-0 hover:opacity-70 transition-opacity opacity-60"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

