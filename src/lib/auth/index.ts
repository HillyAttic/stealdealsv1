// Authentication utilities index
export * from './jwt';
export * from './password';
export * from './google-oauth';

// Export session utilities (excluding duplicates)
export { 
  createSession, 
  getSession, 
  getSessionFromRequest, 
  clearSession, 
  isAuthenticated, 
  isAdmin,
  type SessionData 
} from './session';

// Export middleware utilities
export { 
  requireAuth, 
  requireAdmin, 
  optionalAuth,
  type AuthenticatedRequest 
} from './middleware';

// Export enhanced admin middleware utilities
export {
  requireEnhancedAdminAuth,
  requirePagePermission,
  requireUserManagementPermission,
  requirePropertyEditPermission,
  clearUserPermissionCache,
  clearAllPermissionCache,
  getPermissionCacheStats,
  type EnhancedAdminUser,
  type EnhancedAuthenticatedAdminRequest
} from './enhanced-admin-middleware';

// Re-export validation schemas
export * from '../validations/auth';

// Re-export types
export * from '../../types/auth';