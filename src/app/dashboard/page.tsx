'use client';

import { UserProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export default function DashboardPage() {
  return (
    <UserProtectedRoute>
      <UserDashboard />
    </UserProtectedRoute>
  );
}