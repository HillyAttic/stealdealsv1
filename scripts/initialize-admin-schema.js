/**
 * Script to initialize the admin user management schema
 * Run this once during setup: node scripts/initialize-admin-schema.js
 */

const { initializeAdminSchema, createInitialSuperuser } = require('../src/lib/admin/initializeAdminSchema');

async function main() {
  try {
    console.log('🚀 Starting admin schema initialization...\n');

    // Initialize the schema
    const result = await initializeAdminSchema();
    
    if (!result.success) {
      console.error('❌ Schema initialization failed:', result.error);
      process.exit(1);
    }

    console.log('✅ Schema initialization completed successfully!');
    console.log('📊 Migration results:');
    
    result.results.migrationResults.forEach(migration => {
      if (migration.success) {
        console.log(`  ✅ ${migration.collection}: ${migration.migratedCount} properties migrated`);
      } else {
        console.log(`  ❌ ${migration.collection}: ${migration.error}`);
      }
    });

    // Prompt for superuser creation
    console.log('\n🔐 To create an initial superuser, use the following API call:');
    console.log('POST /api/admin/initialize');
    console.log('Body: {');
    console.log('  "createSuperuser": true,');
    console.log('  "superuserData": {');
    console.log('    "email": "admin@yourdomain.com",');
    console.log('    "password": "your-secure-password",');
    console.log('    "name": "System Administrator"');
    console.log('  }');
    console.log('}');

    console.log('\n✨ Admin schema is ready for use!');
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
main();