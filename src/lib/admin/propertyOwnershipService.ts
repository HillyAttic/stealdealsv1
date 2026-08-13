import { db, PropertyWithOwnership } from '../firebase-server-admin';

/**
 * Service for managing property ownership tracking
 * Handles adding ownership information to properties and filtering based on permissions
 */
export class PropertyOwnershipService {
  /**
   * Add ownership information to a property
   */
  static addOwnershipInfo(
    propertyData: any,
    createdBy: string
  ): any & PropertyWithOwnership {
    const now = new Date().toISOString();
    
    return {
      ...propertyData,
      createdBy,
      createdAt: now,
      lastModifiedBy: createdBy,
      lastModifiedAt: now,
    };
  }

  /**
   * Update ownership information when a property is modified
   */
  static updateOwnershipInfo(
    propertyData: any,
    modifiedBy: string
  ): any & PropertyWithOwnership {
    const now = new Date().toISOString();
    
    return {
      ...propertyData,
      lastModifiedBy: modifiedBy,
      lastModifiedAt: now,
    };
  }

  /**
   * Filter properties based on user permissions
   */
  static filterPropertiesByPermissions(
    properties: (any & PropertyWithOwnership)[],
    currentUserUid: string,
    canViewOthers: boolean,
    isSuperuser: boolean = false
  ): (any & PropertyWithOwnership)[] {
    // Superusers can see all properties
    if (isSuperuser) {
      return properties;
    }

    // If user can view others' properties, return all
    if (canViewOthers) {
      return properties;
    }

    // Otherwise, only return properties created by the current user
    return properties.filter(property => property.createdBy === currentUserUid);
  }

  /**
   * Check if a user can edit a specific property
   */
  static canEditProperty(
    property: any & PropertyWithOwnership,
    currentUserUid: string,
    canEditOthers: boolean,
    isSuperuser: boolean = false
  ): boolean {
    // Superusers can edit all properties
    if (isSuperuser) {
      return true;
    }

    // Property owners can always edit their own properties
    if (property.createdBy === currentUserUid) {
      return true;
    }

    // Check if user has permission to edit others' properties
    return canEditOthers;
  }

  /**
   * Migrate existing properties to include ownership information
   * This is a one-time migration function
   *
   * In Firestore, all properties are in the `properties` collection with a `type` discriminator.
   * This method finds properties of a given type that are missing ownership info and adds it.
   */
  static async migrateExistingProperties(
    propertyType: string,
    defaultCreatedBy: string
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    try {
      const snapshot = await db.collection('properties').where('type', '==', propertyType).get();

      if (snapshot.empty) {
        return { success: true, migratedCount: 0 };
      }

      const batch = db.batch();
      let migratedCount = 0;
      const now = new Date().toISOString();

      snapshot.docs.forEach(docSnap => {
        const property = docSnap.data();

        // Only migrate if createdBy doesn't exist
        if (!property.createdBy) {
          const updateData: any = {
            createdBy: defaultCreatedBy,
            createdAt: property.createdAt || now,
            lastModifiedBy: defaultCreatedBy,
            lastModifiedAt: property.lastModifiedAt || now,
          };

          batch.update(docSnap.ref, updateData);
          migratedCount++;
        }
      });

      // Apply all updates in a single batch operation
      if (migratedCount > 0) {
        await batch.commit();
      }

      return { success: true, migratedCount };
    } catch (error) {
      console.error(`Error migrating properties of type ${propertyType}:`, error);
      return {
        success: false,
        migratedCount: 0,
        error: 'Failed to migrate properties'
      };
    }
  }

  /**
   * Get property collections that need ownership tracking
   */
  static getPropertyCollections(): string[] {
    return [
      'vacant',
      'plots', 
      'franchise',
      'preleased'
    ];
  }
}