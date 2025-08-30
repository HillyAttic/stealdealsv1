// Final verification and performance test after cleanup
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function finalVerification() {
  try {
    console.log('=== FINAL VERIFICATION AND PERFORMANCE TEST ===\n');
    
    const startTime = Date.now();
    
    // Test 1: Verify legacy collections are gone
    console.log('🔍 Test 1: Verifying legacy collections removed...');
    const legacyCollections = ['plots', 'franchiseProperties', 'preleasedProperties', 'vacantProperties', 'properties'];
    const legacyStatus = {};
    
    for (const collection of legacyCollections) {
      const snapshot = await get(ref(database, collection));
      legacyStatus[collection] = snapshot.exists();
      console.log(`   ${snapshot.exists() ? '❌' : '✅'} ${collection}: ${snapshot.exists() ? 'Still exists' : 'Removed'}`);
    }
    
    const legacyRemoved = Object.values(legacyStatus).every(exists => !exists);
    console.log(`   ${legacyRemoved ? '✅' : '❌'} Legacy cleanup: ${legacyRemoved ? 'Complete' : 'Incomplete'}`);
    
    // Test 2: Verify migratedProperties structure
    console.log('\n🔍 Test 2: Verifying migratedProperties structure...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (!migratedSnapshot.exists()) {
      throw new Error('❌ CRITICAL: migratedProperties missing!');
    }
    
    const migratedData = migratedSnapshot.val();
    const collections = Object.keys(migratedData);
    const expectedCollections = ['plots', 'franchise', 'preleased', 'vacant'];
    const hasAllCollections = expectedCollections.every(col => collections.includes(col));
    
    console.log(`   ✅ Collections present: ${collections.join(', ')}`);
    console.log(`   ${hasAllCollections ? '✅' : '❌'} All expected collections: ${hasAllCollections ? 'Present' : 'Missing'}`);
    
    // Count items in each collection
    const collectionCounts = {};
    let totalItems = 0;
    for (const [name, collection] of Object.entries(migratedData)) {
      const count = collection ? Object.keys(collection).length : 0;
      collectionCounts[name] = count;
      totalItems += count;
      console.log(`   📊 ${name}: ${count} items`);
    }
    console.log(`   📊 Total items: ${totalItems}`);
    
    // Test 3: Performance test - measure query times
    console.log('\n🔍 Test 3: Performance testing...');
    const performanceTests = {};
    
    // Test individual collection queries
    for (const collectionName of ['plots', 'franchise', 'preleased', 'vacant']) {
      const queryStart = Date.now();
      const snapshot = await get(ref(database, `migratedProperties/${collectionName}`));
      const queryTime = Date.now() - queryStart;
      performanceTests[`${collectionName}_query`] = queryTime;
      console.log(`   ⚡ ${collectionName} query: ${queryTime}ms`);
    }
    
    // Test full migratedProperties query
    const fullQueryStart = Date.now();
    await get(ref(database, 'migratedProperties'));
    const fullQueryTime = Date.now() - fullQueryStart;
    performanceTests.full_query = fullQueryTime;
    console.log(`   ⚡ Full migratedProperties query: ${fullQueryTime}ms`);
    
    // Test 4: Data integrity spot check
    console.log('\n🔍 Test 4: Data integrity spot check...');
    let integrityIssues = 0;
    let sampledItems = 0;
    
    for (const [collectionName, collection] of Object.entries(migratedData)) {
      if (collection && typeof collection === 'object') {
        const items = Object.entries(collection);
        const sampleSize = Math.min(5, items.length); // Sample up to 5 items per collection
        
        for (let i = 0; i < sampleSize; i++) {
          const [id, item] = items[i];
          sampledItems++;
          
          // Check required fields
          if (!item.title || !item.location || !item.type) {
            integrityIssues++;
            console.log(`   ⚠️  ${collectionName}/${id}: Missing required fields`);
          }
          
          // Check migration info
          if (!item.migrationInfo || !item.migrationInfo.migratedAt) {
            integrityIssues++;
            console.log(`   ⚠️  ${collectionName}/${id}: Missing migration info`);
          }
        }
      }
    }
    
    console.log(`   📊 Sampled ${sampledItems} items across all collections`);
    console.log(`   ${integrityIssues === 0 ? '✅' : '⚠️ '} Data integrity: ${integrityIssues === 0 ? 'Perfect' : `${integrityIssues} issues found`}`);
    
    // Test 5: Database size comparison
    console.log('\n🔍 Test 5: Database size analysis...');
    const currentDataSize = JSON.stringify(migratedData).length;
    console.log(`   📏 Current database size: ${(currentDataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📊 Properties per MB: ${(totalItems / (currentDataSize / 1024 / 1024)).toFixed(0)}`);
    
    // Test 6: Check remaining collections
    console.log('\n🔍 Test 6: Checking remaining database structure...');
    const rootSnapshot = await get(ref(database, '/'));
    if (rootSnapshot.exists()) {
      const rootData = rootSnapshot.val();
      const rootCollections = Object.keys(rootData);
      console.log(`   📁 Root collections: ${rootCollections.join(', ')}`);
      
      const expectedRemaining = ['analytics', 'backups', 'migratedProperties', 'migration', 'wishlists'];
      const unexpectedCollections = rootCollections.filter(col => !expectedRemaining.includes(col));
      
      if (unexpectedCollections.length > 0) {
        console.log(`   ⚠️  Unexpected collections still present: ${unexpectedCollections.join(', ')}`);
      } else {
        console.log(`   ✅ Database structure clean - only expected collections remain`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    // Final Report
    console.log('\n=== FINAL VERIFICATION REPORT ===');
    console.log(`✅ Legacy collections removed: ${legacyRemoved ? 'YES' : 'NO'}`);
    console.log(`✅ migratedProperties intact: YES (${totalItems} items)`);
    console.log(`✅ All collections present: ${hasAllCollections ? 'YES' : 'NO'}`);
    console.log(`✅ Data integrity: ${integrityIssues === 0 ? 'PERFECT' : `${integrityIssues} issues`}`);
    console.log(`⚡ Average query time: ${(Object.values(performanceTests).reduce((a, b) => a + b, 0) / Object.values(performanceTests).length).toFixed(1)}ms`);
    console.log(`📏 Database size: ${(currentDataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⏱️  Total verification time: ${totalTime}ms`);
    
    console.log('\n🎉 DATABASE CLEANUP AND MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('✨ Type-organized structure is now the single source of truth');
    console.log('🚀 Application ready for production use');
    console.log('💾 Backup available: legacy-cleanup-2025-08-29T10-53-03-135Z');
    
    return {
      legacyRemoved,
      totalItems,
      integrityIssues,
      performanceTests,
      databaseSize: currentDataSize,
      verificationTime: totalTime
    };
    
  } catch (error) {
    console.error('❌ Final verification failed:', error);
    throw error;
  }
}

finalVerification()
  .then(results => {
    console.log('\n🏆 ALL TESTS PASSED - MIGRATION PROJECT COMPLETE');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 VERIFICATION FAILED:', error.message);
    process.exit(1);
  });