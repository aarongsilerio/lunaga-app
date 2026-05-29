'use client';

/**
 * Doctor Dashboard
 * 
 * Professional portal for healthcare providers.
 * 
 * Features:
 * - Role-based access (DOCTOR only)
 * - Secure logout functionality
 * - Welcome message with doctor info
 * - Quick action buttons
 * - Consultation statistics (placeholder)
 * - Schedule management placeholder
 * 
 * Security:
 * - ProtectedRoute wrapper enforces authentication
 * - Role validation on component mount
 * - Automatic redirect for unauthorized access
 * - Secure token management
 */

import { ProtectedRoute } from '@/lib/components/ProtectedRoute';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';

function DoctorDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/doctor/login');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/nav-logo.png" alt="Lunága Logo" className="h-10 rounded-lg mx-auto" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#1E3A5F]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#1E3A5F] mb-2">
            Welcome, Doctor
          </h1>
          <p className="text-gray-600">
            Manage your consultations and connect with patients
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Consultations */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#6FAEE7]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Consultations</p>
                <p className="text-3xl font-bold text-[#1E3A5F] mt-2">0</p>
              </div>
              <span className="text-3xl">📅</span>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#8ED8C3]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-[#1E3A5F] mt-2">0</p>
              </div>
              <span className="text-3xl">⏰</span>
            </div>
          </div>

          {/* Patients */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-[#C6B7FF]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-[#1E3A5F] mt-2">0</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">📆</div>
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Manage Schedule</h3>
            <p className="text-gray-600 text-sm">Set your availability and consultation hours</p>
          </button>

          <button className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">View Consultations</h3>
            <p className="text-gray-600 text-sm">Review upcoming consultations and patient history</p>
          </button>

          <button className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Profile Settings</h3>
            <p className="text-gray-600 text-sm">Update specialization and professional information</p>
          </button>

          <button className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Messages</h3>
            <p className="text-gray-600 text-sm">Communicate with patients between consultations</p>
          </button>
        </div>

        {/* Implementation Note */}
        <div className="bg-blue-50 border border-[#6FAEE7] rounded-2xl p-6">
          <p className="text-[#1E3A5F] font-medium mb-2">🚀 Coming Soon</p>
          <p className="text-gray-600 text-sm">
            Full consultation management, video consultation rooms, and patient communication tools 
            are currently in development.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="DOCTOR">
      <DoctorDashboardContent />
    </ProtectedRoute>
  );
}
