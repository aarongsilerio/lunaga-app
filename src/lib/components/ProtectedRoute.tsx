'use client';

/**
 * Protected Route Component
 * 
 * Enforces authentication and role-based access control.
 * Redirects unauthorized users to appropriate login pages.
 * 
 * Features:
 * - Authentication enforcement
 * - Role-based access control (PATIENT, DOCTOR, ADMIN)
 * - Automatic redirect to login on unauthorized access
 * - Loading state during auth check
 * - Graceful handling of missing user data
 * 
 * Security:
 * - Frontend gate (UX improvement)
 * - Backend MUST enforce role validation (security critical)
 * - No sensitive data exposed in loading state
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useCurrentUser } from '../auth/hooks';
import { UserRole } from '../auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

/**
 * ProtectedRoute Component
 * - Redirects unauthenticated users to appropriate login page
 * - Optionally validates user role
 * - Shows loading state during auth check
 * 
 * @example
 * export default function DoctorDashboard() {
 *   return (
 *     <ProtectedRoute requiredRole="DOCTOR">
 *       <DoctorContent />
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  /**
   * Determine login redirect URL based on role
   */
  const getLoginRedirect = (userRole?: UserRole | string): string => {
    switch (userRole) {
      case UserRole.DOCTOR:
        return '/doctor/login';
      case UserRole.ADMIN:
        return '/admin/login';
      default:
        return '/login';
    }
  };

  /**
   * Auth state check and redirect logic
   */
  useEffect(() => {
    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(getLoginRedirect());
      return;
    }

    // Check role requirement
    if (requiredRole && user) {
      const normalizedRequiredRole = requiredRole as string;
      const userRoleString = user.role as unknown as string;
      
      if (userRoleString !== normalizedRequiredRole) {
        // Wrong role - redirect to appropriate login
        router.push(getLoginRedirect(userRoleString));
      }
    }
  }, [isAuthenticated, requiredRole, user, router]);

  /**
   * Show loading state during auth check
   */
  if (!isAuthenticated || (requiredRole && user && (user.role as unknown as string) !== (requiredRole as string))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC]">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#6FAEE7] border-t-[#1E3A5F]"></div>
          <p className="mt-4 text-[#1E3A5F] font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
