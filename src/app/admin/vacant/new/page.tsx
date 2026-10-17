"use client";

import ClientOnly from '@/components/ClientOnly';
import { VacantPropertyForm } from '@/components/vacant';

export default function NewVacantProperty() {
  return (
    <>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading property form...</p>
          </div>
        }
      >
        <NewVacantPropertyContent />
      </ClientOnly>
    </>
  );
}

function NewVacantPropertyContent() {
  // Use the API endpoint with HTTP-only cookie authentication
  const handleSubmit = async (payload: Record<string, any>) => {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create property');
    }
  };

  return (
    <VacantPropertyForm
      title="Vacant Inventory"
      submitLabel="Save Property"
      onSubmit={handleSubmit}
    />
  );
}
