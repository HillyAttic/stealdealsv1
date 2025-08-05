# Requirements Document

## Introduction

This feature addresses the Next.js 15 migration issue where `params` is now a Promise and must be unwrapped using `React.use()` before accessing properties. The current codebase has multiple files that directly access `params.id` and other param properties, which causes runtime warnings and will break in future Next.js versions.

## Requirements

### Requirement 1

**User Story:** As a developer, I want the application to be compatible with Next.js 15 param handling, so that there are no runtime warnings and the app remains future-proof.

#### Acceptance Criteria

1. WHEN a dynamic route component accesses params THEN it SHALL use React.use() to unwrap the params Promise
2. WHEN params are accessed in API routes THEN they SHALL be properly awaited if they are Promises
3. WHEN the application runs THEN there SHALL be no "param property was accessed directly" warnings
4. WHEN all param access is updated THEN the application SHALL function identically to before

### Requirement 2

**User Story:** As a developer, I want consistent param handling across all route types, so that the codebase follows Next.js 15 best practices.

#### Acceptance Criteria

1. WHEN page components access dynamic route params THEN they SHALL use React.use() consistently
2. WHEN API route handlers access params THEN they SHALL handle both Promise and direct param access patterns
3. WHEN admin pages access route params THEN they SHALL follow the same pattern as public pages
4. WHEN franchise detail pages access params THEN they SHALL not cause runtime warnings

### Requirement 3

**User Story:** As a user, I want the franchise detail pages and property edit pages to load without errors, so that I can access the content seamlessly.

#### Acceptance Criteria

1. WHEN visiting /franchise/[id] pages THEN they SHALL load without param access warnings
2. WHEN accessing admin property edit pages THEN they SHALL work with proper param handling
3. WHEN API endpoints receive dynamic route parameters THEN they SHALL process them correctly
4. WHEN the application handles route parameters THEN it SHALL maintain backward compatibility during the transition