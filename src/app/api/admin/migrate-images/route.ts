import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db } from '@/lib/firebase-server-admin';
import admin from '@/lib/firebase-server-admin';

// ImgBB URL patterns to detect
const IMGBB_PATTERNS = [
  /i\.ibb\.co\//i,
  /imgbb\.com/i,
];

function isImgbbUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return IMGBB_PATTERNS.some(pattern => pattern.test(url));
}

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
  const buffer = Buffer.from(await response.arrayBuffer());

  return { buffer, contentType };
}

async function uploadToFirebaseStorage(
  buffer: Buffer,
  contentType: string,
  originalUrl: string
): Promise<string> {
  const bucket = admin.storage().bucket();
  const extension = contentType.split('/')[1] || 'jpg';
  const fileName = `properties/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType,
    },
  });

  // Make the file publicly readable
  await file.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

async function scanCollection(
  propertyType: string,
  collectionName: string
): Promise<Array<{ collection: string; propertyId: string; field: string; url: string; path: string }>> {
  const results: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }> = [];

  try {
    const querySnapshot = await db.collection('properties').where('type', '==', propertyType).get();
    if (querySnapshot.empty) return results;

    querySnapshot.forEach((docSnap) => {
      const propertyId = docSnap.id;
      const propertyData = docSnap.data() as any;

      if (!propertyData || typeof propertyData !== 'object') return;

      if (propertyData.image && isImgbbUrl(propertyData.image)) {
        results.push({
          collection: collectionName,
          propertyId,
          field: 'image',
          url: propertyData.image,
          path: `properties/${propertyId}`,
        });
      }

      if (Array.isArray(propertyData.images)) {
        propertyData.images.forEach((url: string, index: number) => {
          if (url && isImgbbUrl(url)) {
            results.push({
              collection: collectionName,
              propertyId,
              field: `images[${index}]`,
              url,
              path: `properties/${propertyId}`,
            });
          }
        });
      }

      const nestedKeys = ['franchiseDetails', 'vacantDetails', 'preleasedDetails', 'plotDetails'];
      for (const key of nestedKeys) {
        if (propertyData[key] && typeof propertyData[key] === 'object') {
          const details = propertyData[key];

          if (details.image && isImgbbUrl(details.image)) {
            results.push({
              collection: collectionName,
              propertyId,
              field: `${key}.image`,
              url: details.image,
              path: `properties/${propertyId}`,
            });
          }

          if (Array.isArray(details.images)) {
            details.images.forEach((url: string, index: number) => {
              if (url && isImgbbUrl(url)) {
                results.push({
                  collection: collectionName,
                  propertyId,
                  field: `${key}.images[${index}]`,
                  url,
                  path: `properties/${propertyId}`,
                });
              }
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(`[Image Migration] Error scanning ${collectionName}:`, error);
  }

  return results;
}

async function scanAllCollections(): Promise<{
  totalImages: number;
  images: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }>;
  summary: { [collection: string]: number };
}> {
  const propertyTypes = [
    { type: 'vacant', name: 'vacant' },
    { type: 'preleased', name: 'preleased' },
    { type: 'franchise', name: 'franchise' },
    { type: 'plot', name: 'plot' },
  ];

  const allImages: Array<{ collection: string; propertyId: string; field: string; url: string; path: string }> = [];
  const summary: { [collection: string]: number } = {};

  for (const propertyType of propertyTypes) {
    const images = await scanCollection(propertyType.type, propertyType.name);
    allImages.push(...images);
    if (images.length > 0) {
      summary[propertyType.name] = images.length;
    }
  }

  return {
    totalImages: allImages.length,
    images: allImages,
    summary,
  };
}

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
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const results: Array<{ path: string; oldUrl: string; newUrl: string; status: string; error?: string }> = [];

  for (const image of images) {
    try {
      if (!image.url || !isImgbbUrl(image.url)) {
        skippedCount++;
        continue;
      }

      const downloadResult = await downloadImage(image.url);

      const { buffer, contentType } = downloadResult;

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

      const newUrl = await uploadToFirebaseStorage(buffer, contentType, image.url);

      // Update the Firestore document using Admin SDK
      const docRef = db.collection('properties').doc(image.propertyId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const currentData = docSnap.data() as any;
        const updateData: any = {};

        if (image.field === 'image') {
          updateData.image = newUrl;
        } else if (image.field.startsWith('images[')) {
          const indexMatch = image.field.match(/images\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            if (Array.isArray(currentData.images)) {
              updateData.images = [...currentData.images];
              updateData.images[index] = newUrl;
            }
          }
        } else if (image.field.includes('.image') || image.field.includes('.images[')) {
          const parts = image.field.split('.');
          if (parts.length === 2) {
            const [detailKey, fieldKey] = parts;
            if (currentData[detailKey]) {
              updateData[detailKey] = { ...currentData[detailKey] };
              if (fieldKey === 'image') {
                updateData[detailKey].image = newUrl;
              } else if (fieldKey.startsWith('images[')) {
                const indexMatch = fieldKey.match(/images\[(\d+)\]/);
                if (indexMatch) {
                  const index = parseInt(indexMatch[1]);
                  if (Array.isArray(updateData[detailKey].images)) {
                    updateData[detailKey].images = [...updateData[detailKey].images];
                    updateData[detailKey].images[index] = newUrl;
                  }
                }
              }
            }
          }
        }

        await docRef.update(updateData);
      }

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

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'scan';
      const dryRun = searchParams.get('dryRun') === 'true';

      if (action === 'scan') {
        const result = await scanAllCollections();
        return NextResponse.json({
          success: true,
          action: 'scan',
          ...result,
        });
      }

      if (action === 'migrate') {
        const result = await scanAllCollections();
        const migrationResult = await migrateImages(result.images, dryRun);
        return NextResponse.json({
          success: true,
          action: 'migrate',
          dryRun,
          ...migrationResult,
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "scan" or "migrate".',
      });
    } catch (error) {
      console.error('[Image Migration] Error:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
