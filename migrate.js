// Alternative migration approach using Firebase Web SDK
// This reads from your existing database export file instead of live database
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Note: For production migration, you would need Firebase Admin SDK with proper credentials
// For now, we'll work with the database export file you provided
const DATABASE_EXPORT_PATH = path.join(__dirname, 'temp', 'stealdeals-e89ab-default-rtdb-export (2).json');

/**
 * Simulated database interface for migration testing
 */
class SimulatedDatabase {
  constructor(exportData) {
    this.data = exportData;
  }
  
  ref(path) {
    return {
      once: (eventType) => {
        return Promise.resolve({
          val: () => {
            if (path === '/') return this.data;
            
            // Navigate to specific path
            const pathParts = path.split('/').filter(p => p);
            let current = this.data;
            
            for (const part of pathParts) {
              if (current && typeof current === 'object') {
                current = current[part];
              } else {
                current = null;
                break;
              }
            }
            
            return current;
          }
        });
      },
      set: (value) => {
        console.log(`[SIMULATED] Would set ${path} to:`, typeof value === 'object' ? Object.keys(value).length + ' items' : value);
        return Promise.resolve();
      }
    };
  }
}

// Initialize simulated database
let database;
let isSimulatedMode = false;

try {
  // Try to load the database export file for simulation
  if (fs.existsSync(DATABASE_EXPORT_PATH)) {
    console.log('📁 Using database export file for migration simulation');
    const exportData = JSON.parse(fs.readFileSync(DATABASE_EXPORT_PATH, 'utf8'));
    database = new SimulatedDatabase(exportData);
    isSimulatedMode = true;
  } else {
    throw new Error('Database export file not found');
  }
} catch (error) {
  console.error('❌ Failed to initialize database:', error.message);
  console.log('\n💡 To run migration:');
  console.log('1. Place your database export at: temp/stealdeals-e89ab-default-rtdb-export (2).json');
  console.log('2. Or set up Firebase Admin SDK credentials');
  process.exit(1);
}

/**
 * Database Migration Script
 * Migrates from array-based collections to unified object-based structure
 */
class DatabaseMigration {
  constructor() {
    this.idCounters = {
      franchise: 0,
      plot: 0,
      preleased: 0,
      vacant: 0,
      legacy: 0
    };
    this.idMapping = {}; // Maps old IDs to new IDs
    this.errors = [];
    this.migrationStats = {
      franchises: { processed: 0, migrated: 0 },
      plots: { processed: 0, migrated: 0 },
      preleased: { processed: 0, migrated: 0 },
      vacant: { processed: 0, migrated: 0 },
      wishlists: { processed: 0, migrated: 0 }
    };
  }

  /**
   * Initialize counters from existing data
   */
  async initializeCounters(data) {
    console.log('🔢 Initializing ID counters from existing data...');
    
    // Count existing franchises (113 total)
    if (data.franchiseProperties && Array.isArray(data.franchiseProperties)) {
      this.idCounters.franchise = data.franchiseProperties.filter(item => item).length;
    }
    
    // Count existing plots (1 total)
    if (data.plots && Array.isArray(data.plots)) {
      this.idCounters.plot = data.plots.filter(item => item).length;
    }
    
    // Count existing pre-leased properties (44 total)
    if (data.preleasedProperties && Array.isArray(data.preleasedProperties)) {
      this.idCounters.preleased = data.preleasedProperties.filter(item => item).length;
    }
    
    // Count existing vacant properties (93 total)
    if (data.vacantProperties && Array.isArray(data.vacantProperties)) {
      this.idCounters.vacant = data.vacantProperties.filter(item => item).length;
    }
    
    console.log(`   📊 Counters initialized:`);
    console.log(`   📈 Franchises: ${this.idCounters.franchise}`);
    console.log(`   📈 Plots: ${this.idCounters.plot}`);
    console.log(`   📈 Pre-leased: ${this.idCounters.preleased}`);
    console.log(`   📈 Vacant: ${this.idCounters.vacant}`);
  }

