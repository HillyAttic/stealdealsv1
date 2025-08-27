import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ref, get, update, set } from 'firebase/database';
import { database } from '@/lib/firebase';

const vacantPropertiesRef = ref(database, 'vacantProperties');

// Define the required fields that should be kept
const REQUIRED_FIELDS = [
  'location', 'state', 'city', 'district', 'propertyStatus', 'category', 
  'floor', 'facing', 'superArea', 'carpetArea', 'propertyType', 'reference', 
  'contactName', 'rent', 'length', 'width', 'height', 'image'
];

// Fields to be completely removed from the database
const FIELDS_TO_REMOVE = [
  'advance', 'area', 'areaOnSale', 'askingPrice', 'buildingName', 'channel',
  'contactNumber', 'createdAt', 'description', 'escalation', 'featured', 'id',
  'leaseTerm', 'lockIn', 'price', 'remainingLease', 'rentalType', 'roi',
  'securityDeposit', 'subDistrict', 'tenant', 'title', 'totalArea', 'updatedAt'
];

// Comprehensive migration endpoint to clean database schema
export async function POST(request: NextRequest) {
  try {
    console.log('Starting comprehensive vacant properties database cleanup...');
    console.log('Required fields:', REQUIRED_FIELDS);
    console.log('Fields to remove:', FIELDS_TO_REMOVE);
    
    // Get all vacant properties
    const snapshot = await get(vacantPropertiesRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        message: 'No vacant properties found to migrate',
        updated: 0,
        fieldsRemoved: 0,
        cleanedProperties: []
      });
    }
    
    let updatedCount = 0;
    let totalFieldsRemoved = 0;
    const cleanedProperties: any[] = [];
    
    // Process each property
    const cleanupPromises: Promise<void>[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const propertyId = childSnapshot.key;
      const propertyData = childSnapshot.val();
      
      if (propertyId && propertyData) {
        const cleanupPromise = async () => {
          // Create clean property object with only required fields
          const cleanProperty: any = {};
          let fieldsRemovedFromThisProperty = 0;
          let needsUpdate = false;
          
          // Copy only required fields
          REQUIRED_FIELDS.forEach(field => {
            if (propertyData.hasOwnProperty(field)) {
              cleanProperty[field] = propertyData[field];
            }
          });
          
          // Ensure propertyType is set to 'Vacant'
          if (!cleanProperty.propertyType || cleanProperty.propertyType !== 'Vacant') {
            console.log(`Setting propertyType to 'Vacant' for property ${propertyId}`);
            cleanProperty.propertyType = 'Vacant';
            needsUpdate = true;
          }
          
          // Count fields that will be removed
          Object.keys(propertyData).forEach(field => {
            if (!REQUIRED_FIELDS.includes(field)) {
              fieldsRemovedFromThisProperty++;
              needsUpdate = true;
            }
          });
          
          // Only update if changes are needed
          if (needsUpdate) {
            console.log(`Cleaning property ${propertyId}: removing ${fieldsRemovedFromThisProperty} unwanted fields`);
            
            // Replace the entire property with the clean version
            const propertyRef = ref(database, `vacantProperties/${propertyId}`);
            await set(propertyRef, cleanProperty);
            
            updatedCount++;
            totalFieldsRemoved += fieldsRemovedFromThisProperty;
            
            cleanedProperties.push({
              id: propertyId,
              location: cleanProperty.location || 'Unknown',
              fieldsRemoved: fieldsRemovedFromThisProperty,
              removedFields: Object.keys(propertyData).filter(field => !REQUIRED_FIELDS.includes(field))
            });
          }
        };
        
        cleanupPromises.push(cleanupPromise());
      }
    });
    
    // Execute all cleanup operations
    await Promise.all(cleanupPromises);
    
    console.log(`Database cleanup completed. Updated ${updatedCount} properties, removed ${totalFieldsRemoved} total fields.`);
    
    return NextResponse.json({
      success: true,
      message: `Database cleanup completed successfully. Updated ${updatedCount} properties and removed ${totalFieldsRemoved} unnecessary fields.`,
      updated: updatedCount,
      fieldsRemoved: totalFieldsRemoved,
      cleanedProperties: cleanedProperties,
      requiredFields: REQUIRED_FIELDS,
      removedFieldTypes: FIELDS_TO_REMOVE
    });
    
  } catch (error) {
    console.error('Error during vacant properties database cleanup:', error);
    return NextResponse.json(
      { error: 'Database cleanup failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to check which vacant properties need comprehensive cleanup
export async function GET() {
  try {
    const snapshot = await get(vacantPropertiesRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({
        total: 0,
        needsCleanup: 0,
        totalUnwantedFields: 0,
        properties: [],
        requiredFields: REQUIRED_FIELDS,
        fieldsToRemove: FIELDS_TO_REMOVE
      });
    }
    
    const properties: any[] = [];
    let needsCleanup = 0;
    let totalUnwantedFields = 0;
    
    snapshot.forEach((childSnapshot) => {
      const propertyId = childSnapshot.key;
      const propertyData = childSnapshot.val();
      
      if (propertyId && propertyData) {
        const hasCorrectPropertyType = propertyData.propertyType === 'Vacant';
        
        // Count unwanted fields
        const unwantedFields = Object.keys(propertyData).filter(field => !REQUIRED_FIELDS.includes(field));
        const unwantedFieldsCount = unwantedFields.length;
        
        // Property needs cleanup if it has wrong property type OR unwanted fields
        const needsCleanupCheck = !hasCorrectPropertyType || unwantedFieldsCount > 0;
        
        if (needsCleanupCheck) {
          needsCleanup++;
          totalUnwantedFields += unwantedFieldsCount;
        }
        
        properties.push({
          id: propertyId,
          location: propertyData.location || null,
          currentPropertyType: propertyData.propertyType || null,
          category: propertyData.category || null,
          unwantedFieldsCount: unwantedFieldsCount,
          unwantedFields: unwantedFields,
          totalFields: Object.keys(propertyData).length,
          needsCleanup: needsCleanupCheck,
          propertyTypeCorrect: hasCorrectPropertyType,
          schemaClean: unwantedFieldsCount === 0
        });
      }
    });
    
    return NextResponse.json({
      total: properties.length,
      needsCleanup,
      totalUnwantedFields,
      properties,
      requiredFields: REQUIRED_FIELDS,
      fieldsToRemove: FIELDS_TO_REMOVE,
      averageUnwantedFieldsPerProperty: properties.length > 0 ? Math.round(totalUnwantedFields / properties.length) : 0
    });
    
  } catch (error) {
    console.error('Error checking vacant properties cleanup status:', error);
    return NextResponse.json(
      { error: 'Failed to check cleanup status' },
      { status: 500 }
    );
  }
}