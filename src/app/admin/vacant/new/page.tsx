"use client";

import ClientOnly from '@/components/ClientOnly';
import { VacantPropertyForm } from '@/components/vacant';

export default function NewVacantProperty() {
  return (
    <>
      <ClientOnly
        fallback={
          <div data-theme="cobalt" className="cobalt-page">
            <header className="page-head">
              <div>
                <div className="admin-skeleton h-7 w-52 mb-2" />
                <div className="admin-skeleton h-4 w-72" />
              </div>
            </header>
            <div className="panel">
              <div className="admin-skeleton h-64 w-full" />
            </div>
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
