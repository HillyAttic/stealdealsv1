"use client";

import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FaPlay, FaCheck, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';

export default function MigratePage() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading migration tools...</p>
          </div>
        }
      >
        <MigrateContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function MigrateContent() {
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Vacant properties migration state
  const [vacantMigrationStatus, setVacantMigrationStatus] = useState<any>(null);
  const [isCheckingVacant, setIsCheckingVacant] = useState(false);
  const [isMigratingVacant, setIsMigratingVacant] = useState(false);

  // Function to check migration status
  const checkMigrationStatus = async () => {
    setIsChecking(true);
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
    } finally {
      setIsChecking(false);
    }
  };

  // Function to run migration
  const runMigration = async () => {
    if (!confirm("Are you sure you want to run the franchise migration? This will update all franchises missing the product field.")) {
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch('/api/admin/migrate-franchises', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Migration completed successfully! Updated ${result.updated} franchises.`);
        setMigrationStatus(result);
        // Check status again to see the updated state
        setTimeout(() => {
          checkMigrationStatus();
        }, 1000);
      } else {
        alert("Migration failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error running migration:", error);
      alert("Error running migration: " + error);
    } finally {
      setIsMigrating(false);
    }
  };

  // Function to check vacant properties migration status
  const checkVacantMigrationStatus = async () => {
    setIsCheckingVacant(true);
    try {
      const response = await fetch('/api/admin/migrate-vacant-properties', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      setVacantMigrationStatus(result);
      
      if (!response.ok) {
        alert("Error checking database cleanup status: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error checking database cleanup status:", error);
      alert("Error checking database cleanup status: " + error);
    } finally {
      setIsCheckingVacant(false);
    }
  };

  // Function to run vacant properties comprehensive cleanup
  const runVacantMigration = async () => {
    if (!confirm("Are you sure you want to run the comprehensive database cleanup? This will permanently remove all unnecessary fields from vacant properties and keep only the 17 required fields. This action cannot be undone.")) {
      return;
    }

    setIsMigratingVacant(true);
    try {
      const response = await fetch('/api/admin/migrate-vacant-properties', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Database cleanup completed successfully! Updated ${result.updated} properties and removed ${result.fieldsRemoved} unnecessary fields.`);
        setVacantMigrationStatus(result);
        // Check status again to see the updated state
        setTimeout(() => {
          checkVacantMigrationStatus();
        }, 1000);
      } else {
        alert("Database cleanup failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error running database cleanup:", error);
      alert("Error running database cleanup: " + error);
    } finally {
      setIsMigratingVacant(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Migration Tools</h1>
        <p className="text-gray-600">
          Fix data inconsistencies across the platform. These tools help maintain data integrity and ensure proper field values.
        </p>
      </div>

      {/* Franchise Migration Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-yellow-500" />
          Franchise Migration Status
        </h2>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={checkMigrationStatus}
            disabled={isChecking}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isChecking ? (
              <FaSync className="mr-2 animate-spin" />
            ) : (
              <FaCheck className="mr-2" />
            )}
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>
          
          <button 
            onClick={runMigration}
            disabled={isMigrating || !migrationStatus}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center"
          >
            {isMigrating ? (
              <FaSync className="mr-2 animate-spin" />
            ) : (
              <FaPlay className="mr-2" />
            )}
            {isMigrating ? 'Migrating...' : 'Run Migration'}
          </button>
        </div>

        {migrationStatus && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Current Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded">
                <div className="text-2xl font-bold text-blue-800">{migrationStatus.total || 0}</div>
                <div className="text-sm text-blue-600">Total Franchises</div>
              </div>
              <div className="bg-red-100 p-3 rounded">
                <div className="text-2xl font-bold text-red-800">{migrationStatus.needsMigration || 0}</div>
                <div className="text-sm text-red-600">Need Migration</div>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <div className="text-2xl font-bold text-green-800">{(migrationStatus.total || 0) - (migrationStatus.needsMigration || 0)}</div>
                <div className="text-sm text-green-600">Already Fixed</div>
              </div>
            </div>
            
            {migrationStatus.needsMigration > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Franchises needing migration:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {migrationStatus.franchises
                    .filter((f: any) => f.needsMigration)
                    .map((franchise: any) => (
                      <div key={franchise.id} className="text-sm text-yellow-700 mb-1">
                        ID {franchise.id}: {franchise.name || 'No Name'} 
                        {franchise.missingName && <span className="text-red-600"> (Missing Name)</span>}
                        {franchise.missingProduct && <span className="text-red-600"> (Missing Product)</span>}
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {migrationStatus.needsMigration === 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="text-green-800 font-semibold">✅ All franchises have product fields set!</div>
                <div className="text-green-600 text-sm mt-1">No migration needed.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Database Cleanup Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-orange-500" />
          Database Schema Cleanup Status
        </h2>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={checkVacantMigrationStatus}
            disabled={isCheckingVacant}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isCheckingVacant ? (
              <FaSync className="mr-2 animate-spin" />
            ) : (
              <FaCheck className="mr-2" />
            )}
            {isCheckingVacant ? 'Checking...' : 'Check Database Status'}
          </button>
          
          <button 
            onClick={runVacantMigration}
            disabled={isMigratingVacant || !vacantMigrationStatus}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center"
          >
            {isMigratingVacant ? (
              <FaSync className="mr-2 animate-spin" />
            ) : (
              <FaPlay className="mr-2" />
            )}
            {isMigratingVacant ? 'Cleaning Database...' : 'Clean Database Schema'}
          </button>
        </div>

        {vacantMigrationStatus && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Database Schema Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded">
                <div className="text-2xl font-bold text-blue-800">{vacantMigrationStatus.total || 0}</div>
                <div className="text-sm text-blue-600">Total Properties</div>
              </div>
              <div className="bg-red-100 p-3 rounded">
                <div className="text-2xl font-bold text-red-800">{vacantMigrationStatus.needsCleanup || 0}</div>
                <div className="text-sm text-red-600">Need Cleanup</div>
              </div>
              <div className="bg-orange-100 p-3 rounded">
                <div className="text-2xl font-bold text-orange-800">{vacantMigrationStatus.totalUnwantedFields || 0}</div>
                <div className="text-sm text-orange-600">Unwanted Fields</div>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <div className="text-2xl font-bold text-green-800">{(vacantMigrationStatus.total || 0) - (vacantMigrationStatus.needsCleanup || 0)}</div>
                <div className="text-sm text-green-600">Schema Clean</div>
              </div>
            </div>
            
            {vacantMigrationStatus.needsCleanup > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Properties needing database cleanup:</h4>
                <div className="mb-3 text-sm text-yellow-700">
                  <strong>Average unwanted fields per property:</strong> {vacantMigrationStatus.averageUnwantedFieldsPerProperty || 0}
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {vacantMigrationStatus.properties
                    .filter((p: any) => p.needsCleanup)
                    .map((property: any) => (
                      <div key={property.id} className="text-sm text-yellow-700 mb-2 border-l-2 border-yellow-400 pl-2">
                        <strong>ID {property.id}:</strong> {property.location || 'No Location'} 
                        <div className="text-xs">
                          <span className="text-red-600">Fields to remove ({property.unwantedFieldsCount}): </span>
                          {property.unwantedFields?.slice(0, 3).join(', ') || 'None'}
                          {property.unwantedFields?.length > 3 && ` +${property.unwantedFields.length - 3} more`}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {vacantMigrationStatus.needsCleanup === 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="text-green-800 font-semibold">✅ Database schema is clean!</div>
                <div className="text-green-600 text-sm mt-1">All properties have only the 17 required fields and show "Vacant" as Property Type.</div>
                <div className="text-green-600 text-xs mt-2">
                  <strong>Required fields:</strong> {vacantMigrationStatus.requiredFields?.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Migration Tools Overview</h2>
        
        {/* Franchise Migration Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Franchise Migration</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
            <li>Click "Check Status" to see which franchises need the product field fixed</li>
            <li>Review the list of franchises that need migration</li>
            <li>Click "Run Migration" to automatically fix all missing product fields</li>
            <li>The migration will set the product field to the franchise name for any missing entries</li>
          </ol>
        </div>
        
        {/* Database Schema Cleanup Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-orange-700 mb-2">Database Schema Cleanup</h3>
          <ol className="list-decimal list-inside space-y-2 text-orange-700 text-sm">
            <li>Click "Check Database Status" to see which properties have unwanted fields</li>
            <li>Review the comprehensive cleanup report showing total unwanted fields</li>
            <li>Click "Clean Database Schema" to permanently remove all unnecessary fields</li>
            <li>This will keep only the 17 required fields and remove everything else (price, askingPrice, subDistrict, etc.)</li>
            <li><strong>WARNING:</strong> This action cannot be undone - backup your data if needed</li>
          </ol>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-100 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Franchise Migration Fixes:</h3>
            <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
              <li>Missing product names on franchise detail pages</li>
              <li>Empty product fields in the database</li>
              <li>Inconsistent product display across franchise listings</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-100 rounded">
            <h3 className="font-semibold text-orange-800 mb-2">Database Schema Cleanup Fixes:</h3>
            <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
              <li>Removes "00" issue caused by corrupted price/askingPrice fields</li>
              <li>Eliminates unwanted subDistrict, title, description fields</li>
              <li>Cleans obsolete advance, ROI, escalation, lockIn fields</li>
              <li>Standardizes schema to 17 required fields only</li>
              <li>Fixes property type consistency across all vacant properties</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}