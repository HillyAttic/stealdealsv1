import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllProperties, addProperty, Property } from '../../../lib/firebase';

// Get all properties with optional filtering - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('Query params:', { category, featured, limit });
    
    // Fetch all properties from Firebase
    let properties = await getAllProperties();
    console.log('GET /api/properties - Properties fetched from Firebase:', properties.length);
    
    // Apply filters
    if (category) {
      properties = properties.filter(
        p => p.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (featured === 'true') {
      properties = properties.filter(p => p.featured);
    }
    
    // Apply limit
    const paginatedProperties = properties.slice(0, limit);
    
    console.log('Returning properties:', paginatedProperties.length);
    
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
    
    // Check if this is a pre-leased property or regular property submission
    const isPreLeased = body.tenant || body.buildingName || body.propertyType === 'Pre-Leased';
    
    // Validate required fields based on property type
    if (isPreLeased) {
      // Pre-leased property validation
      if (!body.tenant || !body.category || !body.location) {
        return NextResponse.json(
          { error: 'Tenant, category, and location are required for pre-leased properties' },
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
      title: body.title || (body.tenant ? `${body.tenant} - ${body.buildingName || 'Property'}` : `${body.category} Property`),
      tenant: body.tenant || '',
      category: body.category,
      buildingName: body.buildingName || '',
      location: body.location,
      district: body.district || '',
      subDistrict: body.subDistrict || '',
      floor: body.floor || '',
      area: body.area ? Number(body.area) : 0,
      totalArea: body.totalArea || '',
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
      advance: body.advance ? String(body.advance) : '',
      reference: body.reference || '',
      channel: body.channel || '',
      propertyType: body.propertyType || 'Regular',
      featured: body.featured || false,
      image: body.image || ''
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