import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';

const franchiseRef = ref(database, 'franchiseProperties');

// Migration endpoint to fix missing product fields in existing franchises
export async function POST(request: NextRequest) {
  try {
    console.log('Starting franchise migration to fix missing product fields...');
    
    // Get all franchises
    const snapshot = await get(franchiseRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        message: 'No franchises found to migrate',
        updated: 0
      });
    }
    
    let updatedCount = 0;
    const updates: { [key: string]: any } = {};
    
    // Process each franchise
    snapshot.forEach((childSnapshot) => {
      const franchiseId = childSnapshot.key;
      const franchiseData = childSnapshot.val();
      
      if (franchiseId && franchiseData) {
        let needsUpdate = false;
        
        // Check if name field is missing or empty (this is the main title)
        if (!franchiseData.name || franchiseData.name.trim() === '') {
          console.log(`Fixing franchise name ${franchiseId}: setting name from brand or generating default`);
          updates[`${franchiseId}/name`] = franchiseData.brand || franchiseData.product || `Franchise ${franchiseId}`;
          needsUpdate = true;
        }
        
        // Check if product field is missing or empty
        if (!franchiseData.product || franchiseData.product.trim() === '') {
          console.log(`Fixing franchise product ${franchiseId}: ${franchiseData.name || franchiseData.brand}`);
          updates[`${franchiseId}/product`] = franchiseData.name || franchiseData.brand || `Product ${franchiseId}`;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          updatedCount++;
        }
      }
    });
    
    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      await update(franchiseRef, updates);
      console.log(`Migration completed. Updated ${updatedCount} franchises.`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed successfully. Updated ${updatedCount} franchises.`,
      updated: updatedCount
    });
    
  } catch (error) {
    console.error('Error during franchise migration:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to check which franchises need migration
export async function GET() {
  try {
    const snapshot = await get(franchiseRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({
        total: 0,
        needsMigration: 0,
        franchises: []
      });
    }
    
    const franchises: any[] = [];
    let needsMigration = 0;
    
    snapshot.forEach((childSnapshot) => {
      const franchiseId = childSnapshot.key;
      const franchiseData = childSnapshot.val();
      
      if (franchiseId && franchiseData) {
        const hasName = franchiseData.name && franchiseData.name.trim() !== '';
        const hasProduct = franchiseData.product && franchiseData.product.trim() !== '';
        
        const needsMigrationCheck = !hasName || !hasProduct;
        
        if (needsMigrationCheck) {
          needsMigration++;
        }
        
        franchises.push({
          id: franchiseId,
          name: franchiseData.name || null,
          product: franchiseData.product || null,
          brand: franchiseData.brand || null,
          needsMigration: needsMigrationCheck,
          missingName: !hasName,
          missingProduct: !hasProduct
        });
      }
    });
    
    return NextResponse.json({
      total: franchises.length,
      needsMigration,
      franchises
    });
    
  } catch (error) {
    console.error('Error checking franchise migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}