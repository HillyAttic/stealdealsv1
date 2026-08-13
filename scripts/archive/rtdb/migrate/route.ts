import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { database } from '@/lib/firebase';
import { ref, get, set, push } from 'firebase/database';

interface MigrationStats {
  franchises: { existing: number; expected: string };
  plots: { existing: number; expected: string };
  preleased: { existing: number; expected: string };
  vacant: { existing: number; expected: string };
  totalConflicts: number;
}

interface PropertyCollection {
  [key: string]: any;
}

/**
 * Remove undefined values from objects (Firebase cannot handle undefined)
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item)).filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        const cleanedValue = removeUndefinedValues(value);
        if (cleanedValue !== undefined && cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
  
  return obj;
}

/**
 * Sanitize and provide defaults for property data
 */
function sanitizePropertyData(property: any, type: string): any {
  const sanitized = { ...property };
  
  // Ensure basic fields have values
  if (!sanitized.title && !sanitized.name && !sanitized.brand && !sanitized.project) {
    sanitized.title = `${type.charAt(0).toUpperCase() + type.slice(1)} Property`;
  }
  
  if (!sanitized.description) {
    sanitized.description = '';
  }
  
  if (!sanitized.location) {
    sanitized.location = sanitized.city || sanitized.state || 'Location not specified';
  }
  
  if (!sanitized.price && !sanitized.rent && !sanitized.minInvestment) {
    sanitized.price = 0;
  }
  
  // Type-specific field defaults
  switch (type) {
    case 'franchise':
      if (!sanitized.brand) {
        sanitized.brand = sanitized.name || sanitized.title || 'Franchise Brand';
      }
      if (!sanitized.name) {
        sanitized.name = sanitized.brand || sanitized.title || 'Franchise Name';
      }
      if (!sanitized.industry) {
        sanitized.industry = 'Not specified';
      }
      if (!sanitized.model) {
        sanitized.model = 'Standard';
      }
      break;
      
    case 'plot':
      if (!sanitized.project) {
        sanitized.project = sanitized.title || sanitized.name || 'Plot Project';
      }
      if (!sanitized.developerName) {
        sanitized.developerName = 'Developer not specified';
      }
      if (!sanitized.status) {
        sanitized.status = 'Available';
      }
      // Handle plotSize validation with more robust checks
      if (!sanitized.plotSize || typeof sanitized.plotSize !== 'object') {
        sanitized.plotSize = { min: 0, max: 0, unit: 'sq.ft' };
      } else {
        if (typeof sanitized.plotSize.min !== 'number') sanitized.plotSize.min = parseInt(sanitized.plotSize.min) || 0;
        if (typeof sanitized.plotSize.max !== 'number') sanitized.plotSize.max = parseInt(sanitized.plotSize.max) || 0;
        if (!sanitized.plotSize.unit) sanitized.plotSize.unit = 'sq.ft';
      }
      // Handle investmentStartsFrom validation
      if (!sanitized.investmentStartsFrom || typeof sanitized.investmentStartsFrom !== 'object') {
        sanitized.investmentStartsFrom = { amount: 0, unit: 'sq.ft' };
      } else {
        if (typeof sanitized.investmentStartsFrom.amount !== 'number') sanitized.investmentStartsFrom.amount = parseInt(sanitized.investmentStartsFrom.amount) || 0;
        if (!sanitized.investmentStartsFrom.unit) sanitized.investmentStartsFrom.unit = 'sq.ft';
      }
      if (!sanitized.keySalientFeatures || !Array.isArray(sanitized.keySalientFeatures)) {
        sanitized.keySalientFeatures = [];
      }
      if (!sanitized.images || !Array.isArray(sanitized.images)) {
        sanitized.images = [];
      }
      if (!sanitized.investorDiscoveryKit || typeof sanitized.investorDiscoveryKit !== 'object') {
        sanitized.investorDiscoveryKit = {
          title: 'Investor Discovery Kit',
          description: 'Investment information package',
          url: ''
        };
      } else {
        if (!sanitized.investorDiscoveryKit.title) sanitized.investorDiscoveryKit.title = 'Investor Discovery Kit';
        if (!sanitized.investorDiscoveryKit.description) sanitized.investorDiscoveryKit.description = 'Investment information package';
        if (!sanitized.investorDiscoveryKit.url) sanitized.investorDiscoveryKit.url = '';
      }
      break;
      
    case 'preleased':
      if (!sanitized.tenant) {
        sanitized.tenant = 'Tenant not specified';
      }
      if (!sanitized.buildingName) {
        sanitized.buildingName = sanitized.location || 'Building not specified';
      }
      break;
      
    case 'vacant':
      if (!sanitized.propertyType) {
        sanitized.propertyType = 'Vacant';
      }
      break;
  }
  
  // Remove any remaining undefined values
  return removeUndefinedValues(sanitized);
}