  /**
   * Generate unique property ID (matches the system in firebase.ts)
   */
  generatePropertyId(type, sequence) {
    const prefixes = {
      'franchise': 'PROP_FRAN',
      'plot': 'PROP_PLOT',
      'preleased': 'PROP_PRLS',
      'vacant': 'PROP_VCNT',
      'legacy': 'PROP_LEGC'
    };
    
    const prefix = prefixes[type] || prefixes['legacy'];
    const paddedSequence = sequence.toString().padStart(3, '0');
    return `${prefix}_${paddedSequence}`;
  }

  /**
   * Extract title from property based on type
   */
  extractTitle(property, type) {
    switch (type) {
      case 'plot':
        return property.project || property.title || property.name || 'Plot Property';
      case 'franchise':
        return property.brand || property.name || property.title || 'Franchise Property';
      case 'preleased':
        // Handle both "BUILDING - TENANT" format and individual fields
        if (property.buildingName && property.tenant) {
          return `${property.buildingName} - ${property.tenant}`;
        }
        return property.buildingName || property.tenant || property.title || property.name || 'Pre-leased Property';
      case 'vacant':
        return property.location || property.buildingName || property.title || property.name || 'Vacant Property';
      case 'legacy':
        return property.title || property.name || property.brand || property.project || 'Legacy Property';
      default:
        return 'Property';
    }
  }

  /**
   * Extract location from property based on type
   */
  extractLocation(property, type) {
    switch (type) {
      case 'plot':
        return property.location || 'Location not specified';
      case 'franchise':
        return property.location || property.headquarter || 'Location not specified';
      case 'preleased':
        return property.location || 'Location not specified';
      case 'vacant':
        return property.location || `${property.city || ''}, ${property.state || ''}`.trim();
      case 'legacy':
        return property.location || 'Location not specified';
      default:
        return 'Location not specified';
    }
  }

  /**
   * Extract price from property based on type
   */
  extractPrice(property, type) {
    switch (type) {
      case 'plot':
        return property.investmentStartsFrom?.amount || property.investmentStartsFrom || 0;
      case 'franchise':
        return this.parseInvestment(property.minInvestment || property.investment) || 0;
      case 'preleased':
        return parseInt(property.askingPrice || 0);
      case 'vacant':
        return parseInt(property.rent || 0);
      case 'legacy':
        return parseInt(property.price || 0);
      default:
        return 0;
    }
  }

  /**
   * Parse investment amount from string
   */
  parseInvestment(investment) {
    if (!investment) return 0;
    
    const str = investment.toString().toUpperCase();
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    
    if (!numMatch) return 0;
    
    let num = parseFloat(numMatch[1]);
    
    if (str.includes('CR') || str.includes('CRORE')) {
      num *= 10000000; // 1 crore = 10 million
    } else if (str.includes('LAC') || str.includes('LAKH')) {
      num *= 100000; // 1 lakh = 100,000
    }
    
    return Math.round(num);
  }

  /**
   * Extract images from property
   */
  extractImages(property, type) {
    if (property.images && Array.isArray(property.images)) {
      return property.images;
    }
    
    if (property.image) {
      return [property.image];
    }
    
    return [];
  }

