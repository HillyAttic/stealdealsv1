import { database, PropertyWithOwnership } from '../firebase-server-admin';

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
   */
  static async migrateExistingProperties(
    collectionPath: string,
    defaultCreatedBy: string
  ): Promise<{ success: boolean; migratedCount: number; error?: string }> {
    try {
      const snapshot = await database.ref(collectionPath).once('value');
      const properties = snapshot.val();
      
      if (!properties) {
        return { success: true, migratedCount: 0 };
      }

      let migratedCount = 0;
      const updates: { [key: string]: any } = {};

      // Process each property
      Object.keys(properties).forEach(propertyId => {
        const property = properties[propertyId];
        
        // Only migrate if createdBy doesn't exist
        if (!property.createdBy) {
          const now = new Date().toISOString();
          updates[`${propertyId}/createdBy`] = defaultCreatedBy;
          updates[`${propertyId}/createdAt`] = property.createdAt || now;
          updates[`${propertyId}/lastModifiedBy`] = defaultCreatedBy;
          updates[`${propertyId}/lastModifiedAt`] = property.lastModifiedAt || now;
          migratedCount++;
        }
      });

      // Apply all updates in a single operation
      if (Object.keys(updates).length > 0) {
        await database.ref(collectionPath).update(updates);
      }

      return { success: true, migratedCount };
    } catch (error) {
      console.error(`Error migrating properties in ${collectionPath}:`, error);
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