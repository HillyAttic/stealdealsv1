import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ref, get, update, remove, child } from 'firebase/database';
import { database, migratedFranchiseRef } from '@/lib/firebase';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';

const legacyFranchiseRef = ref(database, 'franchiseProperties');

// Get a single franchise
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    console.log(`[API] 🔄 Fetching franchise details, params:`, params);
    
    const id = await resolveIdParam(params);
    console.log(`[API] 🎯 Resolved franchise ID: ${id}`);
    
    // First try the migrated structure (primary location)
    const migratedFranchiseRef = ref(database, `migratedProperties/franchise/${id}`);
    console.log(`[API] 🔥 Trying migrated path: migratedProperties/franchise/${id}`);
    
    const migratedSnapshot = await get(migratedFranchiseRef);
    console.log(`[API] 📊 Migrated snapshot exists: ${migratedSnapshot.exists()}`);
    
    if (migratedSnapshot.exists()) {
      const franchiseData = migratedSnapshot.val();
      console.log(`[API] ✅ Found franchise in migrated location: ${franchiseData?.title || franchiseData?.name || 'Unknown'}`);
      
      // Convert migrated structure to expected format - prioritize franchiseDetails as primary source
      const details = franchiseData.franchiseDetails || {};
      const franchise = {
        id: migratedSnapshot.key,
        // Use franchiseDetails as primary source, fallback to root level for backward compatibility
        name: details.name || details.brand || franchiseData.title || franchiseData.name || 'Franchise Name',
        // Core franchise information - prioritize franchiseDetails
        industry: details.industry || franchiseData.industry || 'Not specified',
        segment: details.segment || franchiseData.segment || '',
        product: details.product || details.name || details.brand || franchiseData.product || franchiseData.title || '',
        model: details.model || franchiseData.model || '',
        minArea: details.minArea || franchiseData.minArea || '',
        maxArea: details.maxArea || franchiseData.maxArea || '',
        minInvestment: details.minInvestment || franchiseData.minInvestment || '',
        maxInvestment: details.maxInvestment || franchiseData.maxInvestment || '',
        royalty: details.royalty || franchiseData.royalty || 'Not specified',
        establishmentYear: details.establishmentYear || franchiseData.establishmentYear || '',
        franchiseStartedYear: details.franchiseStartedYear || franchiseData.franchiseStartedYear || '',
        numberOutlets: details.numberOfOutlets || details.numberOutlets || franchiseData.numberOutlets || '',
        minPaybackPeriod: details.minPaybackPeriod || franchiseData.minPaybackPeriod || '',
        maxPaybackPeriod: details.maxPaybackPeriod || franchiseData.maxPaybackPeriod || '',
        headquarter: details.headquarter || franchiseData.headquarter || franchiseData.location || '',
        remarks: details.remarks || franchiseData.remarks || franchiseData.description || '',
        brandDeck: details.brandDeck || franchiseData.brandDeck || '',
        productList: details.productList || franchiseData.productList || '',
        roiSheet: details.roiSheet || franchiseData.roiSheet || '',
        investorDiscoveryKitUrl: details.investorDiscoveryKitUrl || franchiseData.investorDiscoveryKitUrl || '',
        // Legacy compatibility fields - for backward compatibility with frontend
        investment: details.minInvestment || franchiseData.price || franchiseData.investment || '',
        location: details.headquarter || franchiseData.location || 'Location not specified',
        status: franchiseData.status || 'Active',
        roi: details.royalty || franchiseData.royalty || 'Contact for details',
        description: details.remarks || franchiseData.description || franchiseData.remarks || '',
        image: franchiseData.images?.[0] || franchiseData.image || '',
        createdAt: franchiseData.createdAt,
        updatedAt: franchiseData.updatedAt,
        // Include franchiseDetails for direct access
        franchiseDetails: details,
        // Include essential root-level fields
        title: franchiseData.title || details.name || details.brand || 'Franchise Property',
        type: franchiseData.type || 'franchise',
        price: franchiseData.price || details.minInvestment || 0,
        images: franchiseData.images || []
      };
      
      return NextResponse.json({ franchise });
    }
    
    // Fallback to legacy franchiseProperties location
    console.log(`[API] 🔄 Trying legacy franchiseProperties path: franchiseProperties/${id}`);
    const legacyFranchiseRef = ref(database, `franchiseProperties/${id}`);
    const legacySnapshot = await get(legacyFranchiseRef);
    console.log(`[API] 📊 Legacy snapshot exists: ${legacySnapshot.exists()}`);
    
    if (legacySnapshot.exists()) {
      const legacyData = legacySnapshot.val();
      console.log(`[API] ✅ Found franchise in legacy location: ${legacyData?.name || legacyData?.brand || 'Unknown'}`);
      
      return NextResponse.json({
        franchise: {
          id: legacySnapshot.key,
          ...legacyData
        }
      });
    }
    
    // Final fallback to general properties collection
    console.log(`[API] 🔄 Trying general properties path: properties/${id}`);
    const propertiesRef = ref(database, `properties/${id}`);
    const propertiesSnapshot = await get(propertiesRef);
    console.log(`[API] 📊 Properties snapshot exists: ${propertiesSnapshot.exists()}`);
    
    if (propertiesSnapshot.exists()) {
      const propertiesData = propertiesSnapshot.val();
      console.log(`[API] ✅ Found franchise in properties collection: ${propertiesData?.name || 'Unknown'}`);
      
      return NextResponse.json({
        franchise: {
          id: propertiesSnapshot.key,
          ...propertiesData
        }
      });
    }
    
    // Not found in any location
    console.warn(`[API] ❌ Franchise not found in any location with ID: ${id}`);
    return NextResponse.json(
      { error: `Franchise not found with ID: ${id}. Checked migrated, legacy, and properties collections.` },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('[API] ❌ Error fetching franchise:', error);
    console.error('[API] 📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch franchise',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Update a franchise (PUT method for compatibility)
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    console.log(`[API] 🔄 Updating franchise with ID: ${id}`);
    const body = await request.json();
    
    let foundFranchise = false;
    let targetRef;
    let existingData = null;
    
    // Check migrated collection first
    const migratedSnapshot = await get(child(migratedFranchiseRef, id));
    if (migratedSnapshot.exists()) {
      console.log('[API] ✅ Found franchise in migrated collection');
      targetRef = child(migratedFranchiseRef, id);
      existingData = migratedSnapshot.val();
      foundFranchise = true;
    } else {
      // Check legacy collection
      const legacyRef = ref(database, `franchiseProperties/${id}`);
      const legacySnapshot = await get(legacyRef);
      if (legacySnapshot.exists()) {
        console.log('[API] ✅ Found franchise in legacy collection');
        targetRef = legacyRef;
        existingData = legacySnapshot.val();
        foundFranchise = true;
      }
    }
    
    if (!foundFranchise) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }
    
    // Merge existing data with updates
    const updatedFranchise = {
      ...existingData,
      ...body,
      updatedAt: Date.now()
    };
    
    // Ensure backward compatibility fields are updated
    if (body.brand) {
      updatedFranchise.name = body.brand;
      updatedFranchise.product = body.brand;
    }
    if (body.minInvestment) {
      updatedFranchise.investment = body.minInvestment;
    }
    if (body.headquarter) {
      updatedFranchise.location = body.headquarter;
    }
    if (body.royalty) {
      updatedFranchise.roi = body.royalty;
    }
    if (body.remarks) {
      updatedFranchise.description = body.remarks;
    }
    
    await update(targetRef, updatedFranchise);
    console.log(`[API] ✅ Franchise ${id} updated successfully`);
    
    return NextResponse.json({
      success: true,
      franchise: {
        id,
        ...updatedFranchise
      }
    });
  } catch (error) {
    console.error('[API] ❌ Error updating franchise:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update franchise',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Update a franchise (PATCH method for legacy compatibility)
export async function PATCH(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    const body = await request.json();
    
    // Validate the franchise exists
    const singleFranchiseRef = ref(database, `franchiseProperties/${id}`);
    const snapshot = await get(singleFranchiseRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }
    
    // Prepare updated data
    const currentData = snapshot.val();
    
    // Update the franchise with new data
    const updatedFranchise = {
      ...currentData,
      name: body.brand || body.name || currentData.name || currentData.brand || `Franchise ${id}`, // Ensure name is always set for main title
      industry: body.industry || currentData.industry,
      segment: body.segment || currentData.segment || "",
      product: body.brand || body.product || currentData.product || currentData.name || currentData.brand || `Product ${id}`, // Ensure product is always set
      model: body.model || currentData.model || "",
      minArea: body.minArea !== undefined ? body.minArea : currentData.minArea || "",
      maxArea: body.maxArea !== undefined ? body.maxArea : currentData.maxArea || "",
      minInvestment: body.minInvestment !== undefined ? body.minInvestment : currentData.minInvestment || currentData.investment || "",
      maxInvestment: body.maxInvestment !== undefined ? body.maxInvestment : currentData.maxInvestment || "",
      royalty: body.royalty || currentData.royalty || currentData.roi || "",
      establishmentYear: body.establishmentYear || currentData.establishmentYear || "",
      franchiseStartedYear: body.franchiseStartedYear || currentData.franchiseStartedYear || "",
      numberOutlets: body.numberOutlets || currentData.numberOutlets || "",
      minPaybackPeriod: body.minPaybackPeriod || currentData.minPaybackPeriod || "",
      maxPaybackPeriod: body.maxPaybackPeriod || currentData.maxPaybackPeriod || "",
      headquarter: body.headquarter || currentData.headquarter || currentData.location || "",
      remarks: body.remarks || currentData.remarks || currentData.description || "",
      brandDeck: body.brandDeck || currentData.brandDeck || "",
      productList: body.productList || currentData.productList || "",
      roiSheet: body.roiSheet || currentData.roiSheet || "",
      // Keep backward compatibility fields
      investment: body.minInvestment !== undefined ? body.minInvestment : currentData.investment,
      location: body.headquarter || currentData.location,
      roi: body.royalty || currentData.roi,
      description: body.remarks || currentData.description,
      status: body.status || currentData.status,
      image: body.image || currentData.image,
      updatedAt: Date.now()
    };
    
    await update(singleFranchiseRef, updatedFranchise);
    
    return NextResponse.json({
      success: true,
      franchise: {
        id,
        ...updatedFranchise
      }
    });
  } catch (error) {
    console.error('Error updating franchise:', error);
    return NextResponse.json(
      { error: 'Failed to update franchise' },
      { status: 500 }
    );
  }
}

// Delete a franchise
export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    
    // Validate the franchise exists
    const singleFranchiseRef = ref(database, `franchiseProperties/${id}`);
    const snapshot = await get(singleFranchiseRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }
    
    // Delete the franchise
    await remove(singleFranchiseRef);
    
    return NextResponse.json({
      success: true,
      message: 'Franchise deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting franchise:', error);
    return NextResponse.json(
      { error: 'Failed to delete franchise' },
      { status: 500 }
    );
  }
} 