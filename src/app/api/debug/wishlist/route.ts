import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server-session';
import { getUserWishlist, getRawWishlistItems } from '@/lib/database/firestore-wishlist';
import { firestoreDb } from '@/lib/firestore';
import { collection, getDocs } from 'firebase/firestore';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUserId = searchParams.get('userId') || 'user_32ENazsjJ8HDR8mvhRS4pLePfEA';

    console.log(`[DEBUG_WISHLIST] Testing wishlist for user: ${testUserId}`);

    // Get current user info
    let firebaseUser;
    try {
      firebaseUser = await getServerSession();
    } catch (error) {
      console.error('[DEBUG_WISHLIST] getServerSession() error:', error);
    }

    // Test Firestore connection
    let firestoreConnected = false;
    try {
      const testSnap = await getDocs(collection(firestoreDb, 'wishlists', testUserId, 'items').limit(1));
      firestoreConnected = true;
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Firestore connection test failed:', error);
    }

    // Test direct Firestore read
    let directFirestoreData = null;
    try {
      const itemsCol = collection(firestoreDb, 'wishlists', testUserId, 'items');
      const snap = await getDocs(itemsCol);
      const items: any[] = [];
      snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      directFirestoreData = items;
      console.log(`[DEBUG_WISHLIST] Direct Firestore read: ${items.length} items`);
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Direct Firestore read failed:', error);
      directFirestoreData = { error: (error as Error).message };
    }

    // Test raw wishlist items
    let rawItems = [];
    try {
      rawItems = await getRawWishlistItems(testUserId);
      console.log(`[DEBUG_WISHLIST] Raw items: ${rawItems.length} found`);
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Raw items fetch failed:', error);
    }

    // Test full wishlist
    let fullWishlist = [];
    try {
      fullWishlist = await getUserWishlist(testUserId);
      console.log(`[DEBUG_WISHLIST] Full wishlist: ${fullWishlist.length} properties`);
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Full wishlist fetch failed:', error);
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      testUserId,
      firestoreUser: firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email
      } : null,
      firestore: {
        connected: firestoreConnected,
        directRead: directFirestoreData,
        rawItemsCount: rawItems.length,
        fullWishlistCount: fullWishlist.length
      },
      rawItems: rawItems.slice(0, 5), // First 5 items
      fullWishlist: fullWishlist.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        location: item.location,
        addedAt: item.addedAt
      }))
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[DEBUG_WISHLIST] Debug endpoint error:', error);

    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}