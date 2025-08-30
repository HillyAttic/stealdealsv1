import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById } from '@/lib/firebase';

/**
 * Debug API endpoint to test property retrieval from Firebase
 * GET /api/debug/property/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    
    console.log(`[Debug API] Searching for property ID: ${propertyId}`);
    
    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
      }, { status: 400 });
    }
    
    // Use the Firebase getPropertyById function
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: `Property with ID "${propertyId}" not found in any collection`,
        searchedCollections: [
          'vacantProperties',
          'preleasedProperties', 
          'franchiseProperties',
          'plots',
          'properties (legacy)'
        ]
      }, { status: 404 });
    }
    
    console.log(`[Debug API] ✅ Found property: ${property.title || property.category}`);
    
    return NextResponse.json({
      success: true,
      property,
      metadata: {
        searchedId: propertyId,
        foundIn: determineSourceCollection(property),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('[Debug API] ❌ Error retrieving property:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Determine which collection the property likely came from based on its data structure
 */
function determineSourceCollection(property: any): string {
  // Check for franchise-specific fields
  if (property.investment || property.minInvestment || property.category === 'Franchise') {
    return 'franchiseProperties';
  }
  
  // Check for plot-specific fields
  if (property.project || property.investmentStartsFrom || property.category === 'Plot') {
    return 'plots';
  }
  
  // Check for property type
  if (property.propertyType === 'Vacant') {
    return 'vacantProperties';
  }
  
  if (property.propertyType === 'Pre-Leased') {
    return 'preleasedProperties';
  }
  
  // Default to legacy
  return 'properties (legacy)';
}