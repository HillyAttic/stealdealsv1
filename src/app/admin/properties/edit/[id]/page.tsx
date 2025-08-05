import AdminLayout from '../../../components/AdminLayout';
import EditPropertyForm from './EditPropertyForm';

export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <AdminLayout>
      <EditPropertyForm id={resolvedParams.id} />
    </AdminLayout>
  );
} 