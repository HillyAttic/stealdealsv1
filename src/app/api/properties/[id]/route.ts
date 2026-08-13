import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-server-admin';
import { resolveIdParam, RouteParams } from '../../../../lib/params-utils';
import { optionalAuth } from '@/lib/auth/middleware';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { revalidateTag } from 'next/cache';

async function getPropertyByIdAdmin(id: string): Promise<Record<string, any> | null> {
  const docSnap = await db.collection('properties').doc(id).get();
  if (!docSnap.exists) return null;
  return { ...docSnap.data(), id: docSnap.id } as Record<string, any>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return optionalAuth(request, async () => {
    try {
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Fetching property with ID: ${id}`);

      const property = await getPropertyByIdAdmin(id);

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, property });
    } catch (error) {
      console.error('[Properties API] Error fetching property:', error);
      return NextResponse.json(
        { error: 'Failed to fetch property' },
        { status: 500 }
      );
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return requireAdminAuth(request, async (reqWithUser) => {
    try {
      const currentUser = reqWithUser.user;
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Updating property: ${id}`);

      const existingProperty = await getPropertyByIdAdmin(id);

      if (!existingProperty) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      // Permission check
      const propertyOwner = existingProperty.createdBy;
      const isOwner = propertyOwner === currentUser.userId;
      const isSuperuser = currentUser.role === 'superuser';
      const hasEditOthers = currentUser.permissions?.editOthers;

      if (!isOwner && !isSuperuser && !hasEditOthers) {
        return NextResponse.json(
          { success: false, error: 'Permission denied: You can only edit properties you created' },
          { status: 403 }
        );
      }

      const body = await request.json();

      const updatedProperty: any = {
        ...existingProperty,
        ...body,
        id: id,
        createdBy: propertyOwner || existingProperty.createdBy || null,
        lastModifiedBy: currentUser.userId,
        updatedAt: Date.now()
      };

      // Clean up undefined values
      Object.keys(updatedProperty).forEach(key => {
        if (updatedProperty[key] === undefined) {
          delete updatedProperty[key];
        }
      });

      if (!updatedProperty.location) {
        return NextResponse.json({ error: 'Location is required' }, { status: 400 });
      }

      await db.collection('properties').doc(id).set(updatedProperty, { merge: true });

      revalidateTag('vacant-properties');
      revalidateTag('all-properties');

      return NextResponse.json({ success: true, property: updatedProperty });
    } catch (error) {
      console.error('[Properties API] Error updating property:', error);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams<{ id: string }> }
) {
  return requireAdminAuth(request, async (reqWithUser) => {
    try {
      const currentUser = reqWithUser.user;
      const id = await resolveIdParam(params);
      console.log(`[Properties API] Deleting property: ${id}`);

      const existingProperty = await getPropertyByIdAdmin(id);

      if (!existingProperty) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      // Permission check
      const propertyOwner = existingProperty.createdBy;
      const isOwner = propertyOwner === currentUser.userId;
      const isSuperuser = currentUser.role === 'superuser';
      const hasEditOthers = currentUser.permissions?.editOthers;

      if (!isOwner && !isSuperuser && !hasEditOthers) {
        return NextResponse.json(
          { success: false, error: 'Permission denied: You can only delete properties you created' },
          { status: 403 }
        );
      }

      await db.collection('properties').doc(id).delete();

      revalidateTag('vacant-properties');
      revalidateTag('all-properties');

      return NextResponse.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
      console.error('[Properties API] Error deleting property:', error);
      return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
    }
  });
}
