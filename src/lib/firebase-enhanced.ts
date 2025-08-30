import { database } from './firebase-config';
import { ref, get, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';

/**
 * Enhanced Firebase Service with Migration Support
 * Supports both old array-based structure and new unified properties collection
 */

/**
 * Check if database has been migrated to new structure
 */
async function isMigrated() {
  try {
    const migrationRef = ref(database, 'migration/idMapping');
    const snapshot = await get(migrationRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Get property by ID - supports both old and new structure
 */
export async function getPropertyById(propertyId) {
  try {
    const migrated = await isMigrated();
    
    if (migrated) {
      // Use new unified structure
      return await getPropertyFromUnifiedCollection(propertyId);
    } else {
      // Use old array-based structure
      return await getPropertyFromLegacyCollections(propertyId);
    }
  } catch (error) {
    console.error('Error getting property by ID:', error);
    return null;
  }
}

/**
 * Get property from new unified properties collection
 */
async function getPropertyFromUnifiedCollection(propertyId) {
  try {
    const propertyRef = ref(database, `properties/${propertyId}`);
    const snapshot = await get(propertyRef);
    
    if (snapshot.exists()) {
      const property = snapshot.val();
      return transformUnifiedPropertyForDisplay(property);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting property from unified collection:', error);
    return null;
  }
}

/**
 * Get property from legacy array-based collections (current implementation)
 */
async function getPropertyFromLegacyCollections(propertyId) {
  // This is your current implementation - search order optimized for plots first
  const collections = [
    'plots',
    'franchiseProperties', 
    'preleasedProperties',
    'vacantProperties',
    'properties'
  ];

  for (const collectionName of collections) {
    try {
      const collectionRef = ref(database, collectionName);
      const snapshot = await get(collectionRef);
      
      if (snapshot.exists()) {
        const items = snapshot.val();
        
        if (Array.isArray(items)) {
          const property = items[parseInt(propertyId)];
          if (property) {
            return transformLegacyPropertyForDisplay(property, collectionName, propertyId);
          }
        }
      }
    } catch (error) {
      console.log(`Error searching ${collectionName}:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Transform unified property data for display
 */
function transformUnifiedPropertyForDisplay(property) {
  const baseData = {
    id: property.id,
    title: property.title,
    description: property.description,
    location: property.location,
    price: property.price,
    images: property.images || [],
    category: property.type,
    type: property.type,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };

  // Add type-specific fields based on property type
  switch (property.type) {
    case 'plot':
      return {
        ...baseData,
        category: 'Plot',
        project: property.plotDetails?.project,
        developerName: property.plotDetails?.developerName,
        plotSize: property.plotDetails?.plotSize,
        investmentStartsFrom: property.plotDetails?.investmentStartsFrom,
        status: property.plotDetails?.status,
        investorDiscoveryKit: property.plotDetails?.investorDiscoveryKit
      };
      
    case 'franchise':
      return {
        ...baseData,
        category: 'Franchise',
        brand: property.franchiseDetails?.brand,
        name: property.franchiseDetails?.name,
        investment: property.franchiseDetails?.investment,
        industry: property.franchiseDetails?.industry,
        model: property.franchiseDetails?.model,
        segment: property.franchiseDetails?.segment,
        minInvestment: property.franchiseDetails?.minInvestment,
        maxInvestment: property.franchiseDetails?.maxInvestment,
        headquarter: property.franchiseDetails?.headquarter
      };
      
    case 'preleased':
      return {
        ...baseData,
        category: 'Pre-Leased',
        propertyType: 'Pre-Leased',
        tenant: property.preleasedDetails?.tenant,
        rent: property.preleasedDetails?.rent,
        roi: property.preleasedDetails?.roi,
        buildingName: property.preleasedDetails?.buildingName,
        leaseTerm: property.preleasedDetails?.leaseTerm
      };
      
    case 'vacant':
      return {
        ...baseData,
        category: 'Vacant',
        propertyType: 'Vacant',
        carpetArea: property.vacantDetails?.carpetArea,
        superArea: property.vacantDetails?.superArea,
        floor: property.vacantDetails?.floor,
        facing: property.vacantDetails?.facing,
        city: property.vacantDetails?.city,
        state: property.vacantDetails?.state,
        rent: property.vacantDetails?.rent
      };
      
    default:
      return baseData;
  }
}

/**
 * Transform legacy property data for display (your current logic)
 */
function transformLegacyPropertyForDisplay(property, collectionName, propertyId) {
  switch (collectionName) {
    case 'plots':
      return {
        id: propertyId,
        title: property.project || property.title || 'Plot Property',
        category: 'Plot',
        location: property.location || 'Location not specified',
        price: property.investmentStartsFrom?.amount || property.investmentStartsFrom || 0,
        images: property.images || [],
        
        // Include plot-specific fields
        project: property.project,
        developerName: property.developerName,
        status: property.status,
        plotSize: property.plotSize,
        investorDiscoveryKit: property.investorDiscoveryKit,
        description: property.description,
        investmentStartsFrom: property.investmentStartsFrom,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        ...property
      };
      
    case 'franchiseProperties':
      return {
        id: propertyId,
        title: property.name || property.brand || 'Franchise Property',
        category: 'Franchise',
        location: property.location || property.headquarter || 'Location not specified',
        price: parseInvestmentAmount(property.minInvestment || property.investment) || 0,
        images: property.image ? [property.image] : [],
        
        // Include franchise-specific fields  
        brand: property.brand,
        name: property.name,
        investment: property.investment,
        industry: property.industry,
        model: property.model,
        segment: property.segment,
        minInvestment: property.minInvestment,
        maxInvestment: property.maxInvestment,
        ...property
      };
      
    case 'preleasedProperties':
      return {
        id: propertyId,
        title: property.buildingName || property.tenant || 'Pre-leased Property',
        category: 'Pre-Leased',
        propertyType: 'Pre-Leased',
        location: property.location || 'Location not specified',
        price: parseInt(property.askingPrice || 0),
        images: property.image ? [property.image] : [],
        
        // Include pre-leased specific fields
        tenant: property.tenant,
        rent: property.rent,
        roi: property.roi,
        buildingName: property.buildingName,
        leaseTerm: property.leaseTerm,
        ...property
      };
      
    case 'vacantProperties':
      return {
        id: propertyId,
        title: property.location || 'Vacant Property',
        category: 'Vacant',
        propertyType: 'Vacant',
        location: property.location || `${property.city || ''}, ${property.state || ''}`.trim(),
        price: parseInt(property.rent || 0),
        images: property.image ? [property.image] : [],
        
        // Include vacant-specific fields
        carpetArea: property.carpetArea,
        superArea: property.superArea,
        floor: property.floor,
        facing: property.facing,
        city: property.city,
        state: property.state,
        rent: property.rent,
        ...property
      };
      
    default:
      return {
        id: propertyId,
        title: property.title || property.name || 'Property',
        category: 'Property',
        location: property.location || 'Location not specified',
        price: parseInt(property.price || 0),
        images: property.images || (property.image ? [property.image] : []),
        ...property
      };
  }
}

/**
 * Helper function to parse investment amounts
 */
function parseInvestmentAmount(investment) {
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
 * Search properties - supports both structures
 */
export async function searchProperties(searchQuery, category = null, limit = 20) {
  try {
    const migrated = await isMigrated();
    
    if (migrated) {
      return await searchUnifiedProperties(searchQuery, category, limit);
    } else {
      return await searchLegacyProperties(searchQuery, category, limit);
    }
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
}

/**
 * Search in unified properties collection
 */
async function searchUnifiedProperties(searchQuery, category, limit) {
  try {
    const propertiesRef = ref(database, 'properties');
    let queryRef = propertiesRef;
    
    // Apply category filter if specified
    if (category) {
      queryRef = query(propertiesRef, orderByChild('type'), equalTo(category.toLowerCase()));
    }
    
    if (limit) {
      queryRef = query(queryRef, limitToFirst(limit));
    }
    
    const snapshot = await get(queryRef);
    
    if (!snapshot.exists()) return [];
    
    const properties = snapshot.val();
    const results = [];
    
    Object.values(properties).forEach(property => {
      const displayProperty = transformUnifiedPropertyForDisplay(property);
      
      // Apply text search filter
      if (!searchQuery || matchesSearchQuery(displayProperty, searchQuery)) {
        results.push(displayProperty);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error searching unified properties:', error);
    return [];
  }
}

/**
 * Search in legacy collections
 */
async function searchLegacyProperties(searchQuery, category, limit) {
  // Implementation for legacy search - similar to your current search logic
  // This would search across the array-based collections
  try {
    const results = [];
    const collections = ['plots', 'franchiseProperties', 'preleasedProperties', 'vacantProperties'];
    
    for (const collectionName of collections) {
      const collectionRef = ref(database, collectionName);
      const snapshot = await get(collectionRef);
      
      if (snapshot.exists()) {
        const items = snapshot.val();
        
        if (Array.isArray(items)) {
          items.forEach((item, index) => {
            if (!item) return;
            
            const property = transformLegacyPropertyForDisplay(item, collectionName, index.toString());
            
            // Apply filters
            if (category && property.category.toLowerCase() !== category.toLowerCase()) return;
            if (searchQuery && !matchesSearchQuery(property, searchQuery)) return;
            
            results.push(property);
          });
        }
      }
      
      if (limit && results.length >= limit) break;
    }
    
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error searching legacy properties:', error);
    return [];
  }
}

/**
 * Check if property matches search query
 */
function matchesSearchQuery(property, query) {
  const searchFields = [
    property.title,
    property.location,
    property.description,
    property.category,
    property.brand,
    property.project,
    property.developerName
  ].filter(Boolean);
  
  const searchText = searchFields.join(' ').toLowerCase();
  return searchText.includes(query.toLowerCase());
}

/**
 * Get all properties - supports both structures
 */
export async function getAllProperties(category = null) {
  return await searchProperties('', category);
}

/**
 * Get property recommendations
 */
export async function getPropertyRecommendations(userId, limit = 5) {
  try {
    // Simple recommendation logic - get recent properties
    const properties = await getAllProperties();
    return properties
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Get migration status and statistics
 */
export async function getMigrationStatus() {
  try {
    const migrationRef = ref(database, 'migration/idMapping');
    const snapshot = await get(migrationRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        isMigrated: true,
        migrationDate: data.migrationDate,
        totalMapped: data.totalMapped,
        counters: data.counters,
        errors: data.errors?.length || 0
      };
    }
    
    return { isMigrated: false };
  } catch (error) {
    console.error('Error getting migration status:', error);
    return { isMigrated: false, error: error.message };
  }
}

// Export helper functions for backward compatibility
export {
  isMigrated,
  transformUnifiedPropertyForDisplay,
  transformLegacyPropertyForDisplay,
  parseInvestmentAmount
};