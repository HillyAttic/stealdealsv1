import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPropertyById, Property, updateProperty, deleteProperty } from '../../../../lib/firebase';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { optionalAuth } from '@/lib/auth/middleware';
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
  try {
    const id = await resolveIdParam(params);
    console.log(`[Properties API] Updating property with ID: ${id}`);
    
    // Check if property exists first
    const existingProperty = await getPropertyById(id);
    
    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Get the updated data from request
    const body = await request.json();
    
    // Prepare updated property object, merging with existing data
    const updatedProperty: Property = {
      ...existingProperty,
      ...body,
      id: id, // Ensure ID is preserved
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
    
    console.log(`[Properties API] Property ${id} updated successfully`);
    
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
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    console.log(`[Properties API] Deleting property with ID: ${id}`);
    
    // Check if property exists first
    const existingProperty = await getPropertyById(id);
    
    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Delete property
    const success = await deleteProperty(id);
    
    if (success) {
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
} 