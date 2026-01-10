import { AdminUserService } from './adminUserService';
import { PropertyOwnershipService } from './propertyOwnershipService';

/**
 * Initialize the admin user management database schema
 * This should be run once during setup or deployment
 */
export async function initializeAdminSchema(): Promise<{
  success: boolean;
  results: {
    schemaInit: boolean;
    migrationResults: Array<{
      collection: string;
      success: boolean;
      migratedCount: number;
      error?: string;
    }>;
  };
  error?: string;
}> {
  try {
    console.log('Initializing admin user management schema...');

    // Initialize admin_users collection
    const schemaResult = await AdminUserService.initializeSchema();
    
    if (!schemaResult.success) {
      return {
        success: false,
        results: {
          schemaInit: false,
          migrationResults: [],
        },
        error: schemaResult.error,
      };
    }

    console.log('Admin users schema initialized successfully');

    // Migrate existing properties to include ownership information
    const collections = PropertyOwnershipService.getPropertyCollections();
    const migrationResults = [];

    // Use a default admin UID for existing properties (this should be updated with actual superuser UID)
    const defaultAdminUid = 'system-migration';

    for (const collection of collections) {
      console.log(`Migrating ${collection} collection...`);
      
      const migrationResult = await PropertyOwnershipService.migrateExistingProperties(
        collection,
        defaultAdminUid
      );

      migrationResults.push({
        collection,
        success: migrationResult.success,
        migratedCount: migrationResult.migratedCount,
        error: migrationResult.error,
      });

      if (migrationResult.success) {
        console.log(`Migrated ${migrationResult.migratedCount} properties in ${collection}`);
      } else {
        console.error(`Failed to migrate ${collection}:`, migrationResult.error);
      }
    }

    console.log('Schema initialization completed');

    return {
      success: true,
      results: {
        schemaInit: true,
        migrationResults,
      },
    };
  } catch (error) {
    console.error('Error during schema initialization:', error);
    return {
      success: false,
      results: {
        schemaInit: false,
        migrationResults: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create the first superuser account
 * This should be run after schema initialization
 */
export async function createInitialSuperuser(
  email: string,
  password: string,
  name: string = 'System Administrator'
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('Creating initial superuser account...');

    const result = await AdminUserService.createAdminUser({
      name,
      email,
      password,
      role: 'superuser',
      permissions: {
        pages: {
          vacant: true,
          plots: true,
          franchise: true,
          preleased: true,
        },
        viewOthers: true,
        editOthers: true,
      },
      createdBy: 'system-init', // System-created user
    });

    if (result.success) {
      console.log('Initial superuser created successfully');
      
      // Update existing properties to be owned by this superuser instead of system-migration
      if (result.user) {
        const collections = PropertyOwnershipService.getPropertyCollections();
        for (const collection of collections) {
          await PropertyOwnershipService.migrateExistingProperties(
            collection,
            result.user.uid
          );
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error creating initial superuser:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}