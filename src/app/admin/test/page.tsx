"use client";

import { useState, useEffect } from 'react';
import { database, propertiesRef, vacantPropertiesRef, preleasedPropertiesRef, franchisePropertiesRef } from '@/lib/firebase';
import { get, ref } from 'firebase/database';
import AdminLayout from '../components/AdminLayout';

export default function TestPage() {
  const [collections, setCollections] = useState({
    properties: { exists: false, count: 0, sample: null },
    vacantProperties: { exists: false, count: 0, sample: null },
    preleasedProperties: { exists: false, count: 0, sample: null },
    franchiseProperties: { exists: false, count: 0, sample: null }
  });
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);

  useEffect(() => {
    async function checkAllCollections() {
      try {
        setLoading(true);
        
        // Check regular properties
        const propertiesSnapshot = await get(propertiesRef);
        const propertiesExists = propertiesSnapshot.exists();
        const propertiesCount = propertiesExists ? Object.keys(propertiesSnapshot.val()).length : 0;
        const propertiesSample = propertiesExists ? Object.values(propertiesSnapshot.val())[0] as any : null;
        
        // Check vacant properties
        const vacantSnapshot = await get(vacantPropertiesRef);
        const vacantExists = vacantSnapshot.exists();
        const vacantCount = vacantExists ? Object.keys(vacantSnapshot.val()).length : 0;
        const vacantSample = vacantExists ? Object.values(vacantSnapshot.val())[0] as any : null;
        
        // Check preleased properties
        const preleasedSnapshot = await get(preleasedPropertiesRef);
        const preleasedExists = preleasedSnapshot.exists();
        const preleasedCount = preleasedExists ? Object.keys(preleasedSnapshot.val()).length : 0;
        const preleasedSample = preleasedExists ? Object.values(preleasedSnapshot.val())[0] as any : null;
        
        // Check franchise properties
        const franchiseSnapshot = await get(franchisePropertiesRef);
        const franchiseExists = franchiseSnapshot.exists();
        const franchiseCount = franchiseExists ? Object.keys(franchiseSnapshot.val()).length : 0;
        const franchiseSample = franchiseExists ? Object.values(franchiseSnapshot.val())[0] as any : null;
        
        // Also try checking with a direct path
        const directFranchiseRef = ref(database, 'franchiseProperties');
        const directFranchiseSnapshot = await get(directFranchiseRef);
        const directFranchiseExists = directFranchiseSnapshot.exists();
        
        console.log("Direct franchise check:", directFranchiseExists);
        
        // Check for franchises in the root path
        const rootRef = ref(database, '/');
        const rootSnapshot = await get(rootRef);
        console.log("Root paths:", rootSnapshot.exists() ? Object.keys(rootSnapshot.val()) : "No data");
        
        setCollections({
          properties: { 
            exists: propertiesExists, 
            count: propertiesCount, 
            sample: propertiesSample 
          },
          vacantProperties: { 
            exists: vacantExists, 
            count: vacantCount, 
            sample: vacantSample
          },
          preleasedProperties: { 
            exists: preleasedExists, 
            count: preleasedCount, 
            sample: preleasedSample
          },
          franchiseProperties: { 
            exists: franchiseExists, 
            count: franchiseCount, 
            sample: franchiseSample
          }
        });
      } catch (error) {
        console.error("Error checking collections:", error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAllCollections();
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

  // Function to check migration status
  const checkMigrationStatus = async () => {
    try {
      const response = await fetch('/api/admin/migrate-franchises', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      setMigrationStatus(result);
      
      if (!response.ok) {
        alert("Error checking migration status: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error checking migration status:", error);
      alert("Error checking migration status: " + error);
    }
  };

  // Function to run migration
  const runMigration = async () => {
    if (!confirm("Are you sure you want to run the franchise migration? This will update all franchises missing the product field.")) {
      return;
    }

    try {
      const response = await fetch('/api/admin/migrate-franchises', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Migration completed successfully! Updated ${result.updated} franchises.`);
        setMigrationStatus(result);
        // Refresh the page to see updated data
        window.location.reload();
      } else {
        alert("Migration failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error running migration:", error);
      alert("Error running migration: " + error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Firebase Collection Test</h1>
        
        {loading ? (
          <div className="bg-blue-50 p-4 rounded">Loading collection data...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(collections).map(([name, data]) => (
              <div key={name} className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold">{name}</h2>
                  <span className={`px-2 py-1 text-sm rounded ${data.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {data.exists ? 'Exists' : 'Does not exist'}
                  </span>
                </div>
                
                {data.exists ? (
                  <>
                    <div className="mt-2">
                      <span className="font-medium">Items count:</span> {data.count}
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Sample item:</span>
                      <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-auto max-h-40 rounded">
                        {JSON.stringify(data.sample, null, 2)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-gray-500">No data available</div>
                )}
              </div>
            ))}
            
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
                Fix missing product fields in existing franchises. This will set the product field to the franchise name for any franchises missing this data.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={checkMigrationStatus}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Check Migration Status
                </button>
                <button 
                  onClick={runMigration}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Run Migration
                </button>
              </div>
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