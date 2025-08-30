// Direct migration test script to run without authentication
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get, set, remove } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// Simple test to see plots data structure and move one plot to test
async function testPlotsStructure() {
  try {
    console.log('Fetching plots collection...');
    const plotsSnapshot = await get(ref(database, 'plots'));
    
    if (plotsSnapshot.exists()) {
      const plots = plotsSnapshot.val();
      console.log('Plots data type:', typeof plots);
      console.log('Plot keys:', Object.keys(plots));
      console.log('First plot sample:', JSON.stringify(Object.values(plots)[0], null, 2));
      
      // Test creating a single plot in migratedProperties/plots/
      const firstPlotKey = Object.keys(plots)[0];
      const firstPlot = plots[firstPlotKey];
      
      console.log('\nTesting migration of first plot...');
      await set(ref(database, `migratedProperties/plots/TEST_PLOT_001`), {
        ...firstPlot,
        migrationInfo: {
          originalKey: firstPlotKey,
          migratedAt: Date.now(),
          testMigration: true
        }
      });
      
      console.log('✅ Successfully created test plot in migratedProperties/plots/TEST_PLOT_001');
      
    } else {
      console.log('No plots found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPlotsStructure();