'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardContent } from './DashboardContent';
import { LoadingSpinner } from './LoadingSpinner';

export function UserDashboard() {
  const { user, loading } = useAuth();
  const authLoading = loading;

  // Show loading state
  if (authLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  // Show dashboard content - pass user directly as userProfile
  return (
    <DashboardLayout>
      <DashboardContent userProfile={user} />
    </DashboardLayout>
  );
}