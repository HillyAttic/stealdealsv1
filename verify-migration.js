// Verification script to check migration status
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function verifyMigration() {
  try {
    console.log('=== VERIFYING MIGRATION STATUS ===\n');
    
    // Check migratedProperties structure
    const migratedSnapshot = await get(ref(database, 'migratedProperties'));
    if (migratedSnapshot.exists()) {
      const migrated = migratedSnapshot.val();
      console.log('✅ migratedProperties exists');
      console.log('Collections found:', Object.keys(migrated));
      
      // Check each collection
      if (migrated.plots) {
        console.log(`\n📊 PLOTS: ${Object.keys(migrated.plots).length} items`);
        Object.keys(migrated.plots).slice(0, 3).forEach(id => {
          console.log(`  - ${id}: ${migrated.plots[id].title}`);
        });
      } else {
        console.log('❌ No plots collection found in migratedProperties');
      }
      
      if (migrated.franchise) {
        console.log(`\n📊 FRANCHISE: ${Object.keys(migrated.franchise).length} items`);
        Object.keys(migrated.franchise).slice(0, 2).forEach(id => {
          console.log(`  - ${id}: ${migrated.franchise[id].title}`);
        });
      }
      
      if (migrated.preleased) {
        console.log(`\n📊 PRELEASED: ${Object.keys(migrated.preleased).length} items`);
      }
      
      if (migrated.vacant) {
        console.log(`\n📊 VACANT: ${Object.keys(migrated.vacant).length} items`);
      }
      
    } else {
      console.log('❌ migratedProperties does not exist');
    }
    
    // Check original plots collection still exists
    console.log('\n--- Original Collections Status ---');
    const originalPlotsSnapshot = await get(ref(database, 'plots'));
    if (originalPlotsSnapshot.exists()) {
      console.log(`✅ Original plots collection still exists: ${Object.keys(originalPlotsSnapshot.val()).length} items`);
    } else {
      console.log('❌ Original plots collection no longer exists');
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyMigration();