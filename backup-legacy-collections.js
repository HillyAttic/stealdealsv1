// Safety backup script for all legacy collections before cleanup
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');
const fs = require('fs').promises;
const path = require('path');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function createLegacyBackup() {
  try {
    console.log('=== CREATING SAFETY BACKUP OF LEGACY COLLECTIONS ===\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `legacy-backup-${timestamp}`;
    
    // Legacy collections to backup
    const legacyCollections = [
      'plots',
      'franchiseProperties', 
      'preleasedProperties',
      'vacantProperties',
      'properties'
    ];
    
    const backupData = {};
    let totalItems = 0;
    
    // Backup each collection
    for (const collection of legacyCollections) {
      console.log(`📦 Backing up ${collection}...`);
      
      const snapshot = await get(ref(database, collection));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const itemCount = typeof data === 'object' ? Object.keys(data).length : 0;
        
        backupData[collection] = data;
        totalItems += itemCount;
        
        console.log(`   ✅ ${collection}: ${itemCount} items backed up`);
      } else {
        console.log(`   ⚠️  ${collection}: Collection empty or not found`);
        backupData[collection] = null;
      }
    }
    
    // Save backup to Firebase backups collection
    const backupKey = `legacy-cleanup-${timestamp}`;
    console.log(`\n💾 Saving backup to Firebase: /backups/${backupKey}`);
    
    await set(ref(database, `backups/${backupKey}`), {
      timestamp: Date.now(),
      description: 'Pre-cleanup backup of all legacy collections',
      totalItems: totalItems,
      collections: Object.keys(backupData).filter(k => backupData[k] !== null),
      data: backupData
    });
    
    // Also save to local file for extra safety
    const localBackupPath = path.join(__dirname, `${backupKey}.json`);
    await fs.writeFile(localBackupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Firebase backup created: /backups/${backupKey}`);
    console.log(`✅ Local backup created: ${localBackupPath}`);
    console.log(`📊 Total items backed up: ${totalItems}`);
    
    // Verify backup integrity
    console.log('\n🔍 Verifying backup integrity...');
    const verifySnapshot = await get(ref(database, `backups/${backupKey}`));
    if (verifySnapshot.exists()) {
      const backup = verifySnapshot.val();
      console.log(`✅ Backup verification successful: ${backup.totalItems} items`);
      console.log(`📅 Backup timestamp: ${new Date(backup.timestamp).toISOString()}`);
    } else {
      throw new Error('Backup verification failed - backup not found!');
    }
    
    console.log('\n=== BACKUP COMPLETED SUCCESSFULLY ===');
    console.log('🔒 All legacy collections are now safely backed up');
    console.log('✅ Ready to proceed with legacy collection cleanup');
    
    return backupKey;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

createLegacyBackup()
  .then(backupKey => {
    console.log(`\n🎉 SUCCESS: Backup completed with key: ${backupKey}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 BACKUP FAILED:', error.message);
    process.exit(1);
  });