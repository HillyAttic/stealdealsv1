import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserWishlist, getRawWishlistItems } from '@/lib/database/wishlist';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUserId = searchParams.get('userId') || 'user_32ENazsjJ8HDR8mvhRS4pLePfEA';
    
    console.log(`[DEBUG_WISHLIST] Testing wishlist for user: ${testUserId}`);
    
    // Get current user info
    let clerkUser;
    try {
      clerkUser = await currentUser();
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Clerk currentUser() error:', error);
    }
    
    // Test Firebase connection
    const testRef = ref(database, '.info/connected');
    let firebaseConnected = false;
    try {
      const connSnapshot = await get(testRef);
      firebaseConnected = connSnapshot.val() === true;
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Firebase connection test failed:', error);
    }
    
    // Test direct Firebase read
    const wishlistRef = ref(database, `wishlists/${testUserId}`);
    let directFirebaseData = null;
    try {
      const directSnapshot = await get(wishlistRef);
      if (directSnapshot.exists()) {
        directFirebaseData = directSnapshot.val();
      }
      console.log(`[DEBUG_WISHLIST] Direct Firebase read: ${directSnapshot.exists() ? Object.keys(directFirebaseData || {}).length : 0} items`);
    } catch (error) {
      console.error('[DEBUG_WISHLIST] Direct Firebase read failed:', error);
      directFirebaseData = { error: error.message };
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
      clerkUser: clerkUser ? {
        id: clerkUser.id,
        primaryEmailAddress: clerkUser.primaryEmailAddress?.emailAddress
      } : null,
      firebase: {
        connected: firebaseConnected,
        databaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? 'present' : 'missing',
        directRead: directFirebaseData,
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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}