# Firebase Admin User Management Setup

This directory contains the Firebase Admin SDK configuration and services for managing admin users with role-based permissions.

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
```

**Option 1: Service Account Key (Recommended for production)**
- Download your Firebase service account key from the Firebase Console
- Convert the JSON file to a single-line string
- Set it as the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

**Option 2: Default Credentials (For local development)**
- Install and configure Google Cloud CLI: `gcloud auth application-default login`
- Leave `FIREBASE_SERVICE_ACCOUNT_KEY` empty to use default credentials

### 2. Database Schema Initialization

Initialize the admin user management schema:

```bash
# Option 1: Using the initialization script
node scripts/initialize-admin-schema.js

# Option 2: Using the API endpoint
curl -X POST http://localhost:3000/api/admin/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "createSuperuser": true,
    "superuserData": {
      "email": "admin@yourdomain.com",
      "password": "your-secure-password",
      "name": "System Administrator"
    }
  }'
```

### 3. Database Structure

The system creates the following structure in Firebase Realtime Database:

```
admin_users/
  {uid}/
    uid: string
    email: string
    name: string
    role: "superuser" | "subuser"
    permissions:
      pages:
        vacant: boolean
        plots: boolean
        franchise: boolean
        preleased: boolean
      viewOthers: boolean
      editOthers: boolean
    createdAt: string (ISO)
    createdBy: string (UID)
```

### 4. Property Ownership Tracking

All properties are enhanced with ownership information:

```typescript
interface PropertyWithOwnership {
  // ... existing property fields
  createdBy: string;        // UID of creator
  createdAt: string;        // ISO timestamp
  lastModifiedBy?: string;  // UID of last modifier
  lastModifiedAt?: string;  // ISO timestamp
}
```

## Services

### AdminUserService

Handles admin user creation, management, and permission verification:

- `createAdminUser()` - Create new admin users
- `getAdminUser()` - Retrieve admin user data
- `getAllAdminUsers()` - Get all admin users
- `updateAdminUserPermissions()` - Update user permissions
- `deleteAdminUser()` - Delete admin users
- `verifyAdminUser()` - Verify admin status and permissions

### PropertyOwnershipService

Manages property ownership tracking and permission filtering:

- `addOwnershipInfo()` - Add ownership to new properties
- `updateOwnershipInfo()` - Update ownership on modifications
- `filterPropertiesByPermissions()` - Filter properties based on user permissions
- `canEditProperty()` - Check edit permissions for specific properties
- `migrateExistingProperties()` - One-time migration for existing properties

## Usage Examples

### Creating an Admin User

```typescript
import { AdminUserService } from '@/lib/admin';

const result = await AdminUserService.createAdminUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure-password',
  role: 'subuser',
  permissions: {
    pages: {
      vacant: true,
      plots: false,
      franchise: true,
      preleased: false,
    },
    viewOthers: false,
    editOthers: false,
  },
  createdBy: currentUserUid,
});
```

### Verifying Admin Permissions

```typescript
import { AdminUserService } from '@/lib/admin';

const verification = await AdminUserService.verifyAdminUser(userUid);
if (verification.isAdmin && verification.user) {
  // User is an admin, check their permissions
  const canAccessVacant = verification.user.permissions.pages.vacant;
  const canViewOthers = verification.user.permissions.viewOthers;
}
```

### Adding Ownership to Properties

```typescript
import { PropertyOwnershipService } from '@/lib/admin';

// When creating a new property
const propertyWithOwnership = PropertyOwnershipService.addOwnershipInfo(
  propertyData,
  currentUserUid
);

// When updating a property
const updatedProperty = PropertyOwnershipService.updateOwnershipInfo(
  existingProperty,
  currentUserUid
);
```

## Security Considerations

1. **Service Account Security**: Keep your Firebase service account key secure and never commit it to version control
2. **Permission Validation**: Always verify permissions on both client and server side
3. **Audit Trail**: All admin actions are logged with creator/modifier information
4. **Role Separation**: Maintain clear separation between superusers and subusers
5. **Authentication Separation**: Admin users (Firebase) are separate from regular users (Clerk)

## Troubleshooting

### Common Issues

1. **"Unable to initialize Firebase Admin SDK"**
   - Check that `FIREBASE_SERVICE_ACCOUNT_KEY` or default credentials are configured
   - Verify that `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct

2. **"Permission denied" errors**
   - Ensure Firebase Realtime Database rules allow admin operations
   - Verify that the service account has the necessary permissions

3. **"Email already exists" during user creation**
   - The email is already registered in Firebase Authentication
   - Use a different email or delete the existing user first

### Firebase Database Rules

Ensure your Firebase Realtime Database rules allow admin operations:

```json
{
  "rules": {
    "admin_users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "vacant": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "plots": {
      ".read": "auth != null", 
      ".write": "auth != null"
    },
    "franchise": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "preleased": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Next Steps

After completing this setup:

1. Implement the user creation API endpoint (Task 2)
2. Add authentication middleware (Task 3)
3. Create the user management UI components (Tasks 5-6)
4. Implement property ownership tracking in existing APIs (Tasks 7-8)