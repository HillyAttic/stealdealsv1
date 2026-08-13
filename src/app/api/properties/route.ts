import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-server-admin';
import { revalidateTag } from 'next/cache';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { sortByNewest } from '@/lib/sort';

interface Property {
  id: string;
  title?: string;
  tenant?: string;
  category?: string;
  buildingName?: string;
  location?: string;
  state?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  area?: number;
  totalArea?: string;
  superArea?: string;
  carpetArea?: string;
  areaOnSale?: string;
  propertyStatus?: string;
  description?: string;
  leaseTerm?: string;
  remainingLease?: string;
  lockIn?: string;
  escalation?: string;
  rentalType?: string;
  price?: number;
  rent?: number;
  askingPrice?: number;
  securityDeposit?: string;
  roi?: string;
  advance?: string;
  reference?: string;
  channel?: string;
  propertyType?: string;
  type?: string;
  featured?: boolean;
  image?: string;
  facing?: string;
  length?: string;
  width?: string;
  height?: string;
  contactName?: string;
  contactNumber?: string;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
  franchiseDetails?: Record<string, any>;
  vacantDetails?: Record<string, any>;
  [key: string]: any;
}

function flattenProperty(id: string, data: Record<string, any>): Property {
  const type = data.type || '';
  const fd = data.franchiseDetails || {};
  const vd = data.vacantDetails || {};

  const base: Property = {
    ...data,
    id,
    type,
    propertyType: data.propertyType || type,
  };

  // Flatten franchise details
  if (type === 'franchise' && Object.keys(fd).length > 0) {
    return {
      ...base,
      title: data.title || fd.brand || fd.name || 'Franchise',
      tenant: fd.brand || fd.name || '',
      category: fd.industry || data.category || 'Franchise',
      buildingName: fd.brand || '',
      location: fd.headquarter || data.location || '',
      rent: parseFloat(fd.minInvestment) || 0,
      askingPrice: parseFloat(fd.maxInvestment) || 0,
      roi: fd.royalty || data.roi || '',
      leaseTerm: data.leaseTerm || '',
      remainingLease: data.remainingLease || '',
      propertyStatus: data.propertyStatus || fd.segment || 'Active',
      image: data.images?.[0] || data.image || '',
    };
  }

  // Flatten vacant details
  if (type === 'vacant' && Object.keys(vd).length > 0) {
    return {
      ...base,
      title: data.title || vd.category || 'Vacant Property',
      category: vd.category || data.category || 'Vacant',
      location: vd.location || data.location || '',
      state: vd.state || data.state || '',
      city: vd.city || data.city || '',
      superArea: vd.superArea || data.superArea || '',
      carpetArea: vd.carpetArea || data.carpetArea || '',
      floor: vd.floor || data.floor || '',
      rent: data.rent || vd.rent || 0,
      propertyType: 'Vacant',
      contactName: vd.contactName || data.contactName || '',
      contactNumber: vd.contactNumber || data.contactNumber || '',
      reference: vd.reference || data.reference || '',
      facing: vd.facing || data.facing || '',
      image: data.images?.[0] || data.image || '',
    };
  }

  // Flatten pre-leased details
  if (type === 'preleased') {
    return {
      ...base,
      title: data.title || data.tenant || 'Pre-Leased Property',
      propertyType: 'Pre-Leased',
      image: data.images?.[0] || data.image || '',
    };
  }

  return base;
}

