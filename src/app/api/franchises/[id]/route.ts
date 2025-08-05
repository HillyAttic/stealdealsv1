import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ref, get, update, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';

const franchiseRef = ref(database, 'franchiseProperties');

// Get a single franchise
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    const singleFranchiseRef = ref(database, `franchiseProperties/${id}`);
    
    const snapshot = await get(singleFranchiseRef);
    
    if (snapshot.exists()) {
      return NextResponse.json({
        franchise: {
          id: snapshot.key,
          ...snapshot.val()
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching franchise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch franchise' },
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