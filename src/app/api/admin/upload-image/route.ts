import { NextRequest, NextResponse } from 'next/server';
import { requireEnhancedAdminAuth } from '@/lib/auth/enhanced-admin-middleware';
import admin from 'firebase-admin';

/**
 * POST /api/admin/upload-image
 *
 * Server-side image upload using Firebase Admin SDK (bypasses Storage security rules).
 * Accepts multipart/form-data with a single "file" field.
 * Returns the public download URL.
 */
export async function POST(request: NextRequest) {
  // Reuse admin auth middleware — only authenticated admins can upload
  return requireEnhancedAdminAuth(request, async () => {
    try {
      const contentType = request.headers.get('content-type') || '';

      let fileBuffer: Buffer;
      let fileName: string;
      let mimeType: string;

      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
          return NextResponse.json(
            { error: 'No file provided. Send a multipart/form-data request with a "file" field.' },
            { status: 400 }
          );
        }
        fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        mimeType = file.type || 'application/octet-stream';
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else if (contentType.includes('application/json')) {
        // Fallback: accept base64-encoded file for programmatic uploads
        const body = await request.json();
        if (!body.file || !body.fileName) {
          return NextResponse.json(
            { error: 'JSON body must contain "file" (base64 string) and "fileName".' },
            { status: 400 }
          );
        }
        fileBuffer = Buffer.from(body.file, 'base64');
        fileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        mimeType = body.mimeType || 'application/octet-stream';
      } else {
        // Raw body (e.g. directly posted binary)
        fileBuffer = Buffer.from(await request.arrayBuffer());
        fileName = `upload-${Date.now()}.bin`;
        mimeType = contentType.split(';')[0] || 'application/octet-stream';
      }

      // Validate file size (max 10 MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (fileBuffer.length > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024} MB.` },
          { status: 413 }
        );
      }

      // Validate image MIME type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'image/svg+xml', 'image/bmp', 'image/tiff',
        'image/jfif', 'image/pjpeg', 'image/x-png',
      ];
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          { error: `Unsupported file type: ${mimeType}. Only image files are allowed.` },
          { status: 415 }
        );
      }

      // Generate unique storage path: uploads/{timestamp}-{safeFileName}
      const timestamp = Date.now();
      const storagePath = `uploads/${timestamp}-${fileName}`;

      // Upload to Firebase Storage via Admin SDK (bypasses client Storage rules)
      if (!admin.apps.length) {
        return NextResponse.json(
          { error: 'Firebase Admin SDK is not initialized.' },
          { status: 500 }
        );
      }

      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'admin',
          },
        },
        resumable: false,
      });

      // Make the file publicly readable (so the download URL works)
      await file.makePublic();

      // Construct the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        storagePath,
        mimeType,
        size: fileBuffer.length,
      });
    } catch (error: any) {
      console.error('[Upload API] Upload failed:', error.message, error.stack);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
  });
}