// Get all properties with optional filtering using Firebase Admin SDK
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10000');

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
      console.log('[Properties API] No valid authentication, returning all properties');
    }

    // Fetch all properties from Firestore using Admin SDK (bypasses security rules)
    const propertiesCol = db.collection('properties');
    const snapshot = await propertiesCol.get();

    let properties: Property[] = [];
    snapshot.forEach((docSnap: any) => {
      properties.push(flattenProperty(docSnap.id, docSnap.data()));
    });

    console.log(`[Properties API] Fetched ${properties.length} properties from Firestore`);

    // Apply ownership filtering if user is authenticated and is a subuser without viewOthers permission
    if (currentUser) {
      const permissions = currentUser.permissions;
      const role = currentUser.role;

      if (role === 'subuser' && permissions && !permissions.viewOthers) {
        console.log('[Properties API] Filtering properties for subuser without viewOthers permission');
        properties = properties.filter(p => {
          const createdBy = (p as any).createdBy;
          return createdBy === currentUser.userId;
        });
        console.log(`[Properties API] Filtered to ${properties.length} properties owned by user`);
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
      properties = properties.filter(p => {
        const itemType = p.type || p.propertyType || '';
        return itemType.toLowerCase() === propertyType.toLowerCase();
      });
    }

    // Sort by newest
    const sorted = sortByNewest(properties);

    // Apply limit
    const paginatedProperties = sorted.slice(0, limit);

    const response = NextResponse.json({
      properties: paginatedProperties || [],
      total: sorted.length
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-API-Cache', 'HIT');
    response.headers.set('X-Data-Source', 'firebase-admin-sdk');

    return response;

  } catch (error) {
    console.error('[Properties API] Error fetching properties:', error);
    const errorResponse = NextResponse.json({
      properties: [],
      total: 0,
      error: 'Failed to fetch properties'
    }, { status: 200 });

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

      console.log('[Properties API] Received property data:', body);
      console.log('[Properties API] Creating property for user:', currentUser.email);

      // Check if this is a request to fetch properties by IDs (for wishlist)
      if (body.propertyIds && Array.isArray(body.propertyIds)) {
        try {
          const propertiesCol = db.collection('properties');
          const allProperties: Property[] = [];
          const snapshot = await propertiesCol.get();
          snapshot.forEach((docSnap: any) => {
            allProperties.push(flattenProperty(docSnap.id, docSnap.data()));
          });

          const requestedProperties = allProperties.filter(property =>
            body.propertyIds.includes(property.id)
          );

          return NextResponse.json({
            properties: requestedProperties,
            total: requestedProperties.length
          });
        } catch (error) {
          console.error('[Properties API] Error fetching properties by IDs:', error);
          return NextResponse.json(
            { error: 'Failed to fetch wishlist properties' },
            { status: 500 }
          );
        }
      }

      // Determine property type
      const isPreLeased = body.tenant || body.buildingName || body.propertyType === 'Pre-Leased';
      const isVacant = body.propertyType === 'Vacant';

      // Validate required fields
      if (isPreLeased) {
        if (!body.tenant || !body.category || !body.location) {
          return NextResponse.json(
            { error: 'Tenant, category, and location are required for pre-leased properties' },
            { status: 400 }
          );
        }
      } else if (isVacant) {
        if (!body.category || !body.location) {
          return NextResponse.json(
            { error: 'Category and location are required for vacant properties' },
            { status: 400 }
          );
        }
      } else {
        if (!body.title || !body.category || !body.location) {
          return NextResponse.json(
            { error: 'All required fields must be provided' },
            { status: 400 }
          );
        }
      }

      // Determine the Firestore type field value
      let firestoreType = 'regular';
      if (body.propertyType === 'Vacant') firestoreType = 'vacant';
      else if (body.propertyType === 'Pre-Leased' || isPreLeased) firestoreType = 'preleased';
      else if (body.propertyType === 'Franchise') firestoreType = 'franchise';
      else if (body.propertyType === 'Plot') firestoreType = 'plot';

      // Prepare property data
      const propertyData: Record<string, any> = {
        type: firestoreType,
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
        images: body.images || (body.image ? [body.image] : []),

        // Additional vacant property fields
        facing: body.facing || '',
        length: body.length || '',
        width: body.width || '',
        height: body.height || '',
        contactName: body.contactName || body.contactRef || '',
        contactNumber: body.contactNumber || '',

        // Ownership tracking
        createdBy: currentUser.userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Save to Firestore using Admin SDK
      const docRef = db.collection('properties').doc();
      await docRef.set(propertyData);

      const savedProperty = { ...propertyData, id: docRef.id };
      console.log('[Properties API] New property saved:', docRef.id);
      console.log('[Properties API] Property created by:', currentUser.email, 'UID:', currentUser.userId);

      revalidateTag('vacant-properties');
      revalidateTag('all-properties');

      return NextResponse.json({
        success: true,
        property: savedProperty
      });
    } catch (firebaseError: any) {
      console.error('[Properties API] Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase database error: ' + firebaseError.message },
        { status: 500 }
      );
    }
  });
}
