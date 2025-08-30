# Migration Troubleshooting Guide

## Problem: "Failed to run migration" Error

### Quick Fix Steps:

1. **Open the migration page** in your admin panel: `/admin/migrate`

2. **First, run the authentication test**:
   - Click the "Test Authentication" button in the Debug section
   - This will verify your admin login and environment setup

3. **Check the browser console**:
   - Press F12 to open developer tools
   - Go to the Console tab
   - Look for any error messages when clicking migration buttons

4. **Common Issues and Solutions**:

#### Authentication Issues:
- **Error: "Authentication required"**
  - Solution: Make sure you're logged in as admin
  - Go to `/admin/login` and log in again

- **Error: "Admin access required"** 
  - Solution: Your account doesn't have admin role
  - Contact system administrator to set admin role

#### Environment Issues:
- **Error: "Database connection failed"**
  - Solution: Check Firebase configuration
  - Verify `.env.local` file has correct Firebase settings

- **Error: "Invalid token"**
  - Solution: Clear cookies and login again
  - In browser: Settings > Privacy > Clear browsing data

#### Network Issues:
- **Error: "HTTP 500: Internal Server Error"**
  - Solution: Check server logs in terminal
  - Restart the development server: `npm run dev`

- **Error: "Failed to fetch"**
  - Solution: Network connectivity issue
  - Check if server is running on correct port

### Detailed Debugging:

1. **Check Environment Variables**:
   ```bash
   # Make sure these are set in .env.local:
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

2. **Verify Admin Login**:
   - Go to `/admin/login`
   - Enter admin credentials
   - Check if you can access other admin pages

3. **Test Database Connection**:
   - Use the "Test Authentication" button
   - Check the response for Firebase connection status
   - Verify environment variables are properly loaded

4. **Check Server Logs**:
   - Look at terminal where `npm run dev` is running
   - Check for any error messages during migration attempts
   - Firebase connection errors will show here

### Manual Database Check:

If you need to verify the database state manually:

1. **Check Firebase Console**:
   - Go to Firebase Console > Realtime Database
   - Look for these collections:
     - `franchiseProperties`
     - `plots` 
     - `preleasedProperties`
     - `vacantProperties`
     - `wishlists`

2. **Verify ID Conflicts**:
   - Check if same index exists in multiple collections
   - Example: `franchiseProperties[1]`, `plots[1]`, etc.

### If All Else Fails:

1. **Restart everything**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear all browser data

3. **Contact Support**:
   - Provide error messages from console
   - Include authentication test results
   - Share any server terminal output

## Success Indicators:

✅ **Authentication test passes**  
✅ **Database analysis shows statistics**  
✅ **Backup creation works**  
✅ **Dry run completes successfully**  
✅ **Migration completes with success message**

## Expected Results After Migration:

- Property ID conflicts will be resolved
- New properties will have unique IDs (PROP_XXXX_XXX format)
- Wishlist will show correct properties (Bird Estate for ID "1")
- No more property mix-ups in wishlists

---

**Last Updated**: 2024-08-28  
**Migration System Version**: v2.0