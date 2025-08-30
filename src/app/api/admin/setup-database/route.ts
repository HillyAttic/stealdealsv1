import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set, remove, get } from 'firebase/database';
import { auth } from '@clerk/nextjs/server';

/**
 * Admin API endpoint for database setup operations
 * POST /api/admin/setup-database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Setup] Database setup request received');
    
    // Get the request body
    const body = await request.json();
    const { action, userId, data } = body;
    
    console.log(`[Admin Setup] Action: ${action}, User: ${userId}`);
    
    // Get authentication from Clerk
    const { sessionClaims } = await auth();
    
    // For now, allow the setup if user is authenticated
    // In production, you might want to check for admin role
    if (!sessionClaims) {
      console.log('[Admin Setup] ❌ Unauthorized - no session');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    switch (action) {
      case 'create_wishlists_node':
        return await createWishlistsNode(userId);
        
      case 'cleanup_temp_data':
        return await cleanupTempData(userId);
        
      case 'verify_structure':
        return await verifyDatabaseStructure();
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('[Admin Setup] ❌ Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Create the wishlists node in Firebase
 */
async function createWishlistsNode(userId: string) {
  try {
    console.log(`[Admin Setup] Creating wishlists node for user: ${userId}`);
    
    // Create the wishlists root node if it doesn't exist
    const wishlistsRef = ref(database, 'wishlists');
    const snapshot = await get(wishlistsRef);
    
    if (!snapshot.exists()) {
      console.log('[Admin Setup] Creating wishlists root node...');
      await set(wishlistsRef, {});
    }
    
    // Create user-specific wishlist node
    const userWishlistRef = ref(database, `wishlists/${userId}`);
    const userSnapshot = await get(userWishlistRef);
    
    if (!userSnapshot.exists()) {
      console.log(`[Admin Setup] Creating user wishlist node: ${userId}`);
      await set(userWishlistRef, {});
    }
    
    console.log('[Admin Setup] ✅ Wishlists structure created successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wishlists node created',
      paths: {
        root: 'wishlists',
        user: `wishlists/${userId}`
      }
    });
    
  } catch (error) {
    console.error('[Admin Setup] ❌ Error creating wishlists node:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create wishlists node' 
    }, { status: 500 });
  }
}

/**
 * Clean up temporary setup data
 */
async function cleanupTempData(userId: string) {
  try {
    console.log(`[Admin Setup] Cleaning up temp data for user: ${userId}`);
    
    const tempRef = ref(database, `wishlists/${userId}/.info`);
    await remove(tempRef);
    
    const placeholderRef = ref(database, `wishlists/${userId}/.placeholder`);
    await remove(placeholderRef);
    
    console.log('[Admin Setup] ✅ Temp data cleaned up');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Temp data cleaned up' 
    });
    
  } catch (error) {
    console.error('[Admin Setup] ❌ Error cleaning up temp data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cleanup temp data' 
    }, { status: 500 });
  }
}

/**
 * Verify the database structure
 */
async function verifyDatabaseStructure() {
  try {
    console.log('[Admin Setup] Verifying database structure...');
    
    const rootRef = ref(database, '/');
    const snapshot = await get(rootRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not accessible' 
      }, { status: 500 });
    }
    
    const data = snapshot.val();
    const collections = Object.keys(data || {});
    
    const expectedCollections = [
      'analytics',
      'franchiseProperties', 
      'plots',
      'preleasedProperties',
      'properties',
      'vacantProperties',
      'wishlists'
    ];
    
    const missingCollections = expectedCollections.filter(
      collection => !collections.includes(collection)
    );
    
    console.log('[Admin Setup] ✅ Database structure verified');
    
    return NextResponse.json({ 
      success: true,
      structure: {
        existingCollections: collections,
        missingCollections,
        hasWishlists: collections.includes('wishlists')
      }
    });
    
  } catch (error) {
    console.error('[Admin Setup] ❌ Error verifying structure:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify database structure' 
    }, { status: 500 });
  }
}

/**
 * GET endpoint for checking database status
 */
export async function GET() {
  try {
    return await verifyDatabaseStructure();
  } catch (error) {
    console.error('[Admin Setup] ❌ Error in GET endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}