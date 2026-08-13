"use client";

import { useState, useEffect } from 'react';
import { firestoreDb } from '@/lib/firestore';
import { collection, getDocs } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';

export default function TestPage() {
  const [collectionInfo, setCollectionInfo] = useState({
    properties: { exists: false, count: 0, sample: null as any }
  });
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);

  useEffect(() => {
    async function checkCollections() {
      try {
        setLoading(true);

        // Check properties collection
        const propertiesCol = collection(firestoreDb, 'properties');
        const propertiesSnap = await getDocs(propertiesCol);
        const propertiesExists = !propertiesSnap.empty;
        const propertiesCount = propertiesSnap.size;
        const propertiesSample = propertiesSnap.docs.length > 0
          ? propertiesSnap.docs[0].data()
          : null;

        setCollectionInfo({
          properties: {
            exists: propertiesExists,
            count: propertiesCount,
            sample: propertiesSample
          }
        });
      } catch (error) {
        console.error("Error checking collections:", error);
      } finally {
        setLoading(false);
      }
    }

    checkCollections();
  }, []);

  // Function to create a test franchise
  const createTestFranchise = async () => {
    try {
      const testFranchise = {
        name: "Test Franchise " + new Date().toISOString(),
        industry: "Food & Beverage",
        investment: 500000,
        location: "Test Location",
        status: "Available",
        roi: "15%",
        description: "This is a test franchise",
        requirements: "Area: 500-1000 sq.ft.",
        image: "https://images.pexels.com/photos/7697438/pexels-photo-7697438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const response = await fetch('/api/franchises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testFranchise)
      });

      const result = await response.json();
      alert(response.ok ? "Franchise created successfully!" : "Error: " + (result.error || "Unknown error"));

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating test franchise:", error);
      alert("Error creating test franchise: " + error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Firestore Collection Test</h1>

        {loading ? (
          <div className="bg-blue-50 p-4 rounded">Loading collection data...</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">properties (Firestore)</h2>
                <span className={`px-2 py-1 text-sm rounded ${collectionInfo.properties.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {collectionInfo.properties.exists ? 'Exists' : 'Does not exist'}
                </span>
              </div>

              {collectionInfo.properties.exists ? (
                <>
                  <div className="mt-2">
                    <span className="font-medium">Items count:</span> {collectionInfo.properties.count}
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Sample item:</span>
                    <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-auto max-h-40 rounded">
                      {JSON.stringify(collectionInfo.properties.sample, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="mt-2 text-gray-500">No data available</div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Create Test Data</h2>
              <button
                onClick={createTestFranchise}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Test Franchise
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Franchise Migration</h2>
              <p className="text-sm text-gray-600 mb-4">
                Note: The legacy franchise migration endpoints have been deprecated.
                All franchise data is now managed through Firestore.
              </p>
              {migrationStatus && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">Migration Status:</h3>
                  <pre className="text-sm">{JSON.stringify(migrationStatus, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
