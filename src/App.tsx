/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { I18nProvider } from './hooks/useI18n';
import { ToastProvider } from './components/common/Toast';
import { LearnerLayout } from './layouts/LearnerLayout';
import { SchoolLayout } from './layouts/SchoolLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Learner Pages
import { HomePage } from './pages/learner/HomePage';
import { SchoolDetailPage } from './pages/learner/SchoolDetailPage';
import { CheckoutPage } from './pages/learner/CheckoutPage';
import { BookingSuccessPage } from './pages/learner/BookingSuccessPage';
import { MyBookingsPage } from './pages/learner/MyBookingsPage';
import { ProfilePage } from './pages/learner/ProfilePage';
import { NotificationsPage } from './pages/learner/NotificationsPage';
import { LoginPage } from './pages/auth/LoginPage';

// School & Admin Portals
import { SchoolDashboardPage } from './pages/school/SchoolDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Route guard for role protection
const ProtectedRoute: React.FC<{
  allowedRoles: ('learner' | 'school_admin' | 'admin')[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If learner tries to go to admin/school, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ========================================================
          1. LEARNER MARKETPLACE PORTAL
          ======================================================== */}
      <Route
        path="/"
        element={
          <LearnerLayout>
            <HomePage />
          </LearnerLayout>
        }
      />
      <Route
        path="/school-detail/:id"
        element={
          <LearnerLayout>
            <SchoolDetailPage />
          </LearnerLayout>
        }
      />
      <Route
        path="/checkout/:bookingId"
        element={
          <LearnerLayout>
            <CheckoutPage />
          </LearnerLayout>
        }
      />
      <Route
        path="/booking-success/:bookingId"
        element={
          <LearnerLayout>
            <BookingSuccessPage />
          </LearnerLayout>
        }
      />
      <Route
        path="/bookings"
        element={
          <LearnerLayout>
            <MyBookingsPage />
          </LearnerLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <LearnerLayout>
            <ProfilePage />
          </LearnerLayout>
        }
      />
      <Route
        path="/notifications"
        element={
          <LearnerLayout>
            <NotificationsPage />
          </LearnerLayout>
        }
      />
      <Route
        path="/login"
        element={
          <LearnerLayout>
            <LoginPage />
          </LearnerLayout>
        }
      />

      {/* ========================================================
          2. DRIVING SCHOOL OWNER PORTAL (PARTNER HUB)
          ======================================================== */}
      <Route
        path="/school/*"
        element={
          <ProtectedRoute allowedRoles={['school_admin', 'admin']}>
            <SchoolLayout>
              <SchoolDashboardPage />
            </SchoolLayout>
          </ProtectedRoute>
        }
      />

      {/* ========================================================
          3. SUPER ADMIN CENTRAL OPERATIONS CONSOLE
          ======================================================== */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to Learner Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
