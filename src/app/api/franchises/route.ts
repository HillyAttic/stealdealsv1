import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { push, get, set, ref, child } from 'firebase/database';
import { franchisePropertiesRef, database } from '@/lib/firebase';

// Get all franchises
export async function GET() {
  try {
    console.log("Fetching franchises from Firebase...");
    const snapshot = await get(franchisePropertiesRef);
    
    if (snapshot.exists()) {
      // Convert the snapshot to an array of franchises
      const franchises: Array<{id: string | null, [key: string]: any}> = [];
      snapshot.forEach((childSnapshot) => {
        franchises.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      console.log(`Franchises fetched: ${franchises.length}`);
      
      return NextResponse.json({
        franchises,
        total: franchises.length
      });
    } else {
      console.log("No franchises found in database");
      return NextResponse.json({
        franchises: [],
        total: 0
      });
    }
  } catch (error) {
    console.error('Error fetching franchises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch franchises' },
      { status: 500 }
    );
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
    
    // Get all existing franchises to determine the next ID
    const snapshot = await get(franchisePropertiesRef);
    let nextId = 0;
    
    if (snapshot.exists()) {
      // Find the highest numeric ID
      snapshot.forEach((childSnapshot) => {
        const id = childSnapshot.key;
        // Check if the ID is numeric
        if (id && /^\d+$/.test(id)) {
          const numericId = parseInt(id, 10);
          if (numericId >= nextId) {
            nextId = numericId + 1;
          }
        }
      });
    }
    
    // Convert the next ID to a string
    const newId = nextId.toString();
    console.log(`Creating new franchise with ID: ${newId}`);
    
    // Create a new franchise entry with sequential ID
    const newFranchiseRef = child(franchisePropertiesRef, newId);
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
