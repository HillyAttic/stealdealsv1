// Test API endpoints to see what's happening
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function testApiEndpoints() {
  try {
    console.log('=== TESTING API ENDPOINT DATA ACCESS ===\n');
    
    // Test 1: Check migrated data directly
    console.log('📊 Test 1: Direct access to migratedProperties...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (migratedSnapshot.exists()) {
      const migrated = migratedSnapshot.val();
      console.log('   ✅ migratedProperties exists');
      console.log('   📁 Collections:', Object.keys(migrated));
      
      for (const [type, collection] of Object.entries(migrated)) {
        const count = collection ? Object.keys(collection).length : 0;
        console.log(`   📊 ${type}: ${count} items`);
        
        if (count > 0) {
          const sampleId = Object.keys(collection)[0];
          const sample = collection[sampleId];
          console.log(`      Sample ${type}: ${sampleId} - "${sample.title || sample.name || 'No title'}"`);
        }
      }
    } else {
      console.log('   ❌ migratedProperties does not exist');
    }
    
    // Test 2: Test individual collections
    console.log('\n📊 Test 2: Individual collection access...');
    const collections = ['franchise', 'plots', 'preleased', 'vacant'];
    
    for (const collection of collections) {
      const snapshot = await get(ref(database, `migratedProperties/${collection}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = Object.keys(data).length;
        console.log(`   ✅ migratedProperties/${collection}: ${count} items`);
        
        if (count > 0) {
          const firstKey = Object.keys(data)[0];
          const firstItem = data[firstKey];
          console.log(`      First item: ${firstKey} - "${firstItem.title || firstItem.name || 'No title'}"`);
        }
      } else {
        console.log(`   ❌ migratedProperties/${collection}: Not found`);
      }
    }
    
    // Test 3: Test API endpoint calls
    console.log('\n📊 Test 3: Testing actual API endpoints...');
    try {
      console.log('   🌐 Testing /api/franchises...');
      const franchiseResponse = await fetch('http://localhost:3000/api/franchises');
      const franchiseData = await franchiseResponse.json();
      console.log(`   📊 Franchise API response: ${franchiseData.franchises?.length || 0} items`);
      if (franchiseData.error) {
        console.log(`   ❌ Error: ${franchiseData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Franchise API error: ${error.message}`);
    }
    
    try {
      console.log('   🌐 Testing /api/plots...');
      const plotsResponse = await fetch('http://localhost:3000/api/plots');
      const plotsData = await plotsResponse.json();
      console.log(`   📊 Plots API response: ${plotsData.plots?.length || 0} items`);
      if (plotsData.error) {
        console.log(`   ❌ Error: ${plotsData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Plots API error: ${error.message}`);
    }
    
    try {
      console.log('   🌐 Testing /api/properties...');
      const propertiesResponse = await fetch('http://localhost:3000/api/properties');
      const propertiesData = await propertiesResponse.json();
      console.log(`   📊 Properties API response: ${propertiesData.properties?.length || 0} items`);
      if (propertiesData.error) {
        console.log(`   ❌ Error: ${propertiesData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Properties API error: ${error.message}`);
    }
    
    console.log('\n=== API ENDPOINT TEST COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApiEndpoints();