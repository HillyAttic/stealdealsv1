import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import admin from '@/lib/firebase-server-admin';

// ImgBB URL patterns to detect
const IMGBB_PATTERNS = [
  /i\.ibb\.co\//i,
  /imgbb\.com/i,
];

/**
 * Check if a URL is an ImgBB URL
 */
function isImgbbUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return IMGBB_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Download an image from a URL and return the buffer
 */
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, contentType };
}

/**
 * Upload an image buffer to Firebase Storage
 */
async function uploadToFirebaseStorage(
  buffer: Buffer,
  contentType: string,
  originalUrl: string
): Promise<string> {
  const storage = admin.storage();
  const bucket = storage.bucket();

  // Generate a unique filename based on the original URL
  const timestamp = Date.now();
  const urlParts = originalUrl.split('/');
  const originalFilename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
  const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `property-images/migrated/${timestamp}-${safeName}`;

  const file = bucket.file(storagePath);

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        originalUrl,
        migratedAt: new Date().toISOString(),
      },
    },
  });

  // Make the file publicly accessible
  await file.makePublic();

  // Get the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  return publicUrl;
}

/**
 * Scan a collection and find all ImgBB URLs
 * Returns a map of propertyId -> { field, url }
 */
async function scanCollection(
  collectionPath: string,
  collectionName: string
): Promise<Array<{ collection: string; propertyId: string; field: string; url: string; path: string }>> {
  const results: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }> = [];

  try {
    const snapshot = await get(ref(database, collectionPath));
    if (!snapshot.exists()) return results;

    const data = snapshot.val();
    if (!data || typeof data !== 'object') return results;

    for (const [propertyId, propertyData] of Object.entries(data)) {
      if (!propertyData || typeof propertyData !== 'object') continue;

      const prop = propertyData as any;

      // Check top-level image field
      if (prop.image && isImgbbUrl(prop.image)) {
        results.push({
          collection: collectionName,
          propertyId,
          field: 'image',
          url: prop.image,
          path: `${collectionPath}/${propertyId}/image`,
        });
      }

      // Check images array
      if (Array.isArray(prop.images)) {
        prop.images.forEach((url: string, index: number) => {
          if (url && isImgbbUrl(url)) {
            results.push({
              collection: collectionName,
              propertyId,
              field: `images[${index}]`,
              url,
              path: `${collectionPath}/${propertyId}/images/${index}`,
            });
          }
        });
      }

      // Check nested details objects (franchiseDetails, vacantDetails, etc.)
      const nestedKeys = ['franchiseDetails', 'vacantDetails', 'preleasedDetails', 'plotDetails'];
      for (const key of nestedKeys) {
        if (prop[key] && typeof prop[key] === 'object') {
          const details = prop[key];

          // Check image in details
          if (details.image && isImgbbUrl(details.image)) {
            results.push({
              collection: collectionName,
              propertyId,
              field: `${key}.image`,
              url: details.image,
              path: `${collectionPath}/${propertyId}/${key}/image`,
            });
          }

          // Check images array in details
          if (Array.isArray(details.images)) {
            details.images.forEach((url: string, index: number) => {
              if (url && isImgbbUrl(url)) {
                results.push({
                  collection: collectionName,
                  propertyId,
                  field: `${key}.images[${index}]`,
                  url,
                  path: `${collectionPath}/${propertyId}/${key}/images/${index}`,
                });
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`[Image Migration] Error scanning ${collectionName}:`, error);
  }

  return results;
}

/**
 * Scan all collections for ImgBB URLs
 */
async function scanAllCollections(): Promise<{
  totalImages: number;
  images: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }>;
  summary: { [collection: string]: number };
}> {
  const collections = [
    { path: 'migratedProperties/vacant', name: 'migratedProperties/vacant' },
    { path: 'migratedProperties/preleased', name: 'migratedProperties/preleased' },
    { path: 'migratedProperties/franchise', name: 'migratedProperties/franchise' },
    { path: 'migratedProperties/plots', name: 'migratedProperties/plots' },
    { path: 'vacantProperties', name: 'vacantProperties (legacy)' },
    { path: 'preleasedProperties', name: 'preleasedProperties (legacy)' },
    { path: 'franchiseProperties', name: 'franchiseProperties (legacy)' },
    { path: 'plots', name: 'plots (legacy)' },
  ];

  const allImages: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }> = [];
  const summary: { [collection: string]: number } = {};

  for (const collection of collections) {
    const images = await scanCollection(collection.path, collection.name);
    allImages.push(...images);
    if (images.length > 0) {
      summary[collection.name] = images.length;
    }
  }

  return {
    totalImages: allImages.length,
    images: allImages,
    summary,
  };
}

/**
 * Migrate images: download from ImgBB, upload to Firebase Storage, update DB
 */
async function migrateImages(
  images: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }>,
  dryRun: boolean = false
): Promise<{
  total: number;
  success: number;
  failed: number;
  skipped: number;
  results: Array<{ path: string; oldUrl: string; newUrl: string; status: string; error?: string }>;
}> {
  const results: Array<{ path: string; oldUrl: string; newUrl: string; status: string; error?: string }> = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`[Image Migration] Processing ${i + 1}/${images.length}: ${image.url}`);

    try {
      // Download the image
      const { buffer, contentType } = await downloadImage(image.url);

      if (dryRun) {
        results.push({
          path: image.path,
          oldUrl: image.url,
          newUrl: `[dry-run] Would upload ${buffer.length} bytes as ${contentType}`,
          status: 'dry-run',
        });
        successCount++;
        continue;
      }

      // Upload to Firebase Storage
      const newUrl = await uploadToFirebaseStorage(buffer, contentType, image.url);

      // Update the database record
      const dbRef = ref(database, image.path);
      await set(dbRef, newUrl);

      results.push({
        path: image.path,
        oldUrl: image.url,
        newUrl,
        status: 'success',
      });
      successCount++;

      console.log(`[Image Migration] ✅ ${image.path}: ${image.url} -> ${newUrl}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Image Migration] ❌ ${image.path}: ${errorMsg}`);

      results.push({
        path: image.path,
        oldUrl: image.url,
        newUrl: '',
        status: 'failed',
        error: errorMsg,
      });
      failedCount++;
    }
  }

  return {
    total: images.length,
    success: successCount,
    failed: failedCount,
    skipped: skippedCount,
    results,
  };
}

