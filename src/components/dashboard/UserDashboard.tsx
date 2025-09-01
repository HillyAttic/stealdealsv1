'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { DashboardLayout } from './DashboardLayout';
import { DashboardContent } from './DashboardContent';
import { LoadingSpinner } from './LoadingSpinner';

export function UserDashboard() {
  const { isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const authLoading = !isLoaded || !userLoaded;

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