/**
 * Generate unique property ID (matches the system in firebase.ts)
 */
function generatePropertyId(type: string, sequence: number): string {
  const prefixes = {
    'franchise': 'PROP_FRAN',
    'plot': 'PROP_PLOT',
    'preleased': 'PROP_PRLS',
    'vacant': 'PROP_VCNT',
    'legacy': 'PROP_LEGC'
  };
  
  const prefix = prefixes[type as keyof typeof prefixes] || prefixes['legacy'];
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${prefix}_${paddedSequence}`;
}

/**
 * Extract title from property based on type
 */
function extractTitle(property: any, type: string): string {
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
    default:
      return 'Property';
  }
}

/**
 * Transform property to new unified structure
 */
function transformProperty(property: any, type: string, oldIndex: number, newId: string): any {
  // First sanitize the incoming property data
  const sanitizedProperty = sanitizePropertyData(property, type);
  
  const baseProperty: any = {
    id: newId,
    type: type,
    title: extractTitle(sanitizedProperty, type),
    description: sanitizedProperty.description || '',
    location: sanitizedProperty.location || 'Location not specified',
    price: sanitizedProperty.price || sanitizedProperty.rent || sanitizedProperty.minInvestment || 0,
    images: sanitizedProperty.images || (sanitizedProperty.image ? [sanitizedProperty.image] : []),
    createdAt: sanitizedProperty.createdAt || Date.now(),
    updatedAt: sanitizedProperty.updatedAt || Date.now(),
    
    // Migration metadata
    migrationInfo: {
      originalCollection: `${type}Properties`,
      originalIndex: oldIndex,
      migratedAt: Date.now()
    }
  };

  // Add type-specific details (using sanitized data)
  switch (type) {
    case 'plot':
      baseProperty.plotDetails = removeUndefinedValues({
        project: sanitizedProperty.project,
        developerName: sanitizedProperty.developerName,
        plotSize: sanitizedProperty.plotSize,
        investmentStartsFrom: sanitizedProperty.investmentStartsFrom,
        status: sanitizedProperty.status,
        investorDiscoveryKit: sanitizedProperty.investorDiscoveryKit,
        keySalientFeatures: sanitizedProperty.keySalientFeatures
      });
      break;

    case 'franchise':
      baseProperty.franchiseDetails = removeUndefinedValues({
        brand: sanitizedProperty.brand,
        name: sanitizedProperty.name,
        investment: sanitizedProperty.investment,
        industry: sanitizedProperty.industry,
        model: sanitizedProperty.model,
        segment: sanitizedProperty.segment,
        numberOfOutlets: sanitizedProperty.numberOfOutlets,
        royalty: sanitizedProperty.royalty,
        minInvestment: sanitizedProperty.minInvestment,
        maxInvestment: sanitizedProperty.maxInvestment,
        minArea: sanitizedProperty.minArea,
        maxArea: sanitizedProperty.maxArea,
        minPaybackPeriod: sanitizedProperty.minPaybackPeriod,
        maxPaybackPeriod: sanitizedProperty.maxPaybackPeriod,
        establishmentYear: sanitizedProperty.establishmentYear,
        franchiseStartedYear: sanitizedProperty.franchiseStartedYear,
        headquarter: sanitizedProperty.headquarter,
        product: sanitizedProperty.product,
        investorDiscoveryKitUrl: sanitizedProperty.investorDiscoveryKitUrl
      });
      break;

    case 'preleased':
      baseProperty.preleasedDetails = removeUndefinedValues({
        tenant: sanitizedProperty.tenant,
        rent: sanitizedProperty.rent,
        leaseTerm: sanitizedProperty.leaseTerm,
        remainingLease: sanitizedProperty.remainingLease,
        roi: sanitizedProperty.roi,
        buildingName: sanitizedProperty.buildingName,
        floor: sanitizedProperty.floor,
        areaOnSale: sanitizedProperty.areaOnSale,
        totalArea: sanitizedProperty.totalArea,
        propertyStatus: sanitizedProperty.propertyStatus,
        propertyType: sanitizedProperty.propertyType,
        lockIn: sanitizedProperty.lockIn,
        escalation: sanitizedProperty.escalation,
        securityDeposit: sanitizedProperty.securityDeposit,
        rentType: sanitizedProperty.rentType,
        category: sanitizedProperty.category,
        channel: sanitizedProperty.channel,
        reference: sanitizedProperty.reference
      });
      break;

    case 'vacant':
      baseProperty.vacantDetails = removeUndefinedValues({
        carpetArea: sanitizedProperty.carpetArea,
        superArea: sanitizedProperty.superArea,
        floor: sanitizedProperty.floor,
        facing: sanitizedProperty.facing,
        category: sanitizedProperty.category,
        city: sanitizedProperty.city,
        state: sanitizedProperty.state,
        rent: sanitizedProperty.rent,
        propertyType: sanitizedProperty.propertyType,
        reference: sanitizedProperty.reference,
        contactName: sanitizedProperty.contactName,
        district: sanitizedProperty.district,
        length: sanitizedProperty.length,
        width: sanitizedProperty.width,
        height: sanitizedProperty.height
      });
      break;
  }

  // Final cleanup to ensure no undefined values remain
  return removeUndefinedValues(baseProperty);
}

/**
 * Analyze current database for ID conflicts and migration stats
 */
async function analyzeDatabase(): Promise<MigrationStats> {
  try {
    // Get all collections
    const collections = ['franchiseProperties', 'plots', 'preleasedProperties', 'vacantProperties'];
    const stats: any = {};
    let totalConflicts = 0;
    const conflictMap: { [id: string]: string[] } = {};

    for (const collection of collections) {
      const snapshot = await get(ref(database, collection));
      const data = snapshot.val();
      
      if (data && Array.isArray(data)) {
        const validItems = data.filter(item => item !== null && item !== undefined);
        const typeKey = collection.replace('Properties', '').toLowerCase();
        
        stats[typeKey] = {
          existing: validItems.length,
          expected: generatePropertyId(typeKey, validItems.length + 1)
        };

        // Check for conflicts
        validItems.forEach((item, index) => {
          if (item) {
            const idStr = index.toString();
            if (!conflictMap[idStr]) {
              conflictMap[idStr] = [];
            }
            conflictMap[idStr].push(collection);
          }
        });
      } else {
        const typeKey = collection.replace('Properties', '').toLowerCase();
        stats[typeKey] = {
          existing: 0,
          expected: generatePropertyId(typeKey, 1)
        };
      }
    }

    // Count conflicts (IDs that appear in multiple collections)
    for (const [id, collections] of Object.entries(conflictMap)) {
      if (collections.length > 1) {
        totalConflicts++;
      }
    }

    return {
      franchises: stats.franchise || { existing: 0, expected: 'PROP_FRAN_001' },
      plots: stats.plots || { existing: 0, expected: 'PROP_PLOT_001' },
      preleased: stats.preleased || { existing: 0, expected: 'PROP_PRLS_001' },
      vacant: stats.vacant || { existing: 0, expected: 'PROP_VCNT_001' },
      totalConflicts
    };
  } catch (error) {
    console.error('Database analysis error:', error);
    throw new Error('Failed to analyze database');
  }
}

/**
 * Create backup of current database using batch approach to avoid size limits
 */
async function createBackup(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `pre-migration-${timestamp}`;
    
    console.log(`[Migration] Starting selective backup: ${backupId}`);
    
    // Collections to backup (only the ones we're migrating)
    const collectionsToBackup = [
      'franchiseProperties', 
      'plots', 
      'preleasedProperties', 
      'vacantProperties',
      'wishlists'
    ];
    
    const backupData: { [key: string]: any } = {
      backupInfo: {
        createdAt: Date.now(),
        reason: 'Pre-migration backup',
        timestamp,
        collections: collectionsToBackup
      }
    };
    
    let totalItems = 0;
    
    // Backup each collection individually to avoid size issues
    for (const collection of collectionsToBackup) {
      try {
        console.log(`[Migration] Backing up collection: ${collection}`);
        const snapshot = await get(ref(database, collection));
        const data = snapshot.val();
        
        if (data) {
          // Calculate size and item count
          const dataSize = JSON.stringify(data).length;
          const itemCount = Array.isArray(data) ? data.filter(item => item).length : Object.keys(data).length;
          
          console.log(`[Migration] Collection ${collection}: ${itemCount} items, ${Math.round(dataSize/1024)}KB`);
          
          // Store collection data
          backupData[collection] = data;
          totalItems += itemCount;
          
          // If collection is too large, use batch backup for it
          if (dataSize > 50000) { // 50KB threshold
            console.log(`[Migration] Large collection ${collection}, using batch backup`);
            await batchWriteToFirebase(`backups/${backupId}/${collection}`, 
              Array.isArray(data) ? data.reduce((acc, item, idx) => ({...acc, [idx]: item}), {}) : data, 
              10
            );
            // Don't include in main backup data to avoid duplication
            delete backupData[collection];
          }
        } else {
          console.log(`[Migration] Collection ${collection}: empty or not found`);
          backupData[collection] = null;
        }
      } catch (collectionError) {
        console.warn(`[Migration] Failed to backup collection ${collection}:`, collectionError);
        backupData[collection] = { error: 'Failed to backup', reason: collectionError instanceof Error ? collectionError.message : 'Unknown error' };
      }
    }
    
    // Save the main backup info and small collections
    const backupRef = ref(database, `backups/${backupId}`);
    console.log(`[Migration] Saving backup metadata and small collections...`);
    
    try {
      await set(backupRef, backupData);
      console.log(`[Migration] ✅ Backup completed: ${backupId} (${totalItems} items)`);
    } catch (mainBackupError) {
      // If even the selective backup is too large, save just the metadata
      console.warn(`[Migration] Main backup too large, saving metadata only:`, mainBackupError);
      await set(backupRef, {
        backupInfo: backupData.backupInfo,
        note: 'Collections backed up separately due to size limits'
      });
    }
    
    return backupId;
  } catch (error) {
    console.error('Backup creation error:', error);
    // Don't fail the entire migration if backup fails - log and continue
    console.warn('[Migration] Backup failed but continuing with migration...');
    return 'backup-failed-' + Date.now();
  }
}

/**
 * Write data to Firebase in batches to avoid size limits
 */
async function batchWriteToFirebase(path: string, data: { [key: string]: any }, batchSize: number = 15): Promise<void> {
  const entries = Object.entries(data);
  const totalBatches = Math.ceil(entries.length / batchSize);
  
  console.log(`[Migration] Starting batch write: ${entries.length} items in ${totalBatches} batches`);
  
  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    const endIndex = Math.min(startIndex + batchSize, entries.length);
    const batch = entries.slice(startIndex, endIndex);
    const batchData = Object.fromEntries(batch);
    
    console.log(`[Migration] Writing batch ${i + 1}/${totalBatches} (${batch.length} items)`);
    
    try {
      // Write each item in the batch individually to avoid size issues
      const writePromises = batch.map(([key, value]) => 
        set(ref(database, `${path}/${key}`), value)
      );
      
      await Promise.all(writePromises);
      console.log(`[Migration] ✅ Batch ${i + 1} completed successfully`);
      
      // Small delay between batches to avoid overwhelming Firebase
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`[Migration] ❌ Batch ${i + 1} failed:`, error);
      throw new Error(`Batch write failed at batch ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`[Migration] ✅ All batches completed successfully`);
}

