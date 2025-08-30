/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Test type declarations to fix module resolution issues
// Based on memory: TypeScript errors in test files are often IDE-specific 
// when files are excluded from main tsconfig but tests can still run correctly

// Global type extensions for testing environment
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
  
  // Mock fetch for testing
  interface Global {
    fetch: any;
  }
}

// Simple wildcard declarations that should work with path mapping
declare module '@/*' {
  const content: any;
  export = content;
}

// If needed, we can add specific exports here
declare module '@/contexts/EnhancedWishlistContext';
declare module '@/contexts/EnhancedActivityContext';
declare module '@/contexts/ToastContext';
declare module '@/contexts/ActivityContext';
declare module '@/components/wishlist/WishlistButton';
declare module '@/components/wishlist/WishlistNavButton';
declare module '@/components/admin/UserDetails';
declare module '@/lib/database/wishlist';

// Ensure this file is treated as a module
export {};