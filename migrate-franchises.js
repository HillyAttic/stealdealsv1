// Simple script to run the franchise migration
// Run this with: node migrate-franchises.js

const fetch = require('node-fetch');

async function runMigration() {
  try {
    console.log('Checking migration status...');
    
    // First check what needs migration
    const checkResponse = await fetch('http://localhost:3000/api/admin/migrate-franchises', {
      method: 'GET'
    });
    
    if (!checkResponse.ok) {
      throw new Error(`Check failed: ${checkResponse.status}`);
    }
    
    const checkResult = await checkResponse.json();
    console.log('Migration status:', checkResult);
    
    if (checkResult.needsMigration > 0) {
      console.log(`Found ${checkResult.needsMigration} franchises that need migration.`);
      
      // Run the migration
      console.log('Running migration...');
      const migrateResponse = await fetch('http://localhost:3000/api/admin/migrate-franchises', {
        method: 'POST'
      });
      
      if (!migrateResponse.ok) {
        throw new Error(`Migration failed: ${migrateResponse.status}`);
      }
      
      const migrateResult = await migrateResponse.json();
      console.log('Migration result:', migrateResult);
    } else {
      console.log('No franchises need migration.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();