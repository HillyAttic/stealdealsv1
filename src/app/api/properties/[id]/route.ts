import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPropertyById, Property } from '../../../../lib/firebase';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { trackingService, extractTrackingData } from '@/lib/analytics/tracking-middleware';
import { optionalAuth } from '@/lib/auth/middleware';

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

      // Track property view if user is authenticated
      if (requestWithUser.user) {
        const trackingData = extractTrackingData(request, requestWithUser.user.id);
        await trackingService.trackPageView(trackingData);
      }
      
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
    
    // Use the existing updateProperty function from firebase.ts
    const { updateProperty } = await import('../../../../lib/firebase');
    const result = await updateProperty(id, updatedProperty);
    
    console.log(`[Properties API] Property ${id} updated successfully`);
    
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
    
    // Delete property (Note: deleteProperty function would need to be implemented)
    // For now, return success message indicating delete would happen
    return NextResponse.json({
      success: true,
      message: 'Property deletion not fully implemented - Firebase deleteProperty needed'
    });
  } catch (error) {
    console.error('[Properties API] Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
} 