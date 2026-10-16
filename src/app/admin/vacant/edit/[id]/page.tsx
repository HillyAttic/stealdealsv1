"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import ClientOnly from '@/components/ClientOnly';
import {
  VacantPropertyForm,
  propertyToVacantForm,
  VacantFormValues,
} from '@/components/vacant';

export default function EditVacantProperty() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <span className="ml-2">Loading property editor...</span>
          </div>
        }
      >
        <EditVacantPropertyContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function EditVacantPropertyContent() {
  const params = useParams();
  const propertyId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<VacantFormValues | null>(null);
  const [error, setError] = useState('');

  // Load property data - auth is handled by AdminLayout
  useEffect(() => {
    if (!propertyId) {
      setError('Property ID is missing');
      setIsLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        console.log(`Fetching property via API: ${propertyId}`);

        const response = await fetch(`/api/properties/${propertyId}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const { property: propertyData } = await response.json();
          setInitialValues(propertyToVacantForm(propertyData));
          console.log(`Property loaded via API: ${propertyId}`);
        } else if (response.status === 404) {
          setError(`Property with ID "${propertyId}" not found in database`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || `Failed to load property (${response.status})`);
        }
      } catch (err: any) {
        console.error('Error loading property via API:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Only the form's own fields are sent — PUT merges, so untouched keys stay as they are
  const handleSubmit = async (payload: Record<string, any>) => {
    console.log(`Updating property via API: ${propertyId}`);

    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Update failed (${response.status})`);
    }
    console.log('Property updated successfully via API:', result);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        {error || 'Property not found.'}
      </div>
    );
  }

  return (
    <VacantPropertyForm
      title="Edit Vacant Property"
      submitLabel="Save Changes"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
