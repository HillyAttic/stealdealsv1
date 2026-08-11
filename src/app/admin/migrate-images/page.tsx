"use client";

import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  FaImage,
  FaSearch,
  FaPlay,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
  FaRocket,
} from 'react-icons/fa';
import Link from 'next/link';

interface ImgbbImage {
  collection: string;
  propertyId: string;
  field: string;
  url: string;
  path: string;
}

interface MigrationResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    path: string;
    oldUrl: string;
    newUrl: string;
    status: string;
    error?: string;
  }>;
}

export default function MigrateImagesPage() {
  const [images, setImages] = useState<ImgbbImage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [scanSummary, setScanSummary] = useState<{ [collection: string]: number }>({});
  const [error, setError] = useState('');

  // Scan for ImgBB images
  const handleScan = async () => {
    setIsScanning(true);
    setError('');
    setMigrationResult(null);
    setImages([]);

    try {
      const response = await fetch('/api/admin/migrate-images', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to scan for ImgBB images');
      }

      const data = await response.json();
      setImages(data.images || []);
      setScanSummary(data.summary || {});
      setScanComplete(true);
    } catch (err: any) {
      setError(err.message || 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Dry run or actual migration
  const handleMigrate = async (dryRun: boolean) => {
    setIsMigrating(true);
    setIsDryRun(dryRun);
    setError('');
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/migrate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: dryRun ? 'dry-run' : 'migrate',
          images,
        }),
      });

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      const data = await response.json();
      setMigrationResult(data);

      // If actual migration succeeded, re-scan to update the list
      if (!dryRun && data.success) {
        handleScan();
      }
    } catch (err: any) {
      setError(err.message || 'Migration failed');
    } finally {
      setIsMigrating(false);
      setIsDryRun(false);
    }
  };

  // Group images by collection
  const imagesByCollection = images.reduce((acc, img) => {
    if (!acc[img.collection]) acc[img.collection] = [];
    acc[img.collection].push(img);
    return acc;
  }, {} as { [collection: string]: ImgbbImage[] });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/migrate"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Migration
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaImage className="text-2xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ImgBB → Firebase Storage Migration
              </h1>
              <p className="text-gray-600">
                Migrate all existing ImgBB images to your Firebase Storage bucket
              </p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Before You Start</h3>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• Make sure Firebase Storage is enabled in your Firebase Console</li>
                <li>• Set Storage rules to allow authenticated writes (see ImageUploader.md)</li>
                <li>• Existing ImgBB URLs will be replaced with Firebase Storage URLs</li>
                <li>• The scan is read-only — no changes until you click "Migrate"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scan Section */}
        <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaSearch className="text-blue-500" /> Step 1: Scan for ImgBB Images
          </h2>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <FaSpinner className="animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <FaSearch /> Scan All Collections
              </>
            )}
          </button>

          {scanComplete && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <FaCheckCircle />
                <span className="font-medium">
                  Found {images.length} ImgBB image{images.length !== 1 ? 's' : ''}
                </span>
              </div>

              {Object.keys(scanSummary).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">By Collection:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(scanSummary).map(([collection, count]) => (
                      <div key={collection} className="bg-white rounded-md p-3 border">
                        <div className="text-lg font-bold text-purple-600">{count}</div>
                        <div className="text-xs text-gray-500 truncate" title={collection}>
                          {collection}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image List */}
              {images.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Collection</th>
                        <th className="text-left p-2">Property ID</th>
                        <th className="text-left p-2">Field</th>
                        <th className="text-left p-2">ImgBB URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {images.map((img, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="p-2 text-gray-600">
                            {img.collection.split('/').pop()}
                          </td>
                          <td className="p-2 font-mono text-xs">{img.propertyId}</td>
                          <td className="p-2 text-gray-600">{img.field}</td>
                          <td className="p-2 text-xs text-blue-600 truncate max-w-xs" title={img.url}>
                            {img.url}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Migration Section */}
        {scanComplete && images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaRocket className="text-purple-500" /> Step 2: Migrate Images
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() => handleMigrate(true)}
                disabled={isMigrating}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMigrating && isDryRun ? (
                  <>
                    <FaSpinner className="animate-spin" /> Dry Running...
                  </>
                ) : (
                  <>
                    <FaPlay /> Dry Run (Preview)
                  </>
                )}
              </button>

              <button
                onClick={() => handleMigrate(false)}
                disabled={isMigrating}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMigrating && !isDryRun ? (
                  <>
                    <FaSpinner className="animate-spin" /> Migrating...
                  </>
                ) : (
                  <>
                    <FaRocket /> Migrate All Images
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Always run a dry run first to preview what will be migrated.
            </p>
          </div>
        )}

        {/* Migration Results */}
        {migrationResult && (
          <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" /> Migration Results
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{migrationResult.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{migrationResult.success}</div>
                <div className="text-sm text-green-700">Success</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{migrationResult.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>

            {/* Detailed Results */}
            {migrationResult.results && migrationResult.results.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Path</th>
                      <th className="text-left p-2">Old URL</th>
                      <th className="text-left p-2">New URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {migrationResult.results.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {result.status === 'success' || result.status === 'dry-run' ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600" title={result.error}>✗</span>
                          )}
                        </td>
                        <td className="p-2 font-mono text-xs">{result.path}</td>
                        <td className="p-2 text-xs text-blue-600 truncate max-w-[200px]" title={result.oldUrl}>
                          {result.oldUrl}
                        </td>
                        <td className="p-2 text-xs text-green-600 truncate max-w-[200px]" title={result.newUrl}>
                          {result.newUrl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* No Images Found */}
        {scanComplete && images.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800">All Clear!</h3>
            <p className="text-green-700">
              No ImgBB images found in any collection. All your images are already using other URLs or Firebase Storage.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
