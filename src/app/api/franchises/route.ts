import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { push, get, set, ref, child } from 'firebase/database';
import { getAllFranchises, migratedFranchiseRef, generateUniquePropertyId, getNextSequenceNumber } from '@/lib/firebase';

// Get all franchises from migrated structure
export async function GET() {
  try {
    console.log("Fetching franchises from migrated structure...");
    const franchises = await getAllFranchises();
    
    console.log(`Franchises fetched from migratedProperties: ${franchises.length}`);
    
    const response = NextResponse.json({
      franchises,
      total: franchises.length
    });

    // Add cache headers for optimal performance (longer cache for franchises as they change less frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    response.headers.set('CDN-Cache-Control', 'max-age=600');
    response.headers.set('Vary', 'Accept-Encoding');
    
    // Add performance headers
    response.headers.set('X-API-Cache', 'HIT');
    response.headers.set('X-Data-Source', 'firebase-migrated');
    
    return response;
  } catch (error) {
    console.error('Error fetching franchises:', error);
    const errorResponse = NextResponse.json(
      { 
        franchises: [], 
        total: 0, 
        error: 'Failed to fetch franchises' 
      },
      { status: 200 } // Return 200 to prevent frontend crash
    );
    
    // Add cache headers for error responses (shorter cache)
    errorResponse.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    errorResponse.headers.set('X-API-Cache', 'MISS');
    errorResponse.headers.set('X-Error', 'true');
    
    return errorResponse;
  }
}

// Add a new franchise with sequential ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received franchise data:', body);
    
    // Validate required fields
    if (!body.brand || !body.industry) {
      return NextResponse.json(
        { error: 'Missing required fields: brand and industry are required' },
        { status: 400 }
      );
    }
    
    // Get the next sequence number for franchise properties
    const sequenceNumber = await getNextSequenceNumber('Franchise');
    
    // Generate the new unique ID
    const newId = generateUniquePropertyId('Franchise', sequenceNumber);
    console.log(`Creating new franchise with ID: ${newId}`);
    
    // Create a new franchise entry with unique ID in migrated structure
    const newFranchiseRef = child(migratedFranchiseRef, newId);
    const newFranchise = {
      name: body.brand || body.name || `Franchise ${newId}`, // Ensure name is always set for main title
      industry: body.industry,
      segment: body.segment || "",
      product: body.brand || body.product || body.name || `Product ${newId}`, // Ensure product is always set
      model: body.model || "",
      minArea: body.minArea || "",
      maxArea: body.maxArea || "",
      minInvestment: body.minInvestment || "0",
      maxInvestment: body.maxInvestment || "0",
      royalty: body.royalty || "Varies",
      establishmentYear: body.establishmentYear || "",
      franchiseStartedYear: body.franchiseStartedYear || "",
      numberOutlets: body.numberOutlets || "",
      minPaybackPeriod: body.minPaybackPeriod || "",
      maxPaybackPeriod: body.maxPaybackPeriod || "",
      headquarter: body.headquarter || "Multiple Locations",
      remarks: body.remarks || "",
      brandDeck: body.brandDeck || "",
      productList: body.productList || "",
      roiSheet: body.roiSheet || "",
      investment: body.minInvestment || "0", // Keep for backward compatibility
      location: body.headquarter || "Multiple Locations", // Keep for backward compatibility
      status: body.status || "Active",
      roi: body.royalty || "Varies", // Keep for backward compatibility
      description: body.remarks || "",
      image: body.image || 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      createdAt: body.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    console.log('Saving franchise data:', newFranchise);
    await set(newFranchiseRef, newFranchise);
    
    return NextResponse.json({
      success: true,
      franchise: {
        id: newId,
        ...newFranchise
      }
    });
  } catch (error: any) {
    console.error('Error adding franchise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add franchise' },
      { status: 500 }
    );
  }
}

// PATCH endpoints for individual franchises will be added in the [id]/route.ts file