/**
 * Migrate collections to new structure (dry run or actual)
 */
async function migrateCollections(isDryRun: boolean = false) {
  const collections = [
    { key: 'franchiseProperties', type: 'franchise' },
    { key: 'plots', type: 'plot' },
    { key: 'preleasedProperties', type: 'preleased' },
    { key: 'vacantProperties', type: 'vacant' }
  ];
  
  // Initialize type-organized structure
  const migratedProperties: { [key: string]: { [key: string]: any } } = {
    plots: {},
    franchise: {},
    preleased: {},
    vacant: {}
  };
  const idMapping: { [key: string]: string } = {};
  const migrationStats = {
    processed: 0,
    migrated: 0,
    errors: 0
  };

  for (const collection of collections) {
    try {
      console.log(`[Migration] Processing collection: ${collection.key} (type: ${collection.type})`);
      const snapshot = await get(ref(database, collection.key));
      const items = snapshot.val();
      
      if (!items) {
        console.log(`[Migration] Collection ${collection.key} is empty, skipping`);
        continue;
      }

      // Firebase stores data as objects, not arrays - handle both cases
      let itemsArray;
      if (Array.isArray(items)) {
        console.log(`[Migration] ${collection.key} is an array with ${items.length} items`);
        itemsArray = items.map((item, index) => ({ item, originalIndex: index }));
      } else if (typeof items === 'object') {
        console.log(`[Migration] ${collection.key} is an object with ${Object.keys(items).length} items`);
        itemsArray = Object.entries(items).map(([key, item], index) => ({ 
          item, 
          originalIndex: index, 
          originalKey: key 
        }));
      } else {
        console.log(`[Migration] Collection ${collection.key} has unexpected data type: ${typeof items}, skipping`);
        continue;
      }

      console.log(`[Migration] Processing ${itemsArray.length} items from ${collection.key}`);

      itemsArray.forEach(({ item, originalIndex, originalKey }) => {
        if (!item) return;
        
        migrationStats.processed++;
        
        try {
          // Generate new ID based on sequence (index + 1)
          const sequence = originalIndex + 1;
          const newId = generatePropertyId(collection.type, sequence);
          
          console.log(`[Migration] Processing ${collection.key} item ${originalIndex + 1}: ${originalKey || originalIndex} -> ${newId}`);
          
          const transformedProperty = transformProperty(item, collection.type, originalIndex, newId);
          
          if (transformedProperty) {
            // Store in type-organized structure
            const typeKey = collection.type === 'plot' ? 'plots' : collection.type;
            migratedProperties[typeKey][newId] = transformedProperty;
            
            // Store mapping for wishlist migration
            idMapping[`${collection.key}_${originalIndex}`] = newId;
            idMapping[originalIndex.toString()] = newId;
            // Also map original key if it exists (for object-based data)
            if (originalKey) {
              idMapping[originalKey] = newId;
            }
            
            migrationStats.migrated++;
            console.log(`[Migration] ✅ Successfully processed ${collection.key}[${originalKey || originalIndex}] -> ${newId}`);
          } else {
            console.log(`[Migration] ❌ Failed to transform ${collection.key}[${originalKey || originalIndex}] - transformProperty returned null`);
            migrationStats.errors++;
          }
        } catch (error) {
          console.error(`[Migration] ❌ Error transforming ${collection.key}[${originalKey || originalIndex}]:`, error);
          migrationStats.errors++;
        }
      });
    } catch (error) {
      console.error(`Error processing collection ${collection.key}:`, error);
      migrationStats.errors++;
    }
  }

  // Save migrated properties (only if not dry run)
  if (!isDryRun) {
    try {
      // Calculate total properties count across all types
      const typeCounts = {
        plots: Object.keys(migratedProperties.plots).length,
        franchise: Object.keys(migratedProperties.franchise).length,
        preleased: Object.keys(migratedProperties.preleased).length,
        vacant: Object.keys(migratedProperties.vacant).length
      };
      const propertiesCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
      const dataSize = JSON.stringify(migratedProperties).length;
      const mappingSize = JSON.stringify(idMapping).length;
      
      console.log(`[Migration] Attempting to save migrated data:`, {
        propertiesCount,
        typeCounts,
        dataSizeBytes: dataSize,
        mappingSizeBytes: mappingSize,
        samplePropertyIds: {
          plots: Object.keys(migratedProperties.plots).slice(0, 2),
          franchise: Object.keys(migratedProperties.franchise).slice(0, 2),
          preleased: Object.keys(migratedProperties.preleased).slice(0, 2),
          vacant: Object.keys(migratedProperties.vacant).slice(0, 2)
        }
      });
      
      // Clean undefined values from migration data (Firebase cannot handle undefined values)
      console.log('[Migration] Cleaning undefined values from migration data...');
      const cleanedProperties = removeUndefinedValues(migratedProperties);
      const cleanedMapping = removeUndefinedValues(idMapping);
      const cleanedStats = removeUndefinedValues(migrationStats);
      
      console.log('[Migration] Data cleaning complete. Undefined values removed.');
      
      // Validate cleaned data doesn't have undefined values
      const stringified = JSON.stringify(cleanedProperties);
      if (stringified.includes('undefined')) {
        console.error('[Migration] ⚠️ WARNING: Cleaned data still contains undefined values');
      }
      
      // Clear existing migratedProperties first to avoid conflicts
      console.log('[Migration] Clearing existing migratedProperties...');
      await set(ref(database, 'migratedProperties'), null);
      
      // Use batch writing to save each property type separately
      console.log('[Migration] Starting type-organized batch write for migrated properties...');
      for (const [type, properties] of Object.entries(cleanedProperties)) {
        if (Object.keys(properties).length > 0) {
          console.log(`[Migration] Writing ${type} properties: ${Object.keys(properties).length} items`);
          await batchWriteToFirebase(`migratedProperties/${type}`, properties, 15);
        }
      }
      console.log('[Migration] ✅ Successfully saved all migrated properties in type-organized structure');
      
      // Also save the ID mapping for reference (smaller data, can write normally)
      console.log('[Migration] Saving ID mapping to migration/idMapping path...');
      await set(ref(database, 'migration/idMapping'), {
        mapping: cleanedMapping,
        stats: cleanedStats,
        createdAt: Date.now()
      });
      console.log('[Migration] ✅ Successfully saved ID mapping');
    } catch (error) {
      console.error('[Migration] ❌ Detailed error saving migrated data:', {
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorStack: error?.stack,
        firebaseError: error?.toJSON ? error.toJSON() : 'Not a Firebase error',
        fullError: error
      });
      
      // Check if it's a specific Firebase error
      if (error?.code) {
        throw new Error(`Firebase error: ${error.code} - ${error.message}`);
      } else if (error?.message) {
        throw new Error(`Save failed: ${error.message}`);
      } else {
        throw new Error('Failed to save migrated data - Unknown error occurred');
      }
    }
  }

  return {
    stats: migrationStats,
    idMapping,
    migratedProperties: Object.values(migratedProperties).reduce((total, typeProperties) => 
      total + Object.keys(typeProperties).length, 0
    )
  };
}

