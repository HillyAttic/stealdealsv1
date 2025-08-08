'use client';

import AdminLayout from '../components/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}