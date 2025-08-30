# Firebase Wishlist Database Setup Guide

## The Problem
You accidentally deleted the `/wishlists` node from your Firebase Realtime Database. Your application is looking for this structure to store user wishlist data.

## Required Database Structure
Your Firebase database should have this structure:
```
https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app/
├── analytics
├── franchiseProperties  
├── plots
├── preleasedProperties
├── properties
├── vacantProperties
└── wishlists            ← MISSING - NEEDS TO BE RECREATED
```

## Option 1: Manual Setup via Firebase Console (Recommended)

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **stealdeals-e89ab**
3. Click on **Realtime Database** in the left sidebar

### Step 2: Add the wishlists node
1. You should see your current database structure
2. Click on the **root node** (the top-level node)
3. Click the **+** button to add a child
4. Enter:
   - **Name**: `wishlists`
   - **Value**: `{}`
5. Click **Add**

### Step 3: Verify Setup
1. Your database should now show the `wishlists` node
2. Navigate to your application: `http://localhost:3000/dashboard/wishlist`
3. Try adding items to your wishlist - they should now save properly

## Option 2: Using the Setup Script (Browser Console)

### Step 1: Open Your Application
1. Navigate to `http://localhost:3000`
2. **Make sure you are signed in** to your account
3. Open browser developer tools (F12)
4. Go to the **Console** tab

### Step 2: Run the Setup Script
1. Copy and paste this script in the browser console:

```javascript
// Quick Firebase Wishlist Setup
async function setupWishlists() {
  try {
    const response = await fetch('/api/admin/setup-database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_wishlists_node' })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Wishlists node created successfully!');
      console.log('🔄 Please refresh the page and try using your wishlist');
    } else {
      console.log('❌ Setup failed:', result.error);
      console.log('💡 Please use the manual method instead');
    }
  } catch (error) {
    console.log('❌ Setup script failed:', error);
    console.log('💡 Please use the manual method instead');
  }
}

// Run the setup
setupWishlists();
```

### Step 3: Verify
1. Refresh your browser
2. Go to wishlist page: `http://localhost:3000/dashboard/wishlist`
3. Test adding items

## Option 3: Firebase CLI (For Developers)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the wishlists node
firebase database:set /wishlists "{}" --project stealdeals-e89ab
```

## How Wishlists Work

### Database Path Structure
When users add items to their wishlist, the data is stored at:
```
/wishlists/{clerk_user_id}/{wishlist_item_id}
```

### Example Structure
```json
{
  "wishlists": {
    "user_abc123": {
      "item_xyz789": {
        "userId": "user_abc123",
        "propertyId": "property_456",
        "addedAt": "2024-08-28T10:30:00.000Z",
        "priority": "medium",
        "notes": null
      }
    }
  }
}
```

## Verification Steps

After setup, verify everything works:

1. **Database Check**: Look in Firebase Console under `/wishlists`
2. **Application Test**: 
   - Go to `http://localhost:3000/dashboard/wishlist`
   - Add a property to wishlist
   - Check if it appears in Firebase
3. **User Isolation**: Each user should only see their own wishlist items

## Troubleshooting

### "Property already in wishlist" Error
- This means the setup worked but the property was already added
- Try with a different property

### "Permission denied" Error  
- Check Firebase rules allow authenticated users to read/write their wishlist
- Make sure you're signed in to the application

### Empty wishlist page
- Verify the `/wishlists` node exists in Firebase
- Check browser console for error messages
- Confirm you're signed in with a valid account

## Success Indicators

✅ You should see:
- `/wishlists` node in Firebase Console
- Ability to add/remove items from wishlist  
- Items persist after page refresh
- Each user sees only their own items

---

**Need Help?** 
- Check the browser console for error messages
- Verify you're signed in to the application
- Ensure the `/wishlists` node exists in Firebase Console