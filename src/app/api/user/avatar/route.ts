import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { updateUserAvatar } from '@/lib/database/users';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// POST /api/user/avatar - Upload profile picture
export async function POST(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const userId = authenticatedRequest.user.id;
      const formData = await request.formData();
      const file = formData.get('avatar') as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Save file
      const filePath = join(uploadsDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Update user avatar in database
      const avatarUrl = `/uploads/avatars/${fileName}`;
      const updatedUser = await updateUserAvatar(userId, avatarUrl);

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: 'Failed to update avatar' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        avatarUrl,
        message: 'Avatar updated successfully'
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/user/avatar - Remove profile picture
export async function DELETE(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const userId = authenticatedRequest.user.id;

      // Remove avatar from database
      const updatedUser = await updateUserAvatar(userId, null);

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: 'Failed to remove avatar' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Avatar removed successfully'
      });

    } catch (error) {
      console.error('Error removing avatar:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove avatar' },
        { status: 500 }
      );
    }
  });
}