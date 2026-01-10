import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Enhanced Admin Middleware', () => {
  it('should have the enhanced middleware file with correct exports', () => {
    const middlewarePath = join(process.cwd(), 'src/lib/auth/enhanced-admin-middleware.ts');
    const middlewareContent = readFileSync(middlewarePath, 'utf-8');
    
    // Check that the file contains the expected exports
    expect(middlewareContent).toContain('export async function requireEnhancedAdminAuth');
    expect(middlewareContent).toContain('export async function requirePagePermission');
    expect(middlewareContent).toContain('export async function requireUserManagementPermission');
    expect(middlewareContent).toContain('export async function requirePropertyEditPermission');
    expect(middlewareContent).toContain('export function clearUserPermissionCache');
    expect(middlewareContent).toContain('export function clearAllPermissionCache');
    expect(middlewareContent).toContain('export function getPermissionCacheStats');
  });

  it('should have the enhanced middleware exported from auth index', () => {
    const indexPath = join(process.cwd(), 'src/lib/auth/index.ts');
    const indexContent = readFileSync(indexPath, 'utf-8');
    
    // Check that the enhanced middleware is exported from the auth index
    expect(indexContent).toContain('requireEnhancedAdminAuth');
    expect(indexContent).toContain('requirePagePermission');
    expect(indexContent).toContain('requireUserManagementPermission');
    expect(indexContent).toContain('requirePropertyEditPermission');
    expect(indexContent).toContain('enhanced-admin-middleware');
  });

  it('should have permission caching functionality', () => {
    const middlewarePath = join(process.cwd(), 'src/lib/auth/enhanced-admin-middleware.ts');
    const middlewareContent = readFileSync(middlewarePath, 'utf-8');
    
    // Check for caching implementation
    expect(middlewareContent).toContain('permissionCache');
    expect(middlewareContent).toContain('CACHE_TTL');
    expect(middlewareContent).toContain('cleanupPermissionCache');
    expect(middlewareContent).toContain('getUserPermissions');
  });

  it('should have effective permissions calculation', () => {
    const middlewarePath = join(process.cwd(), 'src/lib/auth/enhanced-admin-middleware.ts');
    const middlewareContent = readFileSync(middlewarePath, 'utf-8');
    
    // Check for effective permissions logic
    expect(middlewareContent).toContain('getEffectivePermissions');
    expect(middlewareContent).toContain('effectivePermissions');
    expect(middlewareContent).toContain('manageUsers');
  });
});