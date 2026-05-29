/**
 * Error Boundary Component
 * Production-ready error boundary for catching and displaying errors
 */

'use client';

import React, { ReactNode, Component, ErrorInfo } from 'react';
import { useToastNotifications } from '../ui/toast';

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component (Class-based)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR BOUNDARY] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-5xl text-red-600 mb-4">⚠</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error.message}</p>

            <details className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-700">
              <summary className="font-semibold cursor-pointer">Error details</summary>
              <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap break-words">
                {this.state.error.stack}
              </pre>
            </details>

            <button
              onClick={this.reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary wrapper component for specific sections
 */
export function SectionErrorBoundary({
  children,
  sectionName,
}: {
  children: ReactNode;
  sectionName: string;
}) {
  const toast = useToastNotifications();

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-red-900">Error loading {sectionName}</h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
            <button
              onClick={() => {
                reset();
                toast.success('Retrying...');
              }}
              className="text-red-600 hover:text-red-900 font-semibold text-sm whitespace-nowrap ml-4"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
