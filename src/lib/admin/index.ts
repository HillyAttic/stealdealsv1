// Export all admin services and types
export { AdminUserService } from './adminUserService';
export { PropertyOwnershipService } from './propertyOwnershipService';
export { initializeAdminSchema, createInitialSuperuser } from './initializeAdminSchema';

// Re-export types from firebase-server-admin
export type { AdminUser, PropertyWithOwnership } from '../firebase-server-admin';