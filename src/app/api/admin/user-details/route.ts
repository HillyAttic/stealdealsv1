import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';
import { getUserById } from '@/lib/database/firestore-users';

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const targetUserId = searchParams.get('userId');

      if (!targetUserId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      // Get Firebase Auth user
      let firebaseUser;
      try {
        firebaseUser = await FirebaseAdminUserService.getUser(targetUserId);
      } catch {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      // Get Firestore user data
      const firestoreUser = await getUserById(targetUserId);

      // Get wishlist items
      const { db } = await import('@/lib/firebase-server-admin');
      const wishlistSnapshot = await db.collection('wishlists').doc(targetUserId).collection('items').get();
      const wishlistItems = wishlistSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          propertyId: data.propertyId,
          title: data.title || 'Unknown',
          price: data.price || 0,
          location: data.location || '',
          images: data.images || [],
          type: data.type || '',
          addedAt: data.addedAt?.toDate?.().toISOString() || new Date().toISOString(),
          notes: data.notes || '',
          priority: data.priority || 'medium',
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          area: data.area || null,
        };
      });

      const user = {
        id: firebaseUser.id,
        name: firebaseUser.displayName || firestoreUser?.name || firebaseUser.email?.split('@')[0] || 'Unknown',
        email: firebaseUser.email || 'No email',
        role: firestoreUser?.role || 'user',
        isActive: !firebaseUser.disabled,
        emailVerified: firebaseUser.emailVerified,
        provider: firebaseUser.provider,
        createdAt: firebaseUser.createdAt,
        lastLoginAt: firebaseUser.lastSignInAt,
        avatar: firebaseUser.photoURL || firestoreUser?.avatar,
        preferences: firestoreUser?.preferences || {},
      };

      return NextResponse.json({ success: true, user, wishlist: wishlistItems, activity: [] });
    } catch (error) {
      console.error('[User Details API] Error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch user details' }, { status: 500 });
    }
  });
}