/**
 * GET /api/admin/migrate-images - Scan for ImgBB images
 */
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      console.log('[Image Migration] Scan request from:', authenticatedRequest.user.email);

      const scanResult = await scanAllCollections();

      return NextResponse.json({
        success: true,
        message: `Found ${scanResult.totalImages} ImgBB images across all collections`,
        ...scanResult,
      });
    } catch (error) {
      console.error('[Image Migration] Scan error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Scan failed',
        },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/admin/migrate-images - Migrate ImgBB images to Firebase Storage
 * Body: { action: 'dry-run' | 'migrate', images?: [...] }
 */
export async function POST(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      console.log('[Image Migration] POST request from:', authenticatedRequest.user.email);

      const { action, images } = await request.json();

      if (action === 'scan') {
        // Re-scan and return results
        const scanResult = await scanAllCollections();
        return NextResponse.json({
          success: true,
          message: `Found ${scanResult.totalImages} ImgBB images`,
          ...scanResult,
        });
      }

      if (action === 'dry-run' || action === 'migrate') {
        // Use provided images list or scan fresh
        let imagesToProcess = images;

        if (!imagesToProcess || imagesToProcess.length === 0) {
          const scanResult = await scanAllCollections();
          imagesToProcess = scanResult.images;
        }

        if (imagesToProcess.length === 0) {
          return NextResponse.json({
            success: true,
            message: 'No ImgBB images found to migrate',
            total: 0,
            success: 0,
            failed: 0,
            results: [],
          });
        }

        console.log(`[Image Migration] ${action}: Processing ${imagesToProcess.length} images`);

        const migrationResult = await migrateImages(imagesToProcess, action === 'dry-run');

        return NextResponse.json({
          success: true,
          message: action === 'dry-run'
            ? `Dry run complete: ${migrationResult.success}/${migrationResult.total} images would be migrated`
            : `Migration complete: ${migrationResult.success}/${migrationResult.total} images migrated`,
          ...migrationResult,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "scan", "dry-run", or "migrate"' },
        { status: 400 }
      );
    } catch (error) {
      console.error('[Image Migration] POST error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Migration failed',
        },
        { status: 500 }
      );
    }
  });
}
