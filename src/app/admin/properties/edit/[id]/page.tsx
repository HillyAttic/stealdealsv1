import AdminLayout from '../../../components/AdminLayout';
import EditPropertyForm from './EditPropertyForm';

export const dynamic = 'force-static';
export const dynamicParams = true;

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <EditPropertyForm id={params.id} />
    </AdminLayout>
  );
} 