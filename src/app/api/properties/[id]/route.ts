import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPropertyById, Property, updateProperty, deleteProperty } from '../../../../lib/firebase';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { optionalAuth } from '@/lib/auth/middleware';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { revalidateTag } from 'next/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return optionalAuth(request, async (requestWithUser) => {
    try {
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Fetching property with ID: ${id}`);

      // Find property by ID using Firebase
      const property = await getPropertyById(id);

      if (!property) {
        console.log(`[Properties API] Property not found: ${id}`);
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      console.log(`[Properties API] Found property: ${property.title || property.id}`);

      // Property view tracking temporarily unavailable

      return NextResponse.json({
        success: true,
        property
      });
    } catch (error) {
      console.error('[Properties API] Error fetching property:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch property',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return requireAdminAuth(request, async (reqWithUser) => {
    try {
      const currentUser = reqWithUser.user;
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Updating property with ID: ${id}`);
      console.log(`[Properties API] User: ${currentUser.email}, Role: ${currentUser.role}`);

      // Check if property exists first
      const existingProperty = await getPropertyById(id);

      if (!existingProperty) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      // Check edit permissions
      const propertyOwner = (existingProperty as any).createdBy;
      const isOwner = propertyOwner === currentUser.userId;
      const isSuperuser = currentUser.role === 'superuser';
      const hasEditOthers = currentUser.permissions?.editOthers;

      console.log(`[Properties API] Property owner: ${propertyOwner}, Current user: ${currentUser.userId}`);
      console.log(`[Properties API] Is owner: ${isOwner}, Is superuser: ${isSuperuser}, Has editOthers: ${hasEditOthers}`);

      // Permission check: user must be owner, have editOthers permission, or be superuser
      if (!isOwner && !isSuperuser && !hasEditOthers) {
        console.log(`[Properties API] Permission denied for user ${currentUser.email}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied: You can only edit properties you created, unless you have editOthers permission'
          },
          { status: 403 }
        );
      }

      // Get the updated data from request
      const body = await request.json();

      // Prepare updated property object, merging with existing data
      const updatedProperty: Property = {
        ...existingProperty,
        ...body,
        id: id, // Ensure ID is preserved
        createdBy: propertyOwner, // Preserve original creator
        lastModifiedBy: currentUser.userId, // Track who modified it
        updatedAt: Date.now() // Add timestamp
      };

      // Validate required fields based on property type
      if (!updatedProperty.location) {
        return NextResponse.json(
          { error: 'Location is required' },
          { status: 400 }
        );
      }

      const result = await updateProperty(id, updatedProperty);

      console.log(`[Properties API] Property ${id} updated successfully by ${currentUser.email}`);

      // Invalidate the cache to ensure fresh data on next request
      revalidateTag('vacant-properties');
      revalidateTag('all-properties');

      return NextResponse.json({
        success: true,
        property: result
      });
    } catch (error) {
      console.error('[Properties API] Error updating property:', error);
      return NextResponse.json(
        {
          error: 'Failed to update property',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return requireAdminAuth(request, async (reqWithUser) => {
    try {
      const currentUser = reqWithUser.user;
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Deleting property with ID: ${id}`);
      console.log(`[Properties API] User: ${currentUser.email}, Role: ${currentUser.role}`);

      // Check if property exists first
      const existingProperty = await getPropertyById(id);

      if (!existingProperty) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      // Check delete permissions (same as edit permissions)
      const propertyOwner = (existingProperty as any).createdBy;
      const isOwner = propertyOwner === currentUser.userId;
      const isSuperuser = currentUser.role === 'superuser';
      const hasEditOthers = currentUser.permissions?.editOthers;

      console.log(`[Properties API] Property owner: ${propertyOwner}, Current user: ${currentUser.userId}`);
      console.log(`[Properties API] Is owner: ${isOwner}, Is superuser: ${isSuperuser}, Has editOthers: ${hasEditOthers}`);

      // Permission check: user must be owner, have editOthers permission, or be superuser
      if (!isOwner && !isSuperuser && !hasEditOthers) {
        console.log(`[Properties API] Permission denied for user ${currentUser.email}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Permission denied: You can only delete properties you created, unless you have editOthers permission'
          },
          { status: 403 }
        );
      }

      // Delete property
      const success = await deleteProperty(id);

      if (success) {
        console.log(`[Properties API] Property ${id} deleted successfully by ${currentUser.email}`);

        // Invalidate the cache to ensure fresh data on next request
        revalidateTag('vacant-properties');
        revalidateTag('all-properties');

        return NextResponse.json({
          success: true,
          message: 'Property deleted successfully'
        });
      } else {
        throw new Error('Failed to delete property');
      }
    } catch (error) {
      console.error('[Properties API] Error deleting property:', error);
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      );
    }
  });
}