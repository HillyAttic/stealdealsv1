import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestoreDb } from '@/lib/firestore';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { revalidateTag } from 'next/cache';

// Get a single franchise
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    console.log(`[API] 🔄 Fetching franchise details, params:`, params);

    const id = await resolveIdParam(params);
    console.log(`[API] 🎯 Resolved franchise ID: ${id}`);

    // In Firestore, all properties are in the `properties` collection
    const franchiseDocRef = doc(firestoreDb, 'properties', id);
    const franchiseSnap = await getDoc(franchiseDocRef);

    if (franchiseSnap.exists()) {
      const franchiseData = franchiseSnap.data() as any;
      console.log(`[API] ✅ Found franchise: ${franchiseData?.title || franchiseData?.name || 'Unknown'}`);

      // Convert Firestore document to expected format
      const details = franchiseData.franchiseDetails || {};
      const franchise = {
        id: franchiseSnap.id,
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
        // Legacy compatibility fields
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

    // Not found
    console.warn(`[API] ❌ Franchise not found with ID: ${id}`);
    return NextResponse.json(
      { error: `Franchise not found with ID: ${id}.` },
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

// Update a franchise (PUT method)
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    console.log(`[API] 🔄 Updating franchise with ID: ${id}`);
    const body = await request.json();

    const franchiseDocRef = doc(firestoreDb, 'properties', id);
    const franchiseSnap = await getDoc(franchiseDocRef);

    if (!franchiseSnap.exists()) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }

    const existingData = franchiseSnap.data() as any;

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

    await updateDoc(franchiseDocRef, updatedFranchise);
    console.log(`[API] ✅ Franchise ${id} updated successfully`);

    // Invalidate the cache to ensure fresh data on next request
    revalidateTag('franchises');

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

    const franchiseDocRef = doc(firestoreDb, 'properties', id);
    const franchiseSnap = await getDoc(franchiseDocRef);

    if (!franchiseSnap.exists()) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }

    const existingData = franchiseSnap.data() as any;

    // Prepare updated data
    const updatedFranchise = {
      ...existingData,
      name: body.brand || body.name || existingData.name || existingData.brand || `Franchise ${id}`,
      industry: body.industry || existingData.industry,
      segment: body.segment || existingData.segment || "",
      product: body.brand || body.product || existingData.product || existingData.name || existingData.brand || `Product ${id}`,
      model: body.model || existingData.model || "",
      minArea: body.minArea !== undefined ? body.minArea : existingData.minArea || "",
      maxArea: body.maxArea !== undefined ? body.maxArea : existingData.maxArea || "",
      minInvestment: body.minInvestment !== undefined ? body.minInvestment : existingData.minInvestment || existingData.investment || "",
      maxInvestment: body.maxInvestment !== undefined ? body.maxInvestment : existingData.maxInvestment || "",
      royalty: body.royalty || existingData.royalty || existingData.roi || "",
      establishmentYear: body.establishmentYear || existingData.establishmentYear || "",
      franchiseStartedYear: body.franchiseStartedYear || existingData.franchiseStartedYear || "",
      numberOutlets: body.numberOutlets || existingData.numberOutlets || "",
      minPaybackPeriod: body.minPaybackPeriod || existingData.minPaybackPeriod || "",
      maxPaybackPeriod: body.maxPaybackPeriod || existingData.maxPaybackPeriod || "",
      headquarter: body.headquarter || existingData.headquarter || existingData.location || "",
      remarks: body.remarks || existingData.remarks || existingData.description || "",
      brandDeck: body.brandDeck || existingData.brandDeck || "",
      productList: body.productList || existingData.productList || "",
      roiSheet: body.roiSheet || existingData.roiSheet || "",
      // Keep backward compatibility fields
      investment: body.minInvestment !== undefined ? body.minInvestment : existingData.investment,
      location: body.headquarter || existingData.location,
      roi: body.royalty || existingData.roi,
      description: body.remarks || existingData.description,
      status: body.status || existingData.status,
      image: body.image || existingData.image,
      updatedAt: Date.now()
    };

    await updateDoc(franchiseDocRef, updatedFranchise);

    // Invalidate the cache to ensure fresh data on next request
    revalidateTag('franchises');

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

    const franchiseDocRef = doc(firestoreDb, 'properties', id);
    const franchiseSnap = await getDoc(franchiseDocRef);

    if (!franchiseSnap.exists()) {
      return NextResponse.json(
        { error: 'Franchise not found' },
        { status: 404 }
      );
    }

    // Delete the franchise document
    await deleteDoc(franchiseDocRef);

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
