# Design Document

## Overview

This design addresses the Next.js 15 migration requirement where `params` in dynamic routes are now Promises that must be unwrapped using `React.use()`. The solution involves updating all files that directly access param properties to use the new async pattern while maintaining backward compatibility and application functionality.

## Architecture

The migration follows Next.js 15's new async params pattern:

### Before (Next.js 14 and earlier):
```typescript
function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Direct access
}
```

### After (Next.js 15):
```typescript
function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id; // Async unwrapped access
}
```

## Components and Interfaces

### 1. Page Components with Dynamic Routes

**Files to Update:**
- `src/app/franchise/[id]/page.tsx`
- `src/app/admin/properties/edit/[id]/page.tsx` 
- `src/app/admin/Pre-Leased/edit/[id]/page.tsx`

**Pattern:**
```typescript
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  // Rest of component logic
}
```

### 2. API Route Handlers

**Files to Update:**
- `src/app/api/properties/[id]/route.ts`
- `src/app/api/franchises/[id]/route.ts`

**Pattern:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both Promise and direct access for compatibility
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;
  // Rest of handler logic
}
```

### 3. Component Props Interface Updates

**Updated Interfaces:**
```typescript
// For page components
interface PageProps {
  params: Promise<{ id: string }>;
}

// For API handlers  
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}
```

## Data Models

No changes to existing data models are required. The migration only affects how route parameters are accessed, not the underlying data structures for Properties, Franchises, or other entities.

## Error Handling

### 1. React.use() Error Handling
```typescript
try {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
} catch (error) {
  console.error('Failed to resolve params:', error);
  // Handle error appropriately
}
```

### 2. API Route Compatibility
```typescript
const getParamsId = async (params: Promise<{ id: string }> | { id: string }): Promise<string> => {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    return resolvedParams.id;
  } catch (error) {
    throw new Error('Invalid route parameters');
  }
};
```

### 3. Fallback Handling
- Maintain backward compatibility during transition
- Graceful degradation if param resolution fails
- Proper error boundaries for page components

## Testing Strategy

### 1. Unit Tests
- Test param resolution in isolation
- Verify React.use() integration
- Test API route parameter handling

### 2. Integration Tests
- Test complete page rendering with dynamic routes
- Verify API endpoints work with new param handling
- Test admin panel functionality

### 3. Migration Validation
- Verify no runtime warnings in console
- Test all dynamic routes load correctly
- Confirm API endpoints respond properly

### 4. Browser Compatibility
- Test in different browsers
- Verify React 19 compatibility
- Check for hydration issues

## Implementation Phases

### Phase 1: Page Components
1. Update franchise detail page
2. Update admin property edit pages
3. Test page rendering and navigation

### Phase 2: API Routes
1. Update property API routes
2. Update franchise API routes  
3. Test API functionality

### Phase 3: Validation & Cleanup
1. Remove any remaining direct param access
2. Update TypeScript interfaces
3. Comprehensive testing

## Migration Considerations

### Backward Compatibility
- Handle both Promise and direct param patterns in API routes
- Gradual migration approach
- Fallback mechanisms

### Performance Impact
- React.use() is optimized for this use case
- Minimal performance overhead
- No significant bundle size impact

### Developer Experience
- Clear error messages for param resolution failures
- Consistent patterns across all dynamic routes
- Updated TypeScript types for better IDE support