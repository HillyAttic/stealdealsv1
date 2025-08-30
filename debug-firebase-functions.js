// Debug Firebase library functions
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// Simulate the getAllFranchises function behavior
async function testGetAllFranchises() {
  try {
    console.log('=== TESTING getAllFranchises LOGIC ===\n');
    
    const franchises = [];
    
    // Try migrated structure first (as updated function should do)
    console.log('📊 Checking migratedProperties/franchise...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties/franchise'));
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot) => {
        console.log(`Processing migrated franchise: ${childSnapshot.key}`);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'name' in data) {
          franchises.push({
            id: childSnapshot.key,
            ...data
          });
          console.log(`  ✅ Added: ${data.name}`);
        } else {
          console.log(`  ⚠️  Invalid data structure: ${childSnapshot.key}`);
        }
      });
    } else {
      console.log('❌ migratedProperties/franchise not found');
    }
    
    // Try legacy structure (as fallback)
    console.log('\n📊 Checking legacy franchiseProperties...');
    const legacySnapshot = await get(ref(database, 'franchiseProperties'));
    if (legacySnapshot.exists()) {
      console.log('⚠️  Legacy franchiseProperties still exists');
      legacySnapshot.forEach((childSnapshot) => {
        console.log(`Processing legacy franchise: ${childSnapshot.key}`);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'name' in data) {
          franchises.push({
            id: childSnapshot.key,
            ...data
          });
          console.log(`  ✅ Added from legacy: ${data.name}`);
        }
      });
    } else {
      console.log('✅ Legacy franchiseProperties properly deleted');
    }
    
    console.log(`\n📊 Total franchises found: ${franchises.length}`);
    franchises.slice(0, 3).forEach(franchise => {
      console.log(`  - ${franchise.id}: ${franchise.name}`);
    });
    
    return franchises;
    
  } catch (error) {
    console.error('❌ Error in getAllFranchises simulation:', error);
    throw error;
  }
}

// Simulate the getAllPlots function behavior  
async function testGetAllPlots() {
  try {
    console.log('\n=== TESTING getAllPlots LOGIC ===\n');
    
    const plots = [];
    
    // Try migrated structure first
    console.log('📊 Checking migratedProperties/plots...');
    const migratedSnapshot = await get(ref(database, 'migratedProperties/plots'));
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot) => {
        console.log(`Processing migrated plot: ${childSnapshot.key}`);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'project' in data && 'developerName' in data) {
          const plotData = {
            ...data,
            id: childSnapshot.key
          };
          plots.push(plotData);
          console.log(`  ✅ Added: ${data.project}`);
        } else {
          console.log(`  ⚠️  Invalid plot data structure: ${childSnapshot.key}`);
          console.log(`      Has project: ${'project' in (data || {})}`);
          console.log(`      Has developerName: ${'developerName' in (data || {})}`);
        }
      });
    } else {
      console.log('❌ migratedProperties/plots not found');
    }
    
    // Try legacy structure
    console.log('\n📊 Checking legacy plots...');
    const legacySnapshot = await get(ref(database, 'plots'));
    if (legacySnapshot.exists()) {
      console.log('⚠️  Legacy plots still exists');
      legacySnapshot.forEach((childSnapshot) => {
        console.log(`Processing legacy plot: ${childSnapshot.key}`);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'project' in data && 'developerName' in data) {
          const plotData = {
            ...data,
            id: childSnapshot.key
          };
          plots.push(plotData);
          console.log(`  ✅ Added from legacy: ${data.project}`);
        }
      });
    } else {
      console.log('✅ Legacy plots properly deleted');
    }
    
    console.log(`\n📊 Total plots found: ${plots.length}`);
    plots.slice(0, 3).forEach(plot => {
      console.log(`  - ${plot.id}: ${plot.project}`);
    });
    
    return plots;
    
  } catch (error) {
    console.error('❌ Error in getAllPlots simulation:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    const franchises = await testGetAllFranchises();
    const plots = await testGetAllPlots();
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Franchises found: ${franchises.length}`);
    console.log(`✅ Plots found: ${plots.length}`);
    console.log('\nIf these numbers are > 0 but API returns 0, there\'s an issue with the Firebase library functions.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();