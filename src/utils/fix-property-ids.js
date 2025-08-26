#!/usr/bin/env node

// Data migration utility to fix properties with empty IDs
// This script ensures all properties have their Firebase key as their ID field

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update, child } = require('firebase/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Collection references
const collections = [
  { name: 'vacantProperties', ref: ref(database, 'vacantProperties') },
  { name: 'preleasedProperties', ref: ref(database, 'preleasedProperties') },
  { name: 'properties (legacy)', ref: ref(database, 'properties') }
];

async function fixPropertyIds() {
  console.log('🚀 Starting property ID migration...\n');
  
  let totalFixed = 0;
  let totalChecked = 0;
  
  for (const collection of collections) {
    console.log(`📁 Processing ${collection.name}...`);
    
    try {
      const snapshot = await get(collection.ref);
      
      if (!snapshot.exists()) {
        console.log(`   ⚪ No data found in ${collection.name}`);
        continue;
      }
      
      let collectionFixed = 0;
      let collectionChecked = 0;
      const updates = {};
      
      snapshot.forEach((childSnapshot) => {
        const propertyKey = childSnapshot.key;
        const propertyData = childSnapshot.val();
        
        collectionChecked++;
        totalChecked++;
        
        // Check if the property has an empty or missing ID field
        if (!propertyData.id || propertyData.id === '') {
          console.log(`   🔧 Fixing property ${propertyKey}: empty id field`);
          updates[`${propertyKey}/id`] = propertyKey;
          collectionFixed++;
          totalFixed++;
        } else if (propertyData.id !== propertyKey) {
          console.log(`   🔧 Fixing property ${propertyKey}: id mismatch (${propertyData.id} → ${propertyKey})`);
          updates[`${propertyKey}/id`] = propertyKey;
          collectionFixed++;
          totalFixed++;
        }
      });
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        console.log(`   💾 Updating ${Object.keys(updates).length} properties...`);
        await update(collection.ref, updates);
        console.log(`   ✅ Successfully updated ${collectionFixed} properties in ${collection.name}`);
      } else {
        console.log(`   ✅ All ${collectionChecked} properties in ${collection.name} already have correct IDs`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${collection.name}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('📊 Migration Summary:');
  console.log(`   Total properties checked: ${totalChecked}`);
  console.log(`   Total properties fixed: ${totalFixed}`);
  
  if (totalFixed > 0) {
    console.log('✅ Migration completed successfully!');
  } else {
    console.log('✅ No properties needed fixing - all IDs are correct!');
  }
}

async function validateFix() {
  console.log('\n🔍 Validating the fix...\n');
  
  let totalProperties = 0;
  let propertiesWithCorrectIds = 0;
  let propertiesWithEmptyIds = 0;
  let propertiesWithMismatchedIds = 0;
  
  for (const collection of collections) {
    console.log(`📁 Validating ${collection.name}...`);
    
    try {
      const snapshot = await get(collection.ref);
      
      if (!snapshot.exists()) {
        console.log(`   ⚪ No data found in ${collection.name}`);
        continue;
      }
      
      let collectionTotal = 0;
      let collectionCorrect = 0;
      let collectionEmpty = 0;
      let collectionMismatched = 0;
      
      snapshot.forEach((childSnapshot) => {
        const propertyKey = childSnapshot.key;
        const propertyData = childSnapshot.val();
        
        collectionTotal++;
        totalProperties++;
        
        if (!propertyData.id || propertyData.id === '') {
          collectionEmpty++;
          propertiesWithEmptyIds++;
          console.log(`   ❌ Property ${propertyKey}: empty id field`);
        } else if (propertyData.id !== propertyKey) {
          collectionMismatched++;
          propertiesWithMismatchedIds++;
          console.log(`   ❌ Property ${propertyKey}: id mismatch (${propertyData.id} ≠ ${propertyKey})`);
        } else {
          collectionCorrect++;
          propertiesWithCorrectIds++;
        }
      });
      
      console.log(`   ✅ ${collectionCorrect}/${collectionTotal} properties have correct IDs`);
      if (collectionEmpty > 0) console.log(`   ❌ ${collectionEmpty} properties have empty IDs`);
      if (collectionMismatched > 0) console.log(`   ❌ ${collectionMismatched} properties have mismatched IDs`);
      
    } catch (error) {
      console.error(`   ❌ Error validating ${collection.name}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('📊 Validation Summary:');
  console.log(`   Total properties: ${totalProperties}`);
  console.log(`   Properties with correct IDs: ${propertiesWithCorrectIds}`);
  console.log(`   Properties with empty IDs: ${propertiesWithEmptyIds}`);
  console.log(`   Properties with mismatched IDs: ${propertiesWithMismatchedIds}`);
  
  if (propertiesWithEmptyIds === 0 && propertiesWithMismatchedIds === 0) {
    console.log('🎉 All properties have correct IDs!');
  } else {
    console.log('⚠️  Some properties still have ID issues.');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix';
  
  if (command === 'validate') {
    await validateFix();
  } else if (command === 'fix') {
    await fixPropertyIds();
    await validateFix();
  } else {
    console.log('Usage:');
    console.log('  node fix-property-ids.js fix      # Fix property IDs and validate');
    console.log('  node fix-property-ids.js validate # Only validate existing IDs');
  }
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

if (require.main === module) {
  main();
}