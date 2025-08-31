/**
 * Cleanup script for Firebase phantom connections
 * Removes "user-1" test data and other development artifacts
 */

const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, remove, get } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function cleanupPhantomConnections() {
  console.log('🧹 Starting Firebase phantom connections cleanup...');
  
  try {
    // Initialize Firebase
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    const database = getDatabase(app);
    
    // Paths to clean up
    const pathsToClean = [
      'wishlist/user-1',
      'userActivity/user-1',
      'users/user-1',
      'sessions/user-1'
    ];
    
    let cleanedCount = 0;
    
    for (const path of pathsToClean) {
      console.log(`🔍 Checking path: ${path}`);
      
      const dataRef = ref(database, path);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        console.log(`❌ Found phantom data at ${path}, removing...`);
        await remove(dataRef);
        cleanedCount++;
        console.log(`✅ Removed phantom data from ${path}`);
      } else {
        console.log(`✅ No data found at ${path}`);
      }
    }
    
    // Check for any other "user-1" references
    console.log('🔍 Scanning for other user-1 references...');
    
    const rootRef = ref(database);
    const rootSnapshot = await get(rootRef);
    
    if (rootSnapshot.exists()) {
      const data = rootSnapshot.val();
      const user1Paths = findUser1Paths(data, '');
      
      for (const user1Path of user1Paths) {
        if (!pathsToClean.includes(user1Path)) {
          console.log(`⚠️  Found additional user-1 data at: ${user1Path}`);
          const pathRef = ref(database, user1Path);
          await remove(pathRef);
          cleanedCount++;
          console.log(`✅ Removed additional phantom data from ${user1Path}`);
        }
      }
    }
    
    console.log(`🎉 Cleanup completed! Removed ${cleanedCount} phantom data entries.`);
    console.log('✅ Firebase should now have significantly fewer connections.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

function findUser1Paths(obj, currentPath) {
  const paths = [];
  
  if (typeof obj !== 'object' || obj === null) {
    return paths;
  }
  
  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}/${key}` : key;
    
    if (key === 'user-1') {
      paths.push(newPath);
    } else if (typeof obj[key] === 'object') {
      paths.push(...findUser1Paths(obj[key], newPath));
    }
  }
  
  return paths;
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupPhantomConnections().then(() => {
    console.log('🏁 Script completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { cleanupPhantomConnections };