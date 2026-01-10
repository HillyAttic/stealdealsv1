import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllProperties, addProperty, Property } from '../../../lib/firebase';
import { revalidateTag } from 'next/cache';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';

// Get all properties with optional filtering
// Authentication is optional - if authenticated, applies ownership filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Check if user is authenticated (optional for public access)
    let currentUser: any = null;
    try {
      const token = request.cookies.get('adminToken')?.value;
      if (token) {
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        currentUser = decoded;
        console.log('[Properties API] Authenticated user:', currentUser.email, 'Role:', currentUser.role);
      }
    } catch (authError) {
      // Not authenticated or invalid token - continue without filtering
      console.log('[Properties API] No valid authentication, returning all properties');
    }

    // Fetch all properties from Firebase
    let properties = await getAllProperties();

    // Apply ownership filtering if user is authenticated and is a subuser without viewOthers permission
    if (currentUser) {
      const permissions = currentUser.permissions;
      const role = currentUser.role;

      // If user is a subuser and doesn't have viewOthers permission, filter to only their properties
      if (role === 'subuser' && permissions && !permissions.viewOthers) {
        console.log('[Properties API] Filtering properties for subuser without viewOthers permission');
        properties = properties.filter(p => {
          const createdBy = (p as any).createdBy;
          return createdBy === currentUser.userId;
        });
        console.log(`[Properties API] Filtered to ${properties.length} properties owned by user`);
      } else {
        console.log('[Properties API] User has full access to all properties');
      }
    }

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
        const itemType = (p as any).type || p.propertyType || '';
        return itemType.toLowerCase() === propertyType.toLowerCase();
      });
    }

    // Apply limit
    const paginatedProperties = properties.slice(0, limit);

    // Make sure we always return a valid properties array
    const response = NextResponse.json({
      properties: paginatedProperties || [],
      total: properties.length
    });

    // Add cache headers for optimal performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'max-age=300');
    response.headers.set('Vary', 'Accept-Encoding');

    // Add performance headers
    response.headers.set('X-API-Cache', 'HIT');
    response.headers.set('X-Response-Time', `${Date.now() - Date.now()}ms`);

    return response;

  } catch (error) {
    console.error('Error fetching properties:', error);
    // Return empty array instead of error to prevent frontend crash
    const errorResponse = NextResponse.json({
      properties: [],
      total: 0,
      error: 'Failed to fetch properties'
    }, { status: 200 }); // Use 200 instead of 500 to prevent frontend error

    // Add cache headers even for error responses (short cache)
    errorResponse.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    errorResponse.headers.set('X-API-Cache', 'MISS');
    errorResponse.headers.set('X-Error', 'true');

    return errorResponse;
  }
}

// Add a new property - requires authentication
export async function POST(request: NextRequest) {
  return requireAdminAuth(request, async (reqWithUser) => {
    try {
      const currentUser = reqWithUser.user;
      const body = await request.json();

      // Log the incoming request body for debugging
      console.log('Received property data:', body);
      console.log('Creating property for user:', currentUser.email);

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

      // Prepare property data with ownership tracking
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
        contactNumber: body.contactNumber || '',

        // Ownership tracking
        createdBy: currentUser.userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      try {
        // Save to Firebase
        const newProperty = await addProperty(propertyData);

        console.log('New property added to Firebase:', newProperty);
        console.log('Property created by:', currentUser.email, 'UID:', currentUser.userId);

        // Invalidate the cache to ensure fresh data on next request
        revalidateTag('vacant-properties');
        revalidateTag('all-properties');

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
  });
}