# Firebase Database Migration Plan

## 🎯 OBJECTIVE
Transform the current array-based Firebase structure to an object-based structure with globally unique IDs to resolve conflicts and improve performance.

## 🚨 CURRENT PROBLEMS

### 1. Array-Based Collections Create ID Conflicts
```
Current Structure (PROBLEMATIC):
├── franchiseProperties: [null, {...}, {...}]  ← Array indices as IDs
├── plots: [null, {...}, {...}]               ← Same ID "1" exists here
├── preleasedProperties: [null, {...}, {...}] ← And here
├── vacantProperties: [{...}, {...}]          ← And here
└── wishlists: {...}
```

**Problem**: Property ID "1" exists in multiple collections, causing wrong data retrieval.

### 2. Specific Issue: Bird Estate vs High-Street
- **Expected**: Wishlist shows "Bird Estate" (from plots collection)  
- **Actual**: Shows "High-Street in SOUTH DELHI" (from vacantProperties collection)
- **Cause**: `getPropertyById("1")` finds vacantProperties[1] first due to search order

## 🎯 PROPOSED SOLUTION

### 1. Migrate to Object-Based Collections with Global Unique IDs

```
New Structure (RECOMMENDED):
├── properties: {
│   ├── "PROP_FRAN_001": {...}  ← Franchise property
│   ├── "PROP_PLOT_001": {...}  ← Plot property  
│   ├── "PROP_PRLS_001": {...}  ← Pre-leased property
│   ├── "PROP_VCNT_001": {...}  ← Vacant property
│   └── "PROP_LEGC_001": {...}  ← Legacy property
│   }
├── analytics: {...}
└── wishlists: {
    "user_id": {
      "wishlist_item_id": {
        "propertyId": "PROP_PLOT_001",  ← References unique property
        "addedAt": "...",
        "priority": "..."
      }
    }
  }
```

## 📋 MIGRATION STRATEGY

### Phase 1: Create New Unified Properties Collection

#### Global Unique ID Format:
- **Franchise**: `PROP_FRAN_{sequential}`
- **Plot**: `PROP_PLOT_{sequential}`
- **Pre-leased**: `PROP_PRLS_{sequential}`
- **Vacant**: `PROP_VCNT_{sequential}`
- **Legacy**: `PROP_LEGC_{sequential}`

#### Why This Format:
1. **Globally Unique**: No conflicts across collections
2. **Type Identifiable**: Easy to determine property type from ID
3. **Sortable**: Sequential numbers maintain order
4. **Future-proof**: Can add new types easily

### Phase 2: Standardized Property Schema

```javascript
// Unified Property Object Structure
{
  // Core fields (all properties)
  "id": "PROP_PLOT_001",
  "type": "plot|franchise|preleased|vacant|legacy",
  "title": "Bird Estate",
  "description": "...",
  "location": "NEAR DELHI - GURUGRAM BORDER",
  "price": 46000,
  "images": ["url1", "url2"],
  "createdAt": timestamp,
  "updatedAt": timestamp,
  
  // Type-specific fields in nested objects
  "plotDetails": {
    "project": "Bird Estate",
    "developerName": "GLS",
    "plotSize": {...},
    "investmentStartsFrom": {...}
  },
  
  "franchiseDetails": {
    "brand": "...",
    "investment": "...",
    "industry": "...",
    "model": "..."
  },
  
  "preleasedDetails": {
    "tenant": "...",
    "rent": "...",
    "leaseTerm": "...",
    "roi": "..."
  },
  
  "vacantDetails": {
    "carpetArea": "...",
    "superArea": "...",
    "floor": "...",
    "facing": "..."
  }
}
```

## 🛠️ IMPLEMENTATION PLAN

### Step 1: Create Migration Script

```javascript
// migration-script.js
const migrateDatabase = async () => {
  // 1. Read all existing collections
  // 2. Generate new unique IDs
  // 3. Transform data structure
  // 4. Create new unified collection
  // 5. Update existing wishlists with new IDs
  // 6. Backup original data
}
```

### Step 2: ID Mapping Strategy

Create a mapping table to convert old IDs to new IDs:
```javascript
{
  "oldToNewIdMapping": {
    "franchiseProperties_0": "PROP_FRAN_001",
    "franchiseProperties_1": "PROP_FRAN_002",
    "plots_1": "PROP_PLOT_001",           // Bird Estate gets unique ID
    "vacantProperties_1": "PROP_VCNT_001", // High-Street gets different ID
    // ... more mappings
  }
}
```

### Step 3: Wishlist Migration

