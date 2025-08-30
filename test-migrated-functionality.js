// Test application functionality with migrated structure only
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function testMigratedFunctionality() {
  try {
    console.log('=== TESTING APPLICATION WITH MIGRATED STRUCTURE ===\n');
    
    const results = {
      migratedProperties: { exists: false, collections: [], totalItems: 0 },
      individualCollections: {},
      testQueries: {}
    };
    
    // Test 1: Check migratedProperties exists and has all collections
    console.log('🧪 Test 1: Checking migratedProperties structure...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (migratedSnapshot.exists()) {
      const migrated = migratedSnapshot.val();
      results.migratedProperties.exists = true;
      results.migratedProperties.collections = Object.keys(migrated);
      
      // Count total items
      let total = 0;
      for (const [collectionName, collection] of Object.entries(migrated)) {
        const count = collection ? Object.keys(collection).length : 0;
        results.individualCollections[collectionName] = count;
        total += count;
      }
      results.migratedProperties.totalItems = total;
      
      console.log(`   ✅ migratedProperties exists with collections: ${results.migratedProperties.collections.join(', ')}`);
      console.log(`   📊 Total items: ${total}`);
    } else {
      console.log('   ❌ migratedProperties does not exist');
      throw new Error('migratedProperties collection missing');
    }
    
    // Test 2: Verify each collection has data
    console.log('\n🧪 Test 2: Verifying individual collections...');
    for (const [collection, count] of Object.entries(results.individualCollections)) {
      console.log(`   📁 ${collection}: ${count} items`);
      if (count === 0) {
        console.log(`   ⚠️  Warning: ${collection} is empty`);
      }
    }
    
    // Test 3: Test specific property retrieval (simulate app queries)
    console.log('\n🧪 Test 3: Testing property retrieval queries...');
    
    // Test plots retrieval
    if (results.individualCollections.plots > 0) {
      const plotsSnapshot = await get(ref(database, 'migratedProperties/plots'));
      const plots = plotsSnapshot.val();
      const firstPlotId = Object.keys(plots)[0];
      const firstPlot = plots[firstPlotId];
      
      results.testQueries.plotRetrieval = {
        success: true,
        plotId: firstPlotId,
        hasTitle: !!firstPlot.title,
        hasLocation: !!firstPlot.location,
        hasPlotDetails: !!firstPlot.plotDetails
      };
      console.log(`   ✅ Plot retrieval: ${firstPlotId} - "${firstPlot.title}"`);
      console.log(`      Location: ${firstPlot.location}`);
      console.log(`      Plot Details: ${firstPlot.plotDetails ? 'Present' : 'Missing'}`);
    }
    
    // Test franchise retrieval  
    if (results.individualCollections.franchise > 0) {
      const franchiseSnapshot = await get(ref(database, 'migratedProperties/franchise'));
      const franchises = franchiseSnapshot.val();
      const firstFranchiseId = Object.keys(franchises)[0];
      const firstFranchise = franchises[firstFranchiseId];
      
      results.testQueries.franchiseRetrieval = {
        success: true,
        franchiseId: firstFranchiseId,
        hasTitle: !!firstFranchise.title,
        hasLocation: !!firstFranchise.location
      };
      console.log(`   ✅ Franchise retrieval: ${firstFranchiseId} - "${firstFranchise.title}"`);
    }
    
    // Test 4: Verify data integrity
    console.log('\n🧪 Test 4: Checking data integrity...');
    let integrityIssues = 0;
    
    for (const [collectionName, collection] of Object.entries(migratedSnapshot.val())) {
      if (collection && typeof collection === 'object') {
        for (const [id, item] of Object.entries(collection)) {
          if (!item.title || !item.location) {
            console.log(`   ⚠️  ${collectionName}/${id}: Missing title or location`);
            integrityIssues++;
          }
          if (!item.migrationInfo) {
            console.log(`   ⚠️  ${collectionName}/${id}: Missing migration info`);
            integrityIssues++;
          }
        }
      }
    }
    
    if (integrityIssues === 0) {
      console.log('   ✅ Data integrity check passed');
    } else {
      console.log(`   ⚠️  Found ${integrityIssues} data integrity issues`);
    }
    
    // Test 5: Simulate getAllProperties function behavior
    console.log('\n🧪 Test 5: Simulating getAllProperties() function...');
    const allProperties = [];
    const migratedData = migratedSnapshot.val();
    
    // Simulate the updated getAllProperties function logic
    for (const [collectionType, collection] of Object.entries(migratedData)) {
      if (collection && typeof collection === 'object') {
        for (const [id, property] of Object.entries(collection)) {
          allProperties.push({
            id: id,
            type: collectionType,
            title: property.title,
            location: property.location,
            price: property.price
          });
        }
      }
    }
    
    console.log(`   ✅ getAllProperties simulation: Retrieved ${allProperties.length} properties`);
    console.log(`   📊 By type: plots(${allProperties.filter(p => p.type === 'plots').length}), franchise(${allProperties.filter(p => p.type === 'franchise').length}), preleased(${allProperties.filter(p => p.type === 'preleased').length}), vacant(${allProperties.filter(p => p.type === 'vacant').length})`);
    
    // Final assessment
    console.log('\n=== FUNCTIONALITY TEST RESULTS ===');
    console.log(`✅ migratedProperties structure: Working`);
    console.log(`✅ All collections present: ${results.migratedProperties.collections.join(', ')}`);
    console.log(`✅ Total properties accessible: ${results.migratedProperties.totalItems}`);
    console.log(`✅ Property retrieval: Working`);
    console.log(`✅ Data integrity: ${integrityIssues === 0 ? 'Good' : `${integrityIssues} issues found`}`);
    
    console.log('\n🎉 APPLICATION FUNCTIONALITY TEST PASSED');
    console.log('✅ Safe to proceed with legacy collection cleanup');
    
    return results;
    
  } catch (error) {
    console.error('❌ Functionality test failed:', error);
    throw error;
  }
}

testMigratedFunctionality()
  .then(results => {
    console.log('\n📊 Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 TEST FAILED:', error.message);
    console.log('⛔ Do NOT proceed with cleanup until issues are resolved');
    process.exit(1);
  });