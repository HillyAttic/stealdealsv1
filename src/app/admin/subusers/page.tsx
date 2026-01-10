'use client';

import AdminLayout from '../components/AdminLayout';
import { FirebaseAdminUserManagement } from '@/components/admin/FirebaseAdminUserManagement';

export default function AdminSubusersPage() {
    return (
        <AdminLayout>
            <FirebaseAdminUserManagement />
        </AdminLayout>
    );
}