Update existing wishlist entries:
```javascript
// Before
"wishlists": {
  "user_id": {
    "item_id": {
      "propertyId": "1"  // Ambiguous!
    }
  }
}

// After  
"wishlists": {
  "user_id": {
    "item_id": {
      "propertyId": "PROP_PLOT_001",  // Specific to Bird Estate
      "oldPropertyId": "1",           // Keep for reference
      "migratedAt": "2025-08-28T..."
    }
  }
}
```

## 🔧 TECHNICAL IMPLEMENTATION

### 1. New Property Service Functions

```javascript
// Generate unique IDs
const generatePropertyId = (type, sequence) => {
  const prefixes = {
    'franchise': 'PROP_FRAN',
    'plot': 'PROP_PLOT', 
    'preleased': 'PROP_PRLS',
    'vacant': 'PROP_VCNT',
    'legacy': 'PROP_LEGC'
  };
  return `${prefixes[type]}_${sequence.toString().padStart(3, '0')}`;
};

// Enhanced property retrieval
const getPropertyById = async (propertyId) => {
  // Direct lookup in unified collection
  const propertyRef = ref(database, `properties/${propertyId}`);
  const snapshot = await get(propertyRef);
  return snapshot.exists() ? snapshot.val() : null;
};
```

### 2. Migration Script Components

```javascript
// Count existing properties for ID generation
const countPropertiesByType = (data) => {
  return {
    franchise: data.franchiseProperties?.filter(p => p).length || 0,
    plot: data.plots?.filter(p => p).length || 0,
    preleased: data.preleasedProperties?.filter(p => p).length || 0,
    vacant: data.vacantProperties?.filter(p => p).length || 0,
    legacy: data.properties?.filter(p => p).length || 0
  };
};

// Transform property data
const transformProperty = (property, type, newId) => {
  const baseProperty = {
    id: newId,
    type: type,
    title: extractTitle(property, type),
    description: property.description || '',
    location: extractLocation(property, type),
    price: extractPrice(property, type),
    images: extractImages(property, type),
    createdAt: property.createdAt || Date.now(),
    updatedAt: property.updatedAt || Date.now()
  };
  
  // Add type-specific details
  switch(type) {
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
        investment: property.investment,
        industry: property.industry,
        model: property.model,
        segment: property.segment,
        numberOfOutlets: property.numberOfOutlets,
        royalty: property.royalty,
        minInvestment: property.minInvestment,
        maxInvestment: property.maxInvestment
      };
      break;
      
    // Add other types...
  }
  
  return baseProperty;
};
```

## 📊 MIGRATION BENEFITS

### 1. Resolves ID Conflicts
- ✅ Bird Estate gets unique ID: `PROP_PLOT_001`
- ✅ High-Street gets unique ID: `PROP_VCNT_001`  
- ✅ No more ambiguous property lookups

### 2. Improved Performance
- ✅ Direct property lookup by ID (O(1) vs O(n))
- ✅ No need to search multiple collections
- ✅ Reduced Firebase read operations

### 3. Better Data Consistency  
- ✅ Standardized property schema
- ✅ Type-safe property access
- ✅ Centralized property management

### 4. Future-Proof Architecture
- ✅ Easy to add new property types
- ✅ Scalable ID generation
- ✅ Better analytics capabilities

## 🚨 MIGRATION SAFETY

### 1. Backup Strategy
```javascript
// Create backup before migration
const createBackup = async () => {
  const timestamp = new Date().toISOString();
  await set(ref(database, `backups/pre-migration-${timestamp}`), originalData);
};
```

### 2. Rollback Plan
```javascript
// Keep old collections during transition
const migrationPhases = {
  phase1: 'Create new structure alongside old',
  phase2: 'Migrate wishlists to use new IDs', 
  phase3: 'Update application to use new structure',
  phase4: 'Archive old collections (keep as backup)'
};
```

### 3. Gradual Migration
- Keep both old and new structures during transition
- Update frontend to use new structure gradually
- Monitor for any issues before final cleanup

## 📋 EXECUTION CHECKLIST

- [ ] Create migration script
- [ ] Test migration on development data
- [ ] Create backup of production database
- [ ] Run migration script
- [ ] Update wishlist references
- [ ] Update application code to use new structure
- [ ] Test all functionality
- [ ] Monitor for issues
- [ ] Archive old collections (don't delete yet)

## 🔄 ROLLBACK PROCEDURE

If issues arise:
1. Stop new writes to migrated structure
2. Restore from backup
3. Fix migration issues
4. Re-run migration with fixes

## 📈 EXPECTED OUTCOMES

After migration:
- ✅ Wishlist shows correct properties
- ✅ No more ID conflicts
- ✅ Faster property lookups
- ✅ Consistent data structure
- ✅ Better user experience
- ✅ Easier maintenance and scaling

This migration will resolve your current issues and set up a solid foundation for future growth.