// Cleanup script to remove legacy collections
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function cleanupLegacyCollections() {
  try {
    console.log('=== STARTING LEGACY COLLECTION CLEANUP ===\n');
    
    const legacyCollections = [
      { name: 'plots', description: 'Legacy plots collection' },
      { name: 'franchiseProperties', description: 'Legacy franchise collection' },
      { name: 'preleasedProperties', description: 'Legacy preleased collection' },  
      { name: 'vacantProperties', description: 'Legacy vacant collection' },
      { name: 'properties', description: 'Legacy general properties collection' }
    ];
    
    const cleanupResults = {
      removed: [],
      notFound: [],
      errors: []
    };
    
    // Pre-cleanup verification - ensure migrated data exists
    console.log('🔍 Pre-cleanup verification...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (!migratedSnapshot.exists()) {
      throw new Error('❌ ABORT: migratedProperties not found! Cannot proceed with cleanup.');
    }
    
    const migratedData = migratedSnapshot.val();
    const migratedCounts = {
      plots: migratedData.plots ? Object.keys(migratedData.plots).length : 0,
      franchise: migratedData.franchise ? Object.keys(migratedData.franchise).length : 0,
      preleased: migratedData.preleased ? Object.keys(migratedData.preleased).length : 0,
      vacant: migratedData.vacant ? Object.keys(migratedData.vacant).length : 0
    };
    
    console.log('✅ Migrated data verification:');
    console.log(`   - plots: ${migratedCounts.plots} items`);
    console.log(`   - franchise: ${migratedCounts.franchise} items`);
    console.log(`   - preleased: ${migratedCounts.preleased} items`);
    console.log(`   - vacant: ${migratedCounts.vacant} items`);
    console.log(`   - Total: ${Object.values(migratedCounts).reduce((a, b) => a + b, 0)} items\n`);
    
    // Proceed with cleanup
    for (const collection of legacyCollections) {
      try {
        console.log(`🗑️  Removing ${collection.name}...`);
        
        // Check if collection exists first
        const snapshot = await get(ref(database, collection.name));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const itemCount = typeof data === 'object' ? Object.keys(data).length : 0;
          
          console.log(`   📊 Found ${itemCount} items in ${collection.name}`);
          
          // Remove the collection by setting it to null
          await set(ref(database, collection.name), null);
          
          // Verify removal
          const verifySnapshot = await get(ref(database, collection.name));
          if (!verifySnapshot.exists()) {
            console.log(`   ✅ Successfully removed ${collection.name} (${itemCount} items)`);
            cleanupResults.removed.push({
              name: collection.name,
              itemCount: itemCount,
              description: collection.description
            });
          } else {
            throw new Error(`Failed to remove ${collection.name} - still exists after deletion`);
          }
          
        } else {
          console.log(`   ℹ️  ${collection.name} not found (already removed or never existed)`);
          cleanupResults.notFound.push(collection.name);
        }
        
        // Small delay between removals
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Error removing ${collection.name}:`, error.message);
        cleanupResults.errors.push({
          collection: collection.name,
          error: error.message
        });
      }
    }
    
    // Post-cleanup verification
    console.log('\n🔍 Post-cleanup verification...');
    const postMigratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (postMigratedSnapshot.exists()) {
      const postMigratedData = postMigratedSnapshot.val();
      const postCounts = {
        plots: postMigratedData.plots ? Object.keys(postMigratedData.plots).length : 0,
        franchise: postMigratedData.franchise ? Object.keys(postMigratedData.franchise).length : 0,
        preleased: postMigratedData.preleased ? Object.keys(postMigratedData.preleased).length : 0,
        vacant: postMigratedData.vacant ? Object.keys(postMigratedData.vacant).length : 0
      };
      
      console.log('✅ Migrated data still intact:');
      console.log(`   - plots: ${postCounts.plots} items`);
      console.log(`   - franchise: ${postCounts.franchise} items`);
      console.log(`   - preleased: ${postCounts.preleased} items`);
      console.log(`   - vacant: ${postCounts.vacant} items`);
      
      // Check data integrity
      const dataIntact = JSON.stringify(migratedCounts) === JSON.stringify(postCounts);
      if (dataIntact) {
        console.log('✅ Data integrity verified - all migrated data preserved');
      } else {
        console.log('⚠️  Data integrity warning - counts changed during cleanup');
        console.log('Before:', migratedCounts);
        console.log('After:', postCounts);
      }
    } else {
      throw new Error('❌ CRITICAL: migratedProperties disappeared during cleanup!');
    }
    
    // Summary report
    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`✅ Successfully removed: ${cleanupResults.removed.length} collections`);
    cleanupResults.removed.forEach(item => {
      console.log(`   - ${item.name}: ${item.itemCount} items removed`);
    });
    
    if (cleanupResults.notFound.length > 0) {
      console.log(`ℹ️  Not found: ${cleanupResults.notFound.join(', ')}`);
    }
    
    if (cleanupResults.errors.length > 0) {
      console.log(`❌ Errors: ${cleanupResults.errors.length}`);
      cleanupResults.errors.forEach(error => {
        console.log(`   - ${error.collection}: ${error.error}`);
      });
    }
    
    const totalItemsRemoved = cleanupResults.removed.reduce((sum, item) => sum + item.itemCount, 0);
    console.log(`\n📊 Total duplicate items removed: ${totalItemsRemoved}`);
    console.log('🎉 Legacy collection cleanup completed successfully!');
    console.log('✨ Database is now clean with only type-organized migratedProperties');
    
    return cleanupResults;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

cleanupLegacyCollections()
  .then(results => {
    console.log('\n🏁 CLEANUP COMPLETED SUCCESSFULLY');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 CLEANUP FAILED:', error.message);
    console.log('🔒 Migrated data should still be safe in migratedProperties');
    console.log('💾 Legacy data can be restored from backup: legacy-cleanup-2025-08-29T10-53-03-135Z');
    process.exit(1);
  });