# 🚀 Database Migration Setup Guide

## ⚠️ CRITICAL: Read This First!

**DO NOT run this migration on production database without testing first!**

This migration will:
1. Transform your array-based collections to a unified object-based structure
2. Create globally unique property IDs to resolve conflicts
3. Update existing wishlists to use new property IDs
4. Fix the "Bird Estate" vs "High-Street" display issue

## 📋 Prerequisites

### 1. Install Dependencies
```bash
npm install firebase-admin
```

### 2. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **stealdeals-e89ab**
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Save it as `service-account-key.json` in your project root

### 3. Update Migration Script
Edit `migrate.js` line 8:
```javascript
// Change this line:
const serviceAccount = require('./path-to-your-service-account-key.json');

// To:
const serviceAccount = require('./service-account-key.json');
```

## 🧪 Testing Phase (REQUIRED)

### Step 1: Create Test Database
1. In Firebase Console, create a new test project or use a separate database
2. Import your current data to test database
3. Update the database URL in migration script

### Step 2: Run Test Migration
```bash
# Create backup first
node migrate.js backup

# Run migration on test database
node migrate.js migrate
```

### Step 3: Verify Test Results
1. Check that all properties are migrated correctly
2. Verify wishlist items point to correct properties
3. Test your application with the new structure

## 🔄 Production Migration

### Step 1: Prepare for Migration
```bash
# Ensure you're in the project directory
cd "c:\Users\LENOVO\Documents\stealdeals deploy real 6\stealdeals deploy real 6\stealdeals deploy\steal 2 - version 1\stealdeals"

# Install dependencies if not already installed
npm install firebase-admin
```

### Step 2: Create Backup
```bash
# This creates both local file and Firebase backup
node migrate.js backup
```

### Step 3: Run Migration
```bash
node migrate.js migrate
```

### Step 4: Monitor Progress
The migration will show progress like:
```
🚀 STARTING DATABASE MIGRATION
==============================
📦 Creating backup...
✅ Backup created: database-backup-2025-08-28T10-30-00-000Z.json
🔄 Starting collection migration...
  Processing franchiseProperties...
    ✅ 0 -> PROP_FRAN_001: KIDZEE PRE SCHOOL
    ✅ 1 -> PROP_FRAN_002: LITTLE LEADERS
  Processing plots...
    ✅ 1 -> PROP_PLOT_001: Bird Estate
  Processing vacantProperties...
    ✅ 1 -> PROP_VCNT_001: DEFENCE COLONY
💝 Migrating wishlists...
    ✅ user_31uXPBSPFTsBlod0SqC7IrTQAu4: 1 -> PROP_PLOT_001
🎉 MIGRATION COMPLETED SUCCESSFULLY!
```

## 🔍 Verification Steps

### 1. Check Firebase Console
- Navigate to your database in Firebase Console
- Verify new `properties` collection exists
- Check that `migration/idMapping` exists

### 2. Test Application
```bash
# Start your application
npm run dev

# Test these scenarios:
# 1. Go to wishlist page
# 2. Verify "Bird Estate" shows correctly
# 3. Add/remove properties from wishlist
# 4. Search for properties
# 5. View property details
```

### 3. Use Debug API
```bash
# Test the property that was causing issues
curl "http://localhost:3000/api/debug/property/PROP_PLOT_001"

# Should return Bird Estate details
```

## 🛠️ Update Your Application Code

### Option 1: Use Enhanced Firebase Service (Recommended)
Replace your current Firebase imports:
```javascript
// Before
import { getPropertyById } from '@/lib/firebase';

// After  
import { getPropertyById } from '@/lib/firebase-enhanced';
```

This enhanced service automatically detects whether migration has occurred and uses the appropriate structure.

### Option 2: Update Existing Service
If you prefer to update your existing `firebase.ts` file, replace the `getPropertyById` function with the new implementation from `firebase-enhanced.ts`.

## 🔧 Troubleshooting

### If Migration Fails
```bash
# Restore from backup
node migrate.js rollback database-backup-TIMESTAMP.json
```

### Common Issues

#### 1. Permission Denied
- Ensure service account key has correct permissions
- Check Firebase rules allow admin access

#### 2. Memory Issues
- For large databases, the migration might need chunking
- Contact support if you have >10,000 properties

#### 3. Network Timeouts
- Migration might take time for large datasets
- Re-run if it times out (it will resume from where it stopped)

## 📊 Expected Results

### Before Migration
```
❌ Issue: Property ID "1" exists in multiple collections
vacantProperties[1] = "High-Street in SOUTH DELHI"  
plots[1] = "Bird Estate"

❌ Wishlist shows wrong property due to search order
```

### After Migration
```
✅ Globally unique IDs:
PROP_VCNT_001 = "High-Street in SOUTH DELHI"
PROP_PLOT_001 = "Bird Estate"

✅ Wishlist shows correct property:
propertyId: "PROP_PLOT_001" → Bird Estate
```

## 🎯 Post-Migration Checklist

- [ ] Verify all properties migrated correctly
- [ ] Test wishlist functionality
- [ ] Check property search works
- [ ] Verify property details pages
- [ ] Test add/remove from wishlist
- [ ] Monitor for any errors in logs
- [ ] Update application code to use new structure
- [ ] Archive old collections (keep as backup)

## 🚨 Emergency Rollback

If critical issues arise:
1. Stop your application
2. Run rollback command
3. Restart application
4. Fix migration issues
5. Re-test on development database

## 📞 Support

If you encounter issues:
1. Check the error logs in migration output
2. Verify backup files exist
3. Test rollback procedure first
4. Provide specific error messages for support

## 🎉 Success Indicators

After successful migration:
- ✅ Bird Estate shows correctly in wishlist
- ✅ No more ID conflicts
- ✅ Faster property lookups
- ✅ Consistent data structure
- ✅ Application works normally
- ✅ New properties get unique IDs automatically

---

**Remember**: Test thoroughly before production deployment!