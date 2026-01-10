# Firebase Admin User Management - Quick Reference

## User Roles

### Superuser
- **Full access** to all features
- Can create and manage other admin users
- Can view and edit ALL properties
- Can access ALL pages
- Automatically gets all permissions

### Subuser
- **Limited access** based on assigned permissions
- Cannot manage other admin users
- Can only view/edit properties based on permissions
- Can only access allowed pages
- Permissions must be explicitly granted

## Permission Types

### 1. Page Access Permissions
Controls which admin pages a user can access:

| Permission | Allows Access To |
|------------|------------------|
| `pages.vacant` | `/admin/vacant` - Vacant properties page |
| `pages.plots` | `/admin/plots` - Plots page |
| `pages.franchise` | `/admin/franchise` - Franchise page |
| `pages.preleased` | `/admin/Pre-Leased` - Pre-leased properties page |

**Note:** Dashboard, Users, and Wishlist Analytics are accessible to all admin users.

### 2. Property Viewing Permission
| Permission | Description |
|------------|-------------|
| `viewOthers` | If **true**: User can see ALL properties<br>If **false**: User can ONLY see properties they created |

### 3. Property Editing Permission
| Permission | Description |
|------------|-------------|
| `editOthers` | If **true**: User can edit/delete ANY property<br>If **false**: User can ONLY edit/delete properties they created |

### 4. User Management Permission
| Permission | Description |
|------------|-------------|
| `manageUsers` | If **true**: User can create/manage admin users (superuser only)<br>If **false**: User cannot access admin management |

## Permission Matrix

| User Type | View Own Properties | View Others' Properties | Edit Own Properties | Edit Others' Properties | Manage Users | Access All Pages |
|-----------|---------------------|------------------------|---------------------|------------------------|--------------|------------------|
| **Superuser** | ✅ Always | ✅ Always | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Subuser** (viewOthers=true, editOthers=true) | ✅ | ✅ | ✅ | ✅ | ❌ | Based on page permissions |
| **Subuser** (viewOthers=true, editOthers=false) | ✅ | ✅ | ✅ | ❌ | ❌ | Based on page permissions |
| **Subuser** (viewOthers=false, editOthers=false) | ✅ | ❌ | ✅ | ❌ | ❌ | Based on page permissions |

## Common Permission Scenarios

### Scenario 1: Property Manager (Full Property Access)
**Use Case:** User needs to manage all properties but not create admin users

**Permissions:**
```json
{
  "role": "subuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": true,
      "franchise": true,
      "preleased": true
    },
    "viewOthers": true,
    "editOthers": true
  }
}
```

### Scenario 2: Data Entry Specialist (Limited to Vacant Properties)
**Use Case:** User only enters vacant property data, can see all but only edit their own

**Permissions:**
```json
{
  "role": "subuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": false,
      "franchise": false,
      "preleased": false
    },
    "viewOthers": true,
    "editOthers": false
  }
}
```

### Scenario 3: Regional Manager (Isolated Property Management)
**Use Case:** User manages properties in their region, cannot see others' properties

**Permissions:**
```json
{
  "role": "subuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": true,
      "franchise": true,
      "preleased": true
    },
    "viewOthers": false,
    "editOthers": false
  }
}
```

### Scenario 4: Read-Only Analyst
**Use Case:** User needs to view all properties for analysis but cannot edit

**Permissions:**
```json
{
  "role": "subuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": true,
      "franchise": true,
      "preleased": true
    },
    "viewOthers": true,
    "editOthers": false
  }
}
```

## API Endpoints

### Get All Admin Users
```
GET /api/admin/firebase-users
```
**Auth Required:** Yes (Superuser only)  
**Returns:** List of all Firebase admin users

### Create New Admin User
```
POST /api/admin/firebase-users
```
**Auth Required:** Yes (Superuser only)  
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "subuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": false,
      "franchise": false,
      "preleased": false
    },
    "viewOthers": false,
    "editOthers": false
  }
}
```

### Verify User Permissions
```
GET /api/auth/verify-permissions
```
**Auth Required:** Yes  
**Returns:** Current user's permissions and effective permissions

## Database Structure

### Admin Users Collection
**Path:** `admin_users/{uid}`

**Schema:**
```json
{
  "uid": "firebase-uid-string",
  "email": "user@example.com",
  "name": "User Name",
  "role": "superuser" | "subuser",
  "permissions": {
    "pages": {
      "vacant": boolean,
      "plots": boolean,
      "franchise": boolean,
      "preleased": boolean
    },
    "viewOthers": boolean,
    "editOthers": boolean
  },
  "createdAt": "2026-01-09T12:00:00.000Z",
  "createdBy": "creator-uid"
}
```

### Property Ownership Tracking
**Field:** `createdBy` (string)  
**Value:** Firebase UID of the admin user who created the property

**Example:**
```json
{
  "id": "property-123",
  "title": "Vacant Office Space",
  "category": "Office",
  "location": "Mumbai",
  "createdBy": "firebase-uid-of-creator",
  "createdAt": 1704801600000,
  "lastModifiedBy": "firebase-uid-of-last-editor",
  "updatedAt": 1704888000000
}
```

## UI Components

### Admin User Management Page
**Path:** `/admin/subusers`  
**Access:** Superuser only  
**Features:**
- View all admin users
- Create new admin users
- See statistics (total, superusers, subusers)
- Role and permission summary for each user

### Navigation
**Component:** `AdminLayout.tsx`  
**Behavior:**
- Dynamically shows/hides nav items based on permissions
- Redirects unauthorized access to dashboard
- Shows user role in header

## Security Notes

1. **Authentication Required:** All admin operations require valid Firebase authentication token
2. **Permission Caching:** Permissions are cached for 5 minutes for performance
3. **Token Verification:** JWT tokens are verified on every API request
4. **Role Enforcement:** Superuser-only operations are strictly enforced
5. **Property Ownership:** Property ownership is immutable (createdBy cannot be changed)

## Troubleshooting

### User can't see expected properties
- Check `viewOthers` permission
- Verify properties have `createdBy` field
- Clear permission cache (wait 5 minutes or restart server)

### User can access restricted pages
- Check role (superusers bypass all restrictions)
- Verify page permissions in database
- Check if user is using direct URL (should redirect)

### Permission changes not taking effect
- Permissions are cached for 5 minutes
- User needs to log out and log back in
- Or wait for cache to expire

### Can't create admin users
- Verify you're logged in as superuser
- Check Firebase Admin SDK configuration
- Verify database write permissions

## Best Practices

1. **Principle of Least Privilege:** Only grant permissions that are necessary
2. **Regular Audits:** Periodically review user permissions
3. **Strong Passwords:** Enforce minimum 6 characters (consider increasing)
4. **Unique Emails:** Each admin user must have a unique email
5. **Documentation:** Document why each user has specific permissions
6. **Testing:** Test permission changes in a development environment first

## Related Files

- `src/components/admin/FirebaseAdminUserManagement.tsx` - UI component
- `src/app/admin/subusers/page.tsx` - Admin management page
- `src/lib/admin/adminUserService.ts` - Backend service
- `src/app/api/admin/firebase-users/route.ts` - API endpoints
- `src/lib/auth/enhanced-admin-middleware.ts` - Permission middleware
- `src/app/admin/components/AdminLayout.tsx` - Navigation layout
