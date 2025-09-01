// Firebase connection utility for terminal scripts
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get, set, update } = require('firebase/database');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

// Initialize Firebase for scripts
function initializeFirebaseForScript() {
  loadEnvVars();

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
  };

  // Validate required fields
  const requiredFields = ['apiKey', 'projectId', 'databaseURL'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

  if (missingFields.length > 0) {
    throw new Error(`Firebase configuration missing required fields: ${missingFields.join(', ')}`);
  }

  // Initialize Firebase app if not already initialized
  let app;
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  const database = getDatabase(app);
  
  console.log('🔥 Firebase initialized successfully');
  return database;
}

// Utility function to remove undefined values from objects
function removeUndefinedValues(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefinedValues(value);
    }
  }
  return cleaned;
}

// Batch write to Firebase with rate limiting
async function batchWriteToFirebase(basePath, updates, batchSize = 10) {
  const database = getDatabase();
  const entries = Object.entries(updates);
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const batchUpdates = {};
    
    batch.forEach(([key, value]) => {
      batchUpdates[`${basePath}/${key}`] = removeUndefinedValues(value);
    });
    
    await update(ref(database), batchUpdates);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < entries.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

module.exports = {
  initializeFirebaseForScript,
  removeUndefinedValues,
  batchWriteToFirebase,
  ref,
  get,
  set,
  update
};