'use client';

import AdminLayout from '../../components/AdminLayout';
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <button
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Users
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">User ID: {userId}</p>
            <p className="text-gray-500 mt-2">User details functionality temporarily unavailable</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}