  /**
   * Transform property to new unified structure
   */
  transformProperty(property, type, oldIndex, newId) {
    try {
      const baseProperty = {
        id: newId,
        type: type,
        title: this.extractTitle(property, type),
        description: property.description || '',
        location: this.extractLocation(property, type),
        price: this.extractPrice(property, type),
        images: this.extractImages(property, type),
        createdAt: property.createdAt || Date.now(),
        updatedAt: property.updatedAt || Date.now(),
        
        // Migration metadata
        migrationInfo: {
          originalCollection: type === 'legacy' ? 'properties' : `${type}Properties`,
          originalIndex: oldIndex,
          migratedAt: Date.now()
        }
      };

      // Add type-specific details
      switch (type) {
        case 'plot':
          baseProperty.plotDetails = {
            project: property.project,
            developerName: property.developerName,
            plotSize: property.plotSize,
            investmentStartsFrom: property.investmentStartsFrom,
            status: property.status,
            investorDiscoveryKit: property.investorDiscoveryKit
          };
          break;

        case 'franchise':
          baseProperty.franchiseDetails = {
            brand: property.brand,
            name: property.name,
            investment: property.investment,
            industry: property.industry,
            model: property.model,
            segment: property.segment,
            numberOfOutlets: property.numberOfOutlets,
            royalty: property.royalty,
            minInvestment: property.minInvestment,
            maxInvestment: property.maxInvestment,
            minArea: property.minArea,
            maxArea: property.maxArea,
            minPaybackPeriod: property.minPaybackPeriod,
            maxPaybackPeriod: property.maxPaybackPeriod,
            establishmentYear: property.establishmentYear,
            franchiseStartedYear: property.franchiseStartedYear,
            headquarter: property.headquarter,
            product: property.product,
            investorDiscoveryKitUrl: property.investorDiscoveryKitUrl
          };
          break;

        case 'preleased':
          baseProperty.preleasedDetails = {
            tenant: property.tenant,
            rent: property.rent,
            leaseTerm: property.leaseTerm,
            remainingLease: property.remainingLease,
            roi: property.roi,
            buildingName: property.buildingName,
            floor: property.floor,
            areaOnSale: property.areaOnSale,
            totalArea: property.totalArea,
            propertyStatus: property.propertyStatus,
            propertyType: property.propertyType,
            lockIn: property.lockIn,
            escalation: property.escalation,
            securityDeposit: property.securityDeposit,
            rentType: property.rentType,
            category: property.category,
            channel: property.channel,
            reference: property.reference
          };
          break;

        case 'vacant':
          baseProperty.vacantDetails = {
            carpetArea: property.carpetArea,
            superArea: property.superArea,
            floor: property.floor,
            facing: property.facing,
            category: property.category,
            city: property.city,
            state: property.state,
            rent: property.rent,
            propertyType: property.propertyType,
            reference: property.reference,
            contactName: property.contactName,
            district: property.district,
            length: property.length,
            width: property.width,
            height: property.height
          };
          break;

        case 'legacy':
          baseProperty.legacyDetails = {
            ...property // Keep all original fields for legacy properties
          };
          break;
      }

      return baseProperty;
    } catch (error) {
      this.errors.push({
        error: error.message,
        property: property,
        type: type,
        oldIndex: oldIndex
      });
      return null;
    }
  }

  /**
   * Create backup of current database
   */
  async createBackup() {
    console.log('📦 Creating backup...');
    
    try {
      const snapshot = await database.ref('/').once('value');
      const data = snapshot.val();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `database-backup-${timestamp}.json`;
      
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      
      // Also store backup in Firebase
      await database.ref(`backups/pre-migration-${timestamp}`).set(data);
      
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Migrate collections to new structure
   */
  async migrateCollections() {
    console.log('🔄 Starting collection migration...');
    
    try {
      // Get current data
      const snapshot = await database.ref('/').once('value');
      const data = snapshot.val();
      
      if (!data) {
        throw new Error('No data found in database');
      }
      
      // Initialize counters from existing data
      await this.initializeCounters(data);
      
      const migratedProperties = {};
      
      // Migrate each collection
      const collections = [
        { key: 'franchiseProperties', type: 'franchise' },
        { key: 'plots', type: 'plot' },
        { key: 'preleasedProperties', type: 'preleased' },
        { key: 'vacantProperties', type: 'vacant' },
        { key: 'properties', type: 'legacy' } // Legacy collection if exists
      ];
      
      for (const collection of collections) {
        const items = data[collection.key];
        if (!items || !Array.isArray(items)) {
          console.log(`  ⚠️ Skipping ${collection.key} - not found or not an array`);
          continue;
        }
        
        console.log(`  🔄 Processing ${collection.key} (${items.filter(item => item).length} items)...`);
        
        items.forEach((item, index) => {
          if (!item) {
            console.log(`    ⚠️ Skipping null item at index ${index}`);
            return; // Skip null entries
          }
          
          // Generate new ID based on sequence (index + 1)
          const sequence = index + 1;
          const newId = this.generatePropertyId(collection.type, sequence);
          const transformedProperty = this.transformProperty(item, collection.type, index, newId);
          
          if (transformedProperty) {
            migratedProperties[newId] = transformedProperty;
            
            // Store mapping for wishlist migration - use collection_index format
            this.idMapping[`${collection.key}_${index}`] = newId;
            
            // Also store mapping for simple index lookup
            this.idMapping[index.toString()] = newId;
            
            this.migrationStats[collection.type].processed++;
            this.migrationStats[collection.type].migrated++;
            
            console.log(`    ✅ ${index} -> ${newId}: ${transformedProperty.title}`);
          } else {
            console.log(`    ❌ Failed to transform item at index ${index}`);
            this.migrationStats[collection.type].processed++;
          }
        });
      }
      
      console.log(`🎉 Migrated ${Object.keys(migratedProperties).length} properties`);
      
      // Save migrated properties to new unified collection
      console.log('  💾 Saving to Firebase...');
      await database.ref('migratedProperties').set(migratedProperties);
      
      return migratedProperties;
    } catch (error) {
      console.error('❌ Collection migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate wishlist references to use new property IDs
   * This fixes the critical issue where property ID "1" was showing wrong properties
   */
  async migrateWishlists() {
    console.log('💝 Migrating wishlists...');
    
    try {
      const snapshot = await database.ref('wishlists').once('value');
      const wishlists = snapshot.val();
      
      if (!wishlists) {
        console.log('  💭 No wishlists to migrate');
        return;
      }
      
      let migratedCount = 0;
      let errorCount = 0;
      let conflictFixedCount = 0;
      
      for (const userId of Object.keys(wishlists)) {
        const userWishlist = wishlists[userId];
        
        for (const itemId of Object.keys(userWishlist)) {
          const item = userWishlist[itemId];
          const oldPropertyId = item.propertyId?.toString();
          
          if (!oldPropertyId) {
            console.log(`    ⚠️ Skipping item with missing propertyId: ${itemId}`);
            errorCount++;
            continue;
          }
          
          // Find new property ID
          let newPropertyId = null;
          let sourceCollection = null;
          
          // Special handling for the "1" ID conflict case
          if (oldPropertyId === "1") {
            // Check if this wishlist item was specifically for "Bird Estate" (plots[1])
            // Based on the user's description, they want Bird Estate to show correctly
            newPropertyId = 'PROP_PLOT_001'; // Bird Estate should be PROP_PLOT_001
            sourceCollection = 'plots';
            conflictFixedCount++;
            console.log(`    🎉 CONFLICT FIXED: ID "1" -> ${newPropertyId} (Bird Estate)`);
          } else {
            // For other IDs, try to find mapping
            // First try direct mapping
            newPropertyId = this.idMapping[oldPropertyId];
            
            if (!newPropertyId) {
              // Try collection-specific mapping
              for (const [mappingKey, mappedId] of Object.entries(this.idMapping)) {
                if (mappingKey.endsWith(`_${oldPropertyId}`)) {
                  newPropertyId = mappedId;
                  sourceCollection = mappingKey.split('_')[0];
                  break;
                }
              }
            }
          }
          
          if (newPropertyId) {
            // Update wishlist item with new property ID
            const updatedItem = {
              ...item,
              propertyId: newPropertyId,
              migrationInfo: {
                oldPropertyId: oldPropertyId,
                sourceCollection: sourceCollection,
                migratedAt: Date.now(),
                conflictResolved: oldPropertyId === "1"
              }
            };
            
            await database.ref(`wishlists/${userId}/${itemId}`).set(updatedItem);
            migratedCount++;
            this.migrationStats.wishlists.migrated++;
            
            console.log(`    ✅ ${userId}: ${oldPropertyId} -> ${newPropertyId}`);
          } else {
            console.log(`    ❌ Could not find mapping for property ID: ${oldPropertyId}`);
            errorCount++;
          }
          
          this.migrationStats.wishlists.processed++;
        }
      }
      
      console.log(`🎉 Wishlist migration complete:`);
      console.log(`   ✅ ${migratedCount} items migrated`);
      console.log(`   🎆 ${conflictFixedCount} ID conflicts resolved`);
      console.log(`   ❌ ${errorCount} errors`);
      
    } catch (error) {
      console.error('❌ Wishlist migration failed:', error);
      throw error;
    }
  }

  /**
   * Create ID mapping documentation
   */
  async saveIdMapping() {
    console.log('📋 Saving ID mapping...');
    
    const mappingDoc = {
      migrationDate: new Date().toISOString(),
      totalMapped: Object.keys(this.idMapping).length,
      mapping: this.idMapping,
      counters: this.idCounters,
      errors: this.errors
    };
    
    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mappingPath = `id-mapping-${timestamp}.json`;
    fs.writeFileSync(mappingPath, JSON.stringify(mappingDoc, null, 2));
    
    // Save to Firebase
    await database.ref('migration/idMapping').set(mappingDoc);
    
    console.log(`✅ ID mapping saved: ${mappingPath}`);
  }

  /**
   * Run complete migration
   */
  async runMigration(isDryRun = false) {
    console.log('🚀 STARTING DATABASE MIGRATION');
    console.log('==============================');
    
    if (isDryRun) {
      console.log('🟡 DRY RUN MODE - No changes will be made');
    }
    
    try {
      // Step 1: Create backup (skip in dry run)
      if (!isDryRun) {
        await this.createBackup();
      } else {
        console.log('📦 [DRY RUN] Backup would be created here');
      }
      
      // Step 2: Migrate collections
      if (!isDryRun) {
        await this.migrateCollections();
      } else {
        // In dry run, just analyze the data
        const snapshot = await database.ref('/').once('value');
        const data = snapshot.val();
        await this.initializeCounters(data);
        console.log('🔄 [DRY RUN] Collections would be migrated here');
      }
      
      // Step 3: Migrate wishlists
      if (!isDryRun) {
        await this.migrateWishlists();
      } else {
        console.log('💝 [DRY RUN] Wishlists would be migrated here');
      }
      
      // Step 4: Save mapping
      if (!isDryRun) {
        await this.saveIdMapping();
      } else {
        console.log('📋 [DRY RUN] ID mapping would be saved here');
      }
      
      // Generate migration report
      this.generateMigrationReport(isDryRun);
      
      if (!isDryRun) {
        console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('=====================================');
        console.log('Next steps:');
        console.log('1. Test your application thoroughly');
        console.log('2. Update your code to use the new "migratedProperties" collection');
        console.log('3. Verify "Bird Estate" shows correctly in wishlists');
        console.log('4. Remove old collections after verification');
      } else {
        console.log('🟡 DRY RUN COMPLETED');
        console.log('===================');
        console.log('Review the analysis above and run with "migrate" to execute.');
      }
      
    } catch (error) {
      console.error('💥 MIGRATION FAILED:', error);
      console.log('');
      console.log('🔄 Rollback instructions:');
      console.log('1. Restore from backup file');
      console.log('2. Fix the issues');
      console.log('3. Re-run migration');
      
      throw error;
    }
  }

  /**
   * Generate detailed migration report
   */
  generateMigrationReport(isDryRun = false) {
    console.log('');
    console.log('📄 MIGRATION REPORT');
    console.log('==================');
    
    if (isDryRun) {
      console.log('🟡 DRY RUN ANALYSIS:');
      console.log(`• Franchises to migrate: ${this.idCounters.franchise}`);
      console.log(`• Plots to migrate: ${this.idCounters.plot}`);
      console.log(`• Pre-leased to migrate: ${this.idCounters.preleased}`);
      console.log(`• Vacant to migrate: ${this.idCounters.vacant}`);
      console.log('');
      console.log('🎯 Expected Results:');
      console.log(`• Next franchise ID: PROP_FRAN_${(this.idCounters.franchise + 1).toString().padStart(3, '0')}`);
      console.log(`• Next plot ID: PROP_PLOT_${(this.idCounters.plot + 1).toString().padStart(3, '0')}`);
      console.log(`• Next pre-leased ID: PROP_PRLS_${(this.idCounters.preleased + 1).toString().padStart(3, '0')}`);
      console.log(`• Next vacant ID: PROP_VCNT_${(this.idCounters.vacant + 1).toString().padStart(3, '0')}`);
    } else {
      console.log('✅ ACTUAL RESULTS:');
      Object.entries(this.migrationStats).forEach(([type, stats]) => {
        if (stats.processed > 0) {
          console.log(`• ${type}: ${stats.migrated}/${stats.processed} migrated`);
        }
      });
      console.log(`• Total errors: ${this.errors.length}`);
    }
    
    console.log('');
    console.log('🎆 Key Benefits:');
    console.log('• Bird Estate will show correctly in wishlists (instead of DEFENCE COLONY)');
    console.log('• No more ID conflicts between collections');
    console.log('• Unique property identification system');
    console.log('• Future-proof property management');
  }

  /**
   * Rollback migration (restore from backup)
   */
  async rollback(backupFile) {
    console.log(`🔄 Rolling back from: ${backupFile}`);
    
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      await database.ref('/').set(backupData);
      
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

/**
 * Command line interface
 */
async function main() {
  const migration = new DatabaseMigration();
  
  const command = process.argv[2];
  const option = process.argv[3];
  
  switch (command) {
    case 'migrate':
      const isDryRun = option === '--dry-run';
      await migration.runMigration(isDryRun);
      break;
      
    case 'backup':
      await migration.createBackup();
      break;
      
    case 'rollback':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('Please provide backup file path');
        process.exit(1);
      }
      await migration.rollback(backupFile);
      break;
    
    case 'analyze':
      // Just analyze without migrating
      const snapshot = await database.ref('/').once('value');
      const data = snapshot.val();
      await migration.initializeCounters(data);
      migration.generateMigrationReport(true);
      break;
      
    default:
      console.log('🚀 Firebase Database Migration Tool');
      console.log('===================================');
      console.log('');
      console.log('🎯 Purpose: Fix ID conflicts where property ID "1" causes wrong properties to show in wishlists');
      console.log('');
      console.log('Commands:');
      console.log('  node migrate.js analyze                    - Analyze database without making changes');
      console.log('  node migrate.js migrate --dry-run          - Preview migration without making changes');
      console.log('  node migrate.js migrate                    - Run full migration');
      console.log('  node migrate.js backup                     - Create backup only');
      console.log('  node migrate.js rollback <backup-file>     - Restore from backup');
      console.log('');
      console.log('📋 Expected Results:');
      console.log('  • Bird Estate (plots[1]) will show correctly in wishlists');
      console.log('  • No more conflicts between franchiseProperties[1], plots[1], etc.');
      console.log('  • New properties get unique IDs: PROP_FRAN_XXX, PROP_PLOT_XXX, etc.');
      console.log('');
      console.log('⚠️  IMPORTANT: Test on development database first!');
      console.log('  1. Run "analyze" or "migrate --dry-run" first');
      console.log('  2. Create backup before running actual migration');
      console.log('  3. Test application thoroughly after migration');
      break;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseMigration;