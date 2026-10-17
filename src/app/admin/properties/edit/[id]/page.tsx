import EditPropertyForm from './EditPropertyForm';

export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return <EditPropertyForm id={resolvedParams.id} />;
}