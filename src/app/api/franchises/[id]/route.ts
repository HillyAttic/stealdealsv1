import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ref, get, update, remove } from 'firebase/database';
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
      
      // Convert migrated structure to expected format
      const details = franchiseData.franchiseDetails || {};
      const franchise = {
        id: migratedSnapshot.key,
        name: franchiseData.title || franchiseData.name || details.name || details.brand || 'Franchise Name',
        // Core franchise information
        industry: franchiseData.industry || details.industry || 'Not specified',
        segment: franchiseData.segment || details.segment || '',
        product: franchiseData.product || details.product || franchiseData.title || '',
        model: franchiseData.model || details.model || '',
        minArea: franchiseData.minArea || details.minArea || '',
        maxArea: franchiseData.maxArea || details.maxArea || '',
        minInvestment: franchiseData.minInvestment || details.minInvestment || '',
        maxInvestment: franchiseData.maxInvestment || details.maxInvestment || '',
        royalty: franchiseData.royalty || details.royalty || 'Not specified',
        establishmentYear: franchiseData.establishmentYear || details.establishmentYear || '',
        franchiseStartedYear: franchiseData.franchiseStartedYear || details.franchiseStartedYear || '',
        numberOutlets: franchiseData.numberOutlets || details.numberOfOutlets || details.numberOutlets || '',
        minPaybackPeriod: franchiseData.minPaybackPeriod || details.minPaybackPeriod || '',
        maxPaybackPeriod: franchiseData.maxPaybackPeriod || details.maxPaybackPeriod || '',
        headquarter: franchiseData.headquarter || details.headquarter || franchiseData.location || '',
        remarks: franchiseData.remarks || details.remarks || franchiseData.description || '',
        brandDeck: franchiseData.brandDeck || details.brandDeck || '',
        productList: franchiseData.productList || details.productList || '',
        roiSheet: franchiseData.roiSheet || details.roiSheet || '',
        investorDiscoveryKitUrl: franchiseData.investorDiscoveryKitUrl || details.investorDiscoveryKitUrl || '',
        // Legacy compatibility fields
        investment: franchiseData.price || franchiseData.investment || details.minInvestment || '',
        location: franchiseData.location || details.headquarter || 'Location not specified',
        status: franchiseData.status || 'Active',
        roi: franchiseData.royalty || details.royalty || 'Contact for details',
        description: franchiseData.description || franchiseData.remarks || '',
        image: franchiseData.images?.[0] || franchiseData.image || '',
        createdAt: franchiseData.createdAt,
        updatedAt: franchiseData.updatedAt,
        // Include all original data
        ...franchiseData
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

// Update a franchise
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