'use client';

import { useAuthContext } from '@/components/auth/AuthProvider';
import { DashboardLayout } from './DashboardLayout';
import { DashboardContent } from './DashboardContent';
import { LoadingSpinner } from './LoadingSpinner';

export function UserDashboard() {
  const { user, isLoading: authLoading } = useAuthContext();

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