 import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserProfile, updateUserProfile } from '@/lib/database/users';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  company: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  preferences: z.object({
    propertyTypes: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }).optional(),
    locations: z.array(z.string()).optional(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      newProperties: z.boolean(),
      priceAlerts: z.boolean()
    }).optional()
  }).optional()
});

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const userId = authenticatedRequest.user.id;
      const profile = await getUserProfile(userId);

      if (!profile) {
        return NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: profile
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const userId = authenticatedRequest.user.id;
      const body = await request.json();

      // Validate request body
      const validationResult = updateProfileSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid data',
            details: validationResult.error.errors
          },
          { status: 400 }
        );
      }

      const updateData = validationResult.data;

      // Update user profile
      const updatedProfile = await updateUserProfile(userId, updateData);

      if (!updatedProfile) {
        return NextResponse.json(
          { success: false, error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedProfile,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }
  });
}