'use client';

import AdminLayout from '../../components/AdminLayout';
import { UserDetails } from '@/components/admin/UserDetails';
import { useParams, useRouter } from 'next/navigation';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const handleClose = () => {
    router.push('/admin/users');
  };

  return (
    <AdminLayout>
      <div className="relative">
        <UserDetails userId={userId} onClose={handleClose} />
      </div>
    </AdminLayout>
  );
}