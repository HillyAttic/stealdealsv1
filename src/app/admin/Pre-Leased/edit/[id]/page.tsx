import AdminLayout from '../../../components/AdminLayout';
import PropertyEditForm from './PropertyEditForm';

// Server Component
export default async function EditPreLeasedPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <AdminLayout>
      <PropertyEditForm propertyId={resolvedParams.id} />
    </AdminLayout>
  );
} 