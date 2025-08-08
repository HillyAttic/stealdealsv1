'use client';

import { UserProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileManagement } from '@/components/profile/ProfileManagement';

export default function ProfilePage() {
  return (
    <UserProtectedRoute>
      <ProfileManagement />
    </UserProtectedRoute>
  );
}