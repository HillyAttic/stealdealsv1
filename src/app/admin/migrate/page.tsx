"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FaDatabase, FaPlay, FaEye, FaDownload, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface MigrationStats {
  franchises: { existing: number; expected: string };
  plots: { existing: number; expected: string };
  preleased: { existing: number; expected: string };
  vacant: { existing: number; expected: string };
  totalConflicts: number;
}

interface MigrationResult {
  success: boolean;
  message: string;
  stats?: any;
  errors?: string[];
}

export default function MigratePage() {
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Function to analyze the database
  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setMigrationResult(null);
    
    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze database');
      }
      
      const data = await response.json();
      setMigrationStats(data.stats);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis error:', error);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Analysis failed'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to create backup
  const createBackup = async () => {
    setIsBackingUp(true);
    setMigrationResult(null);
    
    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'backup' }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      const data = await response.json();
      setMigrationResult({
        success: true,
        message: `Backup created successfully: ${data.backupFile}`
      });
    } catch (error) {
      console.error('Backup error:', error);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Backup failed'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Function to run dry run migration
  const runDryRun = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      console.log('Starting dry run request...');
      
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'dry-run' }),
        credentials: 'include'
      });
      
      console.log('Dry run response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dry run response error:', errorText);
        
        let errorMessage = 'Failed to run dry run migration';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Dry run completed successfully:', data);
      setMigrationResult(data);
    } catch (error) {
      console.error('Dry run error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Dry run failed'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Function to run actual migration
  const runMigration = async () => {
    if (!confirm('Are you sure you want to run the migration? This will modify your database.')) {
      return;
    }
    
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      console.log('Starting migration request...');
      
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'migrate' }),
        credentials: 'include'
      });
      
      console.log('Migration response status:', response.status);
      console.log('Migration response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Migration response error:', errorText);
        
        let errorMessage = 'Failed to run migration';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Migration completed successfully:', data);
      setMigrationResult(data);
    } catch (error) {
      console.error('Migration error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Function to test admin authentication
  const testAuthentication = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      console.log('Testing admin authentication...');
      
      const response = await fetch('/api/admin/test', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test response error:', errorText);
        
        let errorMessage = 'Authentication test failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Authentication test successful:', data);
      setTestResult(data);
    } catch (error) {
      console.error('Authentication test error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Auto-analyze on component mount
  useEffect(() => {
    analyzeDatabase();
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Migration</h1>
          <p className="text-gray-600">
            Fix ID conflicts where property ID "1" causes wrong properties to show in wishlists
          </p>
        </div>

        {/* Critical Issue Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 mr-3 mt-1" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Critical Database Issue Detected</h3>
              <p className="text-red-700 mb-2">
                Your database has severe ID conflicts where the same ID exists across multiple collections:
              </p>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• <strong>franchiseProperties[1]</strong> = "LITTLE LEADERS"</li>
                <li>• <strong>plots[1]</strong> = "Bird Estate" ← This is what you want in wishlist</li>
                <li>• <strong>preleasedProperties[1]</strong> = "JMD GALLERIA"</li>
                <li>• <strong>vacantProperties[1]</strong> = "DEFENCE COLONY" ← This shows up instead</li>
              </ul>
              <p className="text-red-700 mt-2">
                <strong>Result:</strong> When wishlist references property ID "1", it shows the wrong property!
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {migrationStats && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Database Analysis Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Franchises</h4>
                <p className="text-2xl font-bold text-blue-700">{migrationStats.franchises.existing}</p>
                <p className="text-sm text-blue-600">Next ID: {migrationStats.franchises.expected}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">Plots</h4>
                <p className="text-2xl font-bold text-green-700">{migrationStats.plots.existing}</p>
                <p className="text-sm text-green-600">Next ID: {migrationStats.plots.expected}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900">Pre-leased</h4>
                <p className="text-2xl font-bold text-purple-700">{migrationStats.preleased.existing}</p>
                <p className="text-sm text-purple-600">Next ID: {migrationStats.preleased.expected}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900">Vacant</h4>
                <p className="text-2xl font-bold text-orange-700">{migrationStats.vacant.existing}</p>
                <p className="text-sm text-orange-600">Next ID: {migrationStats.vacant.expected}</p>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">ID Conflicts Detected</h4>
              <p className="text-3xl font-bold text-red-700">{migrationStats.totalConflicts}</p>
              <p className="text-sm text-red-600">Properties with conflicting IDs across collections</p>
            </div>
          </div>
        )}

        {/* Debug Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Debug & Troubleshooting</h3>
          <p className="text-gray-600 mb-4">
            If migration is failing, use this test to check authentication and environment setup.
          </p>
          
          <button
            onClick={testAuthentication}
            disabled={isTesting}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isTesting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Test Authentication
              </>
            )}
          </button>
          
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Authentication Test Passed' : 'Authentication Test Failed'}
              </h4>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Migration Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Analyze Button */}
            <button
              onClick={analyzeDatabase}
              disabled={isAnalyzing}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaEye className="mr-2" />
                  Analyze Database
                </>
              )}
            </button>

            {/* Backup Button */}
            <button
              onClick={createBackup}
              disabled={isBackingUp || !analysisComplete}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBackingUp ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Create Backup
                </>
              )}
            </button>

            {/* Dry Run Button */}
            <button
              onClick={runDryRun}
              disabled={isMigrating || !analysisComplete}
              className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMigrating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <FaEye className="mr-2" />
                  Dry Run
                </>
              )}
            </button>

            {/* Migrate Button */}
            <button
              onClick={runMigration}
              disabled={isMigrating || !analysisComplete}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMigrating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  Run Migration
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Recommended steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>First, click "Analyze Database" to see current state</li>
              <li>Create a backup before making any changes</li>
              <li>Run "Dry Run" to preview what will happen</li>
              <li>Finally, run the actual migration</li>
            </ol>
          </div>
        </div>

        {/* Results Display */}
        {migrationResult && (
          <div className={`border rounded-lg p-6 ${
            migrationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              {migrationResult.success ? (
                <FaCheckCircle className="text-green-500 mr-3 mt-1" size={20} />
              ) : (
                <FaExclamationTriangle className="text-red-500 mr-3 mt-1" size={20} />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  migrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {migrationResult.success ? 'Success!' : 'Error'}
                </h3>
                <p className={migrationResult.success ? 'text-green-700' : 'text-red-700'}>
                  {migrationResult.message}
                </p>
                
                {migrationResult.stats && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Migration Statistics:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(migrationResult.stats, null, 2)}
                    </pre>
                  </div>
                )}
                
                {migrationResult.errors && migrationResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Errors:</h4>
                    <ul className="space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expected Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Expected Results After Migration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-600 mb-3">❌ Before Migration (Current Issues)</h4>
              <ul className="space-y-2 text-sm">
                <li>• franchiseProperties[1] = "LITTLE LEADERS"</li>
                <li>• plots[1] = "Bird Estate" ← What you want</li>
                <li>• preleasedProperties[1] = "JMD GALLERIA"</li>
                <li>• vacantProperties[1] = "DEFENCE COLONY" ← What shows up</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-3">✅ After Migration (Fixed)</h4>
              <ul className="space-y-2 text-sm">
                <li>• PROP_FRAN_002 = "LITTLE LEADERS"</li>
                <li>• PROP_PLOT_001 = "Bird Estate" ← Unique!</li>
                <li>• PROP_PRLS_001 = "JMD GALLERIA"</li>
                <li>• PROP_VCNT_001 = "DEFENCE COLONY"</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold">
              🎯 Result: Wishlist item referencing "Bird Estate" will show the correct property!
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}