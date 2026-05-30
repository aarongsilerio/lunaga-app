/**
 * Toast/Notification System
 * Production-ready toast notifications with auto-dismiss and persistence
 */

'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';

/**
 * Toast notification types and positioning
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading',
}

export enum ToastPosition {
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
  BOTTOM_RIGHT = 'bottom-right',
}

/**
 * Toast notification model
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, undefined = persistent
  action?: {
    label: string;
    handler: () => void | Promise<void>;
  };
  onClose?: () => void;
}

/**
 * Toast context and provider
 */
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000, // Default 4 seconds
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration if specified
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Toast Display Component
 * Renders toasts in corners of the screen
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return '✓';
      case ToastType.ERROR:
        return '✕';
      case ToastType.WARNING:
        return '⚠';
      case ToastType.LOADING:
        return '⋯';
      default:
        return 'ⓘ';
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-900';
      case ToastType.ERROR:
        return 'bg-red-50 border-red-200 text-red-900';
      case ToastType.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case ToastType.LOADING:
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getIconStyles = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return 'text-green-600';
      case ToastType.ERROR:
        return 'text-red-600';
      case ToastType.WARNING:
        return 'text-yellow-600';
      case ToastType.LOADING:
        return 'text-blue-600 animate-pulse';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Right - Default position */}
      <div className="absolute top-4 right-4 pointer-events-auto flex flex-col gap-3 max-w-md">
        {toasts
          .filter((t) => [ToastPosition.TOP_RIGHT, undefined].includes(t as any))
          .map((toast) => (
            <div
              key={toast.id}
              className={`flex gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full duration-300 ${getToastStyles(toast.type)}`}
            >
              <div className={`shrink-0 text-lg font-bold ${getIconStyles(toast.type)}`}>
                {getToastIcon(toast.type)}
              </div>

              <div className="flex-1">
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                <div className="text-sm">{toast.message}</div>
              </div>

              <div className="flex gap-2 items-start">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.handler();
                      removeToast(toast.id);
                    }}
                    className="font-semibold hover:underline text-sm whitespace-nowrap"
                  >
                    {toast.action.label}
                  </button>
                )}

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 hover:opacity-50 text-lg"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * Convenience hooks for specific toast types
 */
export function useToastNotifications() {
  const { addToast } = useToast();

  return {
    success: (message: string, title?: string, duration?: number) =>
      addToast({
        type: ToastType.SUCCESS,
        message,
        title,
        duration: duration ?? 3000,
      }),

    error: (message: string, title?: string, action?: { label: string; handler: () => void }) =>
      addToast({
        type: ToastType.ERROR,
        message,
        title: title ?? 'Error',
        duration: 6000,
        action,
      }),

    warning: (message: string, title?: string, duration?: number) =>
      addToast({
        type: ToastType.WARNING,
        message,
        title,
        duration: duration ?? 5000,
      }),

    info: (message: string, title?: string, duration?: number) =>
      addToast({
        type: ToastType.INFO,
        message,
        title,
        duration: duration ?? 4000,
      }),

    loading: (message: string, title?: string) =>
      addToast({
        type: ToastType.LOADING,
        message,
        title,
        duration: 0, // Persistent until manually closed
      }),
  };
}
