import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Read from Firestore (migration complete)
import { getAllFranchises } from '@/lib/database/firestore-properties';
import { db } from '@/lib/firebase-server-admin';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { revalidateTag } from 'next/cache';

// Get a single franchise from Firestore
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    console.log(`[Franchises API] Fetching franchise: ${id}`);

    const franchises = await getAllFranchises();
    const franchise = franchises.find(f => f.id === id);

    if (franchise) {
      console.log(`[Franchises API] Found franchise: ${franchise.name}`);
      return NextResponse.json({ franchise });
    }

    console.warn(`[Franchises API] Franchise not found: ${id}`);
    return NextResponse.json(
      { error: `Franchise not found with ID: ${id}` },
      { status: 404 }
    );
  } catch (error) {
    console.error('[Franchises API] Error fetching franchise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch franchise' },
      { status: 500 }
    );
  }
}

// Update a franchise (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    console.log(`[Franchises API] Updating franchise: ${id}`);
    const body = await request.json();

    const docSnap = await db.collection('properties').doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Franchise not found' }, { status: 404 });
    }

    const existingData = docSnap.data() as any;

    // Merge existing data with updates
    const updatedData = {
      ...existingData,
      ...body,
      updatedAt: Date.now()
    };

    // Ensure backward compatibility fields
    if (body.brand) {
      updatedData.name = body.brand;
      updatedData.product = body.brand;
    }
    if (body.minInvestment) {
      updatedData.investment = body.minInvestment;
    }
    if (body.headquarter) {
      updatedData.location = body.headquarter;
    }
    if (body.royalty) {
      updatedData.roi = body.royalty;
    }
    if (body.remarks) {
      updatedData.description = body.remarks;
    }

    await db.collection('properties').doc(id).set(updatedData, { merge: true });
    console.log(`[Franchises API] Franchise ${id} updated successfully`);

    revalidateTag('franchises');

    return NextResponse.json({
      success: true,
      franchise: { id, ...updatedData }
    });
  } catch (error) {
    console.error('[Franchises API] Error updating franchise:', error);
    return NextResponse.json(
      { error: 'Failed to update franchise' },
      { status: 500 }
    );
  }
}

// Update a franchise (PATCH - legacy compatibility)
export async function PATCH(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  try {
    const id = await resolveIdParam(params);
    const body = await request.json();

    const docSnap = await db.collection('properties').doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Franchise not found' }, { status: 404 });
    }

    const existingData = docSnap.data() as any;

    // Update franchiseDetails sub-object if body contains franchise-level fields
    const franchiseDetailsUpdate: Record<string, any> = {};
    if (body.brand !== undefined) franchiseDetailsUpdate.brand = body.brand;
    if (body.industry !== undefined) franchiseDetailsUpdate.industry = body.industry;
    if (body.segment !== undefined) franchiseDetailsUpdate.segment = body.segment;
    if (body.model !== undefined) franchiseDetailsUpdate.model = body.model;
    if (body.minArea !== undefined) franchiseDetailsUpdate.minArea = body.minArea;
    if (body.maxArea !== undefined) franchiseDetailsUpdate.maxArea = body.maxArea;
    if (body.minInvestment !== undefined) franchiseDetailsUpdate.minInvestment = body.minInvestment;
    if (body.maxInvestment !== undefined) franchiseDetailsUpdate.maxInvestment = body.maxInvestment;
    if (body.royalty !== undefined) franchiseDetailsUpdate.royalty = body.royalty;
    if (body.establishmentYear !== undefined) franchiseDetailsUpdate.establishmentYear = body.establishmentYear;
    if (body.franchiseStartedYear !== undefined) franchiseDetailsUpdate.franchiseStartedYear = body.franchiseStartedYear;
    if (body.numberOutlets !== undefined) franchiseDetailsUpdate.numberOfOutlets = body.numberOutlets;
    if (body.minPaybackPeriod !== undefined) franchiseDetailsUpdate.minPaybackPeriod = body.minPaybackPeriod;
    if (body.maxPaybackPeriod !== undefined) franchiseDetailsUpdate.maxPaybackPeriod = body.maxPaybackPeriod;
    if (body.headquarter !== undefined) franchiseDetailsUpdate.headquarter = body.headquarter;
    if (body.remarks !== undefined) franchiseDetailsUpdate.remarks = body.remarks;
    if (body.brandDeck !== undefined) franchiseDetailsUpdate.brandDeck = body.brandDeck;
    if (body.productList !== undefined) franchiseDetailsUpdate.productList = body.productList;
    if (body.roiSheet !== undefined) franchiseDetailsUpdate.roiSheet = body.roiSheet;

    const updateData: Record<string, any> = {
      updatedAt: Date.now()
    };

    // Update franchiseDetails if any franchise-level fields were provided
    if (Object.keys(franchiseDetailsUpdate).length > 0) {
      updateData.franchiseDetails = {
        ...(existingData.franchiseDetails || {}),
        ...franchiseDetailsUpdate
      };
    }

    // Update root-level fields
    if (body.status) updateData.status = body.status;
    if (body.image) updateData.image = body.image;
    if (body.location) updateData.location = body.location;

    await db.collection('properties').doc(id).set(updateData, { merge: true });

    revalidateTag('franchises');

    return NextResponse.json({
      success: true,
      franchise: { id, ...existingData, ...updateData }
    });
  } catch (error) {
    console.error('[Franchises API] Error updating franchise:', error);
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

    const docSnap = await db.collection('properties').doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Franchise not found' }, { status: 404 });
    }

    await db.collection('properties').doc(id).delete();

    revalidateTag('franchises');

    return NextResponse.json({
      success: true,
      message: 'Franchise deleted successfully'
    });
  } catch (error) {
    console.error('[Franchises API] Error deleting franchise:', error);
    return NextResponse.json(
      { error: 'Failed to delete franchise' },
      { status: 500 }
    );
  }
}