/**
 * Migrate wishlist references (dry run or actual)
 */
async function migrateWishlists(idMapping: { [key: string]: string }, isDryRun: boolean = false) {
  try {
    const snapshot = await get(ref(database, 'wishlists'));
    const wishlists = snapshot.val();
    
    if (!wishlists) {
      return { migrated: 0, errors: 0, conflictFixed: 0 };
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    let conflictFixedCount = 0;
    const updates: { [path: string]: any } = {};

    for (const userId of Object.keys(wishlists)) {
      const userWishlist = wishlists[userId];
      
      for (const itemId of Object.keys(userWishlist)) {
        const item = userWishlist[itemId];
        const oldPropertyId = item.propertyId?.toString();
        
        if (!oldPropertyId) {
          errorCount++;
          continue;
        }
        
        let newPropertyId = null;
        
        // Special handling for the "1" ID conflict case
        if (oldPropertyId === "1") {
          // Fix the critical issue: ID "1" should reference Bird Estate (PROP_PLOT_001)
          newPropertyId = 'PROP_PLOT_001';
          conflictFixedCount++;
        } else {
          // For other IDs, try to find mapping
          newPropertyId = idMapping[oldPropertyId];
        }
        
        if (newPropertyId) {
          const updatedItem = {
            ...item,
            propertyId: newPropertyId,
            migrationInfo: {
              oldPropertyId: oldPropertyId,
              migratedAt: Date.now(),
              conflictResolved: oldPropertyId === "1"
            }
          };
          
          if (!isDryRun) {
            updates[`wishlists/${userId}/${itemId}`] = updatedItem;
          }
          
          migratedCount++;
        } else {
          errorCount++;
        }
      }
    }
    
    // Apply updates (only if not dry run)
    if (!isDryRun && Object.keys(updates).length > 0) {
      const promises = Object.entries(updates).map(([path, value]) => 
        set(ref(database, path), value)
      );
      await Promise.all(promises);
    }
    
    return {
      migrated: migratedCount,
      errors: errorCount,
      conflictFixed: conflictFixedCount
    };
  } catch (error) {
    console.error('Wishlist migration error:', error);
    throw new Error('Failed to migrate wishlists');
  }
}

/**
 * Analyze franchise properties for redundant fields
 */
async function analyzeFranchiseRedundancy() {
  try {
    console.log('[Franchise Cleanup] Analyzing franchise properties for redundancy...');
    
    const migratedSnapshot = await get(ref(database, 'migratedProperties/franchise'));
    const migratedData = migratedSnapshot.val();
    
    if (!migratedData) {
      return {
        totalFranchises: 0,
        franchisesWithRedundancy: 0,
        redundantFields: [],
        estimatedSavings: '0KB'
      };
    }

    const redundantFields = [
      'brand', 'establishmentYear', 'franchiseStartedYear', 'headquarter', 
      'industry', 'maxArea', 'maxInvestment', 'maxPaybackPeriod', 'minArea', 
      'minInvestment', 'minPaybackPeriod', 'model', 'name', 'product', 
      'royalty', 'segment', 'numberOutlets', 'investment', 'location', 'roi'
    ];

    let totalFranchises = 0;
    let franchisesWithRedundancy = 0;
    let totalRedundantDataSize = 0;

    for (const [franchiseId, franchiseData] of Object.entries(migratedData as { [key: string]: any })) {
      totalFranchises++;
      
      let hasRedundancy = false;
      let franchiseRedundantSize = 0;
      
      for (const field of redundantFields) {
        if (franchiseData[field] && franchiseData.franchiseDetails?.[field]) {
          hasRedundancy = true;
          franchiseRedundantSize += JSON.stringify(franchiseData[field]).length;
        }
      }
      
      if (hasRedundancy) {
        franchisesWithRedundancy++;
        totalRedundantDataSize += franchiseRedundantSize;
      }
    }

    const estimatedSavings = `${Math.round(totalRedundantDataSize / 1024)}KB`;

    console.log(`[Franchise Cleanup] Analysis complete: ${franchisesWithRedundancy}/${totalFranchises} franchises have redundancy`);

    return {
      totalFranchises,
      franchisesWithRedundancy,
      redundantFields,
      estimatedSavings
    };
  } catch (error) {
    console.error('[Franchise Cleanup] Analysis error:', error);
    throw new Error('Failed to analyze franchise redundancy');
  }
}

/**
 * Clean up franchise data redundancy (dry run or actual)
 */
async function cleanupFranchiseRedundancy(isDryRun: boolean = false) {
  try {
    console.log(`[Franchise Cleanup] ${isDryRun ? 'Dry run' : 'Actual'} cleanup starting...`);
    
    const migratedSnapshot = await get(ref(database, 'migratedProperties/franchise'));
    const migratedData = migratedSnapshot.val();
    
    if (!migratedData) {
      return {
        processed: 0,
        cleaned: 0,
        errors: 0,
        fieldsRemoved: 0
      };
    }

    const redundantFields = [
      'brand', 'establishmentYear', 'franchiseStartedYear', 'headquarter', 
      'industry', 'maxArea', 'maxInvestment', 'maxPaybackPeriod', 'minArea', 
      'minInvestment', 'minPaybackPeriod', 'model', 'name', 'product', 
      'royalty', 'segment', 'numberOutlets', 'investment', 'location', 'roi'
    ];

    let processedCount = 0;
    let cleanedCount = 0;
    let errorCount = 0;
    let fieldsRemovedCount = 0;
    
    const updates: { [path: string]: any } = {};

    for (const [franchiseId, franchiseData] of Object.entries(migratedData as { [key: string]: any })) {
      processedCount++;
      
      try {
        const cleanedFranchise = { ...franchiseData };
        let hadRedundancy = false;
        
        // Remove redundant fields that exist in franchiseDetails
        for (const field of redundantFields) {
          if (cleanedFranchise[field] && cleanedFranchise.franchiseDetails?.[field]) {
            delete cleanedFranchise[field];
            fieldsRemovedCount++;
            hadRedundancy = true;
          }
        }
        
        // Ensure franchiseDetails has complete data and fix naming inconsistencies
        if (cleanedFranchise.franchiseDetails) {
          // Fix numberOutlets vs numberOfOutlets
          if (cleanedFranchise.franchiseDetails.numberOutlets && !cleanedFranchise.franchiseDetails.numberOfOutlets) {
            cleanedFranchise.franchiseDetails.numberOfOutlets = cleanedFranchise.franchiseDetails.numberOutlets;
            delete cleanedFranchise.franchiseDetails.numberOutlets;
          }
          
          // Update the updatedAt timestamp
          cleanedFranchise.updatedAt = Date.now();
          
          // Add cleanup metadata
          cleanedFranchise.cleanupInfo = {
            cleanedAt: Date.now(),
            fieldsRemoved: hadRedundancy ? redundantFields.filter(field => 
              franchiseData[field] && franchiseData.franchiseDetails?.[field]
            ) : [],
            version: '1.0'
          };
        }
        
        if (hadRedundancy) {
          cleanedCount++;
          
          if (!isDryRun) {
            updates[`migratedProperties/franchise/${franchiseId}`] = removeUndefinedValues(cleanedFranchise);
          }
        }
        
      } catch (itemError) {
        console.error(`[Franchise Cleanup] Error processing franchise ${franchiseId}:`, itemError);
        errorCount++;
      }
    }

    // Apply updates (only if not dry run)
    if (!isDryRun && Object.keys(updates).length > 0) {
      console.log(`[Franchise Cleanup] Applying ${Object.keys(updates).length} updates...`);
      
      // Use batch writing for large updates
      await batchWriteToFirebase('migratedProperties/franchise', updates, 10);
    }

    console.log(`[Franchise Cleanup] ${isDryRun ? 'Dry run' : 'Cleanup'} completed: ${cleanedCount}/${processedCount} franchises cleaned`);

    return {
      processed: processedCount,
      cleaned: cleanedCount,
      errors: errorCount,
      fieldsRemoved: fieldsRemovedCount
    };
  } catch (error) {
    console.error('[Franchise Cleanup] Cleanup error:', error);
    throw new Error('Failed to cleanup franchise redundancy');
  }
}

// GET /api/admin/migrate - Analyze database
export async function GET(request: NextRequest) {
  return requireAdminAuth(request, async (authenticatedRequest) => {
    try {
      console.log('[Migration] Analysis request from:', authenticatedRequest.user.email);
      
      const stats = await analyzeDatabase();
      
      return NextResponse.json({
        success: true,
        stats,
        message: 'Database analysis completed'
      });
    } catch (error) {
      console.error('[Migration] Analysis error:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }, { status: 500 });
    }
  });
}

// POST /api/admin/migrate - Perform migration actions
export async function POST(request: NextRequest) {
  try {
    console.log('[Migration] POST request received');
    console.log('[Migration] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Log cookies for debugging
    const cookies = request.cookies.getAll();
    console.log('[Migration] Request cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    return requireAdminAuth(request, async (authenticatedRequest) => {
      try {
        console.log('[Migration] Admin auth successful for user:', authenticatedRequest.user.email);
        
        const { action, skipBackup = false } = await request.json();
        console.log(`[Migration] ${action} request from:`, authenticatedRequest.user.email, skipBackup ? '(skip backup)' : '');
        
        // Validate Firebase connection by testing a simple read
        try {
          const testRef = ref(database, 'plots');
          const testSnapshot = await get(testRef);
          console.log('[Migration] Firebase connection verified - can read data:', testSnapshot.exists());
        } catch (dbError) {
          console.error('[Migration] Firebase connection error:', dbError);
          throw new Error('Database connection failed');
        }
        
        switch (action) {
          case 'backup':
            console.log('[Migration] Starting backup process...');
            const backupFile = await createBackup();
            console.log('[Migration] Backup completed:', backupFile);
            return NextResponse.json({
              success: true,
              message: 'Backup created successfully',
              backupFile
            });
            
          case 'dry-run':
            console.log('[Migration] Starting dry run process...');
            const dryRunResult = await migrateCollections(true);
            console.log('[Migration] Dry run collections result:', dryRunResult);
            
            const dryRunWishlistResult = await migrateWishlists(dryRunResult.idMapping, true);
            console.log('[Migration] Dry run wishlists result:', dryRunWishlistResult);
            
            return NextResponse.json({
              success: true,
              message: 'Dry run completed successfully',
              stats: {
                properties: dryRunResult.stats,
                wishlists: dryRunWishlistResult,
                totalPropertiesMigrated: dryRunResult.migratedProperties
              }
            });
            
          case 'migrate':
            console.log('[Migration] Starting actual migration process...');
            
            let migrationBackupFile = 'skipped';
            
            // Create backup first (unless skipped)
            if (!skipBackup) {
              console.log('[Migration] Creating pre-migration backup...');
              migrationBackupFile = await createBackup();
              console.log('[Migration] Backup created:', migrationBackupFile);
            } else {
              console.log('[Migration] Skipping backup as requested...');
            }
            
            // Run actual migration
            console.log('[Migration] Running collections migration...');
            const migrationResult = await migrateCollections(false);
            console.log('[Migration] Collections migration result:', migrationResult);
            
            console.log('[Migration] Running wishlists migration...');
            const wishlistResult = await migrateWishlists(migrationResult.idMapping, false);
            console.log('[Migration] Wishlists migration result:', wishlistResult);
            
            return NextResponse.json({
              success: true,
              message: 'Migration completed successfully! Property IDs have been updated and the admin panel should no longer show moving properties.',
              stats: {
                backup: migrationBackupFile,
                properties: migrationResult.stats,
                wishlists: wishlistResult,
                totalPropertiesMigrated: migrationResult.migratedProperties
              }
            });

          case 'analyze-franchise':
            console.log('[Franchise Cleanup] Starting franchise redundancy analysis...');
            const analysisResult = await analyzeFranchiseRedundancy();
            console.log('[Franchise Cleanup] Analysis result:', analysisResult);
            
            return NextResponse.json({
              success: true,
              message: 'Franchise redundancy analysis completed',
              stats: analysisResult
            });

          case 'franchise-dry-run':
            console.log('[Franchise Cleanup] Starting franchise cleanup dry run...');
            const franchiseDryRunResult = await cleanupFranchiseRedundancy(true);
            console.log('[Franchise Cleanup] Dry run result:', franchiseDryRunResult);
            
            return NextResponse.json({
              success: true,
              message: 'Franchise cleanup dry run completed successfully',
              stats: franchiseDryRunResult
            });

          case 'franchise-cleanup':
            console.log('[Franchise Cleanup] Starting actual franchise cleanup...');
            
            let franchiseBackupFile = 'skipped';
            
            // Create backup first (unless skipped)
            if (!skipBackup) {
              console.log('[Franchise Cleanup] Creating pre-cleanup backup...');
              franchiseBackupFile = await createBackup();
              console.log('[Franchise Cleanup] Backup created:', franchiseBackupFile);
            } else {
              console.log('[Franchise Cleanup] Skipping backup as requested...');
            }
            
            // Run actual cleanup
            console.log('[Franchise Cleanup] Running franchise redundancy cleanup...');
            const cleanupResult = await cleanupFranchiseRedundancy(false);
            console.log('[Franchise Cleanup] Cleanup result:', cleanupResult);
            
            return NextResponse.json({
              success: true,
              message: `Franchise cleanup completed successfully! Removed ${cleanupResult.fieldsRemoved} redundant fields from ${cleanupResult.cleaned} franchises.`,
              stats: {
                backup: franchiseBackupFile,
                cleanup: cleanupResult
              }
            });
            
          default:
            console.error('[Migration] Invalid action received:', action);
            return NextResponse.json({
              success: false,
              error: 'Invalid action'
            }, { status: 400 });
        }
      } catch (error) {
        console.error('[Migration] Action processing error:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Migration action failed'
        }, { status: 500 });
      }
    });
  } catch (outerError) {
    console.error('[Migration] Outer error (likely auth):', {
      error: outerError,
      message: outerError instanceof Error ? outerError.message : 'Unknown outer error',
      stack: outerError instanceof Error ? outerError.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: outerError instanceof Error ? outerError.message : 'Request processing failed'
    }, { status: 500 });
  }
}