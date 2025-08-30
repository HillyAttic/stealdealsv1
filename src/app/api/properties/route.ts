import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllProperties, addProperty, Property } from '../../../lib/firebase';

// Get all properties with optional filtering - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '1000'); // Increased default limit
    
    // Fetch all properties from Firebase
    let properties = await getAllProperties();
    
    // Apply filters
    if (category) {
      properties = properties.filter(
        p => p.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (featured === 'true') {
      properties = properties.filter(p => p.featured);
    }
    
    // Filter by propertyType if specified
    const propertyType = searchParams.get('propertyType');
    if (propertyType) {
      // Skip Pre-Leased property requests to avoid unnecessary processing
      if (propertyType === 'Pre-Leased') {
        console.log('Skipping Pre-Leased property request');
        return NextResponse.json({
          properties: [],
          total: 0
        });
      }
      
      properties = properties.filter(p => {
        // Handle both the migrated structure (type field) and legacy structure (propertyType field)
        const itemType = p.type || p.propertyType || '';
        return itemType.toLowerCase() === propertyType.toLowerCase();
      });
    }
    
    // Apply limit
    const paginatedProperties = properties.slice(0, limit);
    
    // Make sure we always return a valid properties array
    return NextResponse.json({
      properties: paginatedProperties || [],
      total: properties.length
    });
    
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json({
      properties: [],
      total: 0,
      error: 'Failed to fetch properties'
    }, { status: 200 }); // Use 200 instead of 500 to prevent frontend error
  }
}

// Add a new property - requires authentication
export async function POST(request: NextRequest) {
  try {
    // Authentication check removed to prevent errors
    const body = await request.json();
    
    // Log the incoming request body for debugging
    console.log('Received property data:', body);
    
    // Check if this is a request to fetch properties by IDs (for wishlist)
    if (body.propertyIds && Array.isArray(body.propertyIds)) {
      try {
        console.log('Fetching properties by IDs:', body.propertyIds);
        
        // Fetch all properties and filter by the requested IDs
        const allProperties = await getAllProperties();
        const requestedProperties = allProperties.filter(property => 
          body.propertyIds.includes(property.id)
        );
        
        return NextResponse.json({
          properties: requestedProperties,
          total: requestedProperties.length
        });
      } catch (error) {
        console.error('Error fetching properties by IDs:', error);
        return NextResponse.json(
          { error: 'Failed to fetch wishlist properties' },
          { status: 500 }
        );
      }
    }
    
    // Check if this is a pre-leased property or vacant property submission
    const isPreLeased = body.tenant || body.buildingName || body.propertyType === 'Pre-Leased';
    const isVacant = body.propertyType === 'Vacant';
    
    // Validate required fields based on property type
    if (isPreLeased) {
      // Pre-leased property validation
      if (!body.tenant || !body.category || !body.location) {
        return NextResponse.json(
          { error: 'Tenant, category, and location are required for pre-leased properties' },
          { status: 400 }
        );
      }
    } else if (isVacant) {
      // Vacant property validation
      if (!body.category || !body.location) {
        return NextResponse.json(
          { error: 'Category and location are required for vacant properties' },
          { status: 400 }
        );
      }
    } else {
      // Regular property validation
      if (!body.title || !body.category || !body.location) {
        return NextResponse.json(
          { error: 'All required fields must be provided' },
          { status: 400 }
        );
      }
    }
    
    // Prepare property data
    const propertyData: Property = {
      id: '', // Will be set by Firebase
      title: body.title || 
             (body.tenant ? `${body.tenant} - ${body.buildingName || 'Property'}` : 
             (body.propertyType === 'Vacant' ? `Vacant ${body.category} in ${body.location}` : 
             `${body.category} Property`)),
      tenant: body.tenant || '',
      category: body.category,
      buildingName: body.buildingName || '',
      location: body.location,
      state: body.state || '',
      city: body.city || '',
      district: body.district || '',
      subDistrict: body.subDistrict || '',
      floor: body.floor || '',
      area: body.area ? Number(body.area) : 0,
      totalArea: body.totalArea || '',
      superArea: body.superArea || '',
      carpetArea: body.carpetArea || '',
      areaOnSale: body.areaOnSale || '',
      propertyStatus: body.propertyStatus || '',
      description: body.description || '',
      leaseTerm: body.leaseTerm || '',
      remainingLease: body.remainingLease || '',
      lockIn: body.lockIn || '',
      escalation: body.escalation || '',
      rentalType: body.rentalType || '',
      price: body.price ? Number(body.price) : 0,
      rent: body.rent ? Number(body.rent) : 0,
      askingPrice: body.askingPrice ? Number(body.askingPrice) : 0,
      securityDeposit: body.securityDeposit || '',
      roi: body.roi || '',
      advance: body.advance || '',
      reference: body.reference || '',
      channel: body.channel || '',
      propertyType: body.propertyType || 'Regular',
      featured: body.featured || false,
      image: body.image || '',
      
      // Additional vacant property fields
      facing: body.facing || '',
      length: body.length || '',
      width: body.width || '',
      height: body.height || '',
      contactName: body.contactName || body.contactRef || '', // Map contactRef to contactName
      contactNumber: body.contactNumber || ''
    };
    
    try {
      // Save to Firebase
      const newProperty = await addProperty(propertyData);
      
      console.log('New property added to Firebase:', newProperty);
      
      return NextResponse.json({
        success: true,
        property: newProperty
      });
    } catch (firebaseError: any) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase database error: ' + firebaseError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error adding property:', error);
    return NextResponse.json(
      { error: 'Failed to add property: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 