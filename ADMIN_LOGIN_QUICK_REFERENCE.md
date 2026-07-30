# Admin Login Quick Reference Guide

## 🚀 Quick Test Checklist

### 1. Test Debug Endpoint
```bash
# Local development
curl http://localhost:3000/api/auth/debug?debug=stealdeals_debug_2024

# Production
curl https://stealdeals.co.in/api/auth/debug?debug=stealdeals_debug_2024
```

**Expected response:**
```json
{
  "success": true,
  "firebaseAdmin": {
    "initialized": true,
    "projectId": "stealdeals-e89ab"
  },
  "diagnostics": {
    "hasToken": false,
    "firebaseReady": true
  }
}
```

### 2. Test Login Flow
1. Navigate to `/admin/login`
2. Open browser console (F12 → Console tab)
3. Enter credentials:
   - Email: `stealdeals.co.in@gmail.com`
   - Password: `Stealdeals@821`
4. Click "Sign in"
5. Watch console for logs:
   ```
   [AdminLayout] Starting authentication check...
   [AdminLayout] Auth check response status: 200
   [AdminLayout] Fetching detailed permissions...
   [AdminLayout] Permissions response status: 200
   ```

### 3. Verify Cookies
After login, check Application tab (F12 → Application → Cookies):
- `adminToken` - HTTP-only JWT token
- `adminUser` - JSON user data

## 🔧 Common Issues & Solutions

### Issue 1: "Verifying credentials..." hangs forever
**Symptoms:** Spinner stays indefinitely after login

**Diagnosis:**
1. Check browser console for timeout errors
2. Check Vercel logs for Firebase Admin initialization
3. Visit debug endpoint

**Solutions:**
- If timeout error: Check Firebase RTDB connection
- If Firebase Admin not initialized: Verify `FIREBASE_SERVICE_ACCOUNT_KEY` env var
- If JWT invalid: Check `JWT_SECRET` env var

### Issue 2: Firebase Admin SDK not initializing
**Symptoms:** Debug endpoint shows `firebaseAdmin.initialized: false`

**Diagnosis:**
Check Vercel logs for:
```
[Firebase Admin] ❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY
```

**Solutions:**
1. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set in Vercel
2. Ensure JSON is valid (use JSONLint)
3. Check private key has `\n` not actual newlines
4. Verify required fields: `project_id`, `private_key`, `client_email`

**Example env var format:**
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"stealdeals-e89ab","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@stealdeals-e89ab.iam.gserviceaccount.com",...}
```

### Issue 3: JWT token invalid
**Symptoms:** Debug endpoint shows `token.valid: false`

**Diagnosis:**
Check error message in debug endpoint:
- `TokenExpiredError` - Token expired (24h lifetime)
- `JsonWebTokenError` - Invalid token format
- `NotBeforeError` - Token not active yet

**Solutions:**
- If expired: Login again
- If invalid format: Check `JWT_SECRET` matches across endpoints
- If clock skew: Verify server time is correct

### Issue 4: Firebase RTDB queries timing out
**Symptoms:** Console shows `RTDB query timeout after Xms`

**Diagnosis:**
1. Check Firebase database URL is correct
2. Verify database rules allow access
3. Check network connectivity

**Solutions:**
- Verify `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct
- Check Firebase console for database status
- Verify service account has database access
- Increase timeout if needed (currently 10s)

### Issue 5: Admin user not found in database
**Symptoms:** Login succeeds but permissions are empty

**Diagnosis:**
Check debug endpoint for user data:
```json
{
  "cookies": {
    "adminUser": {
      "role": "admin",
      "permissions": null
    }
  }
}
```

**Solutions:**
Run the setup script to create admin user:
```bash
node create-admin-auth.js
```

Or manually add to Firebase RTDB at path `adminUsers/{uid}`:
```json
{
  "uid": "firebase-uid",
  "email": "stealdeals.co.in@gmail.com",
  "name": "StealDeals Admin",
  "role": "superuser",
  "permissions": {
    "pages": {
      "vacant": true,
      "plots": true,
      "franchise": true,
      "preleased": true,
      "dashboard": true,
      "users": true,
      "wishlist": true,
      "analytics": true,
      "migration": true
    },
    "viewOthers": true,
    "editOthers": true
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "setup_script"
}
```

## 📊 Environment Variables Checklist

### Required for Admin Login
```bash
# Admin credentials (used in setup script)
ADMIN_EMAIL=stealdeals.co.in@gmail.com
ADMIN_PASSWORD=Stealdeals@821

# JWT signing
JWT_SECRET=stealdeals_admin_secret_key_for_jwt_tokens

# Firebase Client SDK (for login page)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCVT3Fv_tWM8FuZ9hHnsdGmdfhp-uow_bg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stealdeals-e89ab.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stealdeals-e89ab
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stealdeals-e89ab.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=836598569233
NEXT_PUBLIC_FIREBASE_APP_ID=1:836598569233:web:a46668a6e140493d6f14b0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-71EPMH0ZW9

# Firebase Admin SDK (for server-side operations)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Verification Commands
```bash
# Check if env vars are set (Vercel CLI)
vercel env ls

# Or check in Vercel dashboard:
# Settings → Environment Variables
```

## 🎯 Debug Endpoint Reference

### Usage
```
GET /api/auth/debug?debug=stealdeals_debug_2024
```

### Response Fields

**firebaseAdmin:**
- `initialized` - Whether Firebase Admin SDK is initialized
- `projectId` - Firebase project ID
- `appCount` - Number of initialized apps (should be 1)

**cookies.adminToken:**
- `present` - Whether token cookie exists
- `valid` - Whether token is valid JWT
- `userId` - User ID from token
- `email` - Email from token
- `role` - Role from token
- `expiresAt` - Token expiration time
- `error` - Error message if invalid

**cookies.adminUser:**
- Parsed JSON from adminUser cookie
- Contains user data and permissions

**environment:**
- `NODE_ENV` - Environment (development/production)
- `VERCEL` - Whether running on Vercel
- `JWT_SECRET` - JWT secret status
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Service account key status
- `ADMIN_EMAIL` - Admin email from env

**diagnostics:**
- `hasToken` - Whether adminToken cookie exists
- `hasUser` - Whether adminUser cookie exists
- `tokenValid` - Whether token is valid
- `firebaseReady` - Whether Firebase Admin is initialized

## 🔍 Browser Console Logs

### Successful Login Flow
```
Attempting Firebase login with: { email: '...', passwordLength: 12 }
Login response status: 200
Login successful
[AdminLayout] Starting authentication check...
[AdminLayout] Auth check response status: 200
[AdminLayout] Auth check data: { authenticated: true, user: {...} }
[AdminLayout] Fetching detailed permissions...
[AdminLayout] Permissions response status: 200
[AdminLayout] Permissions data: { success: true, user: {...} }
```

### Timeout Error
```
[AdminLayout] Starting authentication check...
[AdminLayout] Error checking authentication and permissions: AbortError: The operation was aborted
[AdminLayout] Request timed out - this usually indicates a server or database connection issue
```

### Firebase Admin Not Initialized
```
[Firebase Admin] ❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: SyntaxError: Unexpected token...
[Firebase Admin] ⚠️ Credentials not found
```

## 📝 Vercel Log Patterns

### Successful Initialization
```
[Firebase Admin] Initializing Firebase Admin SDK...
[Firebase Admin] Found FIREBASE_SERVICE_ACCOUNT_KEY environment variable
[Firebase Admin] ✅ Service account parsed successfully
[Firebase Admin] Project ID: stealdeals-e89ab
[Firebase Admin] ✅ Private key has BEGIN header
[Firebase Admin] ✅ Private key has END header
[Firebase Admin] ✅ Firebase Admin initialized successfully for project: stealdeals-e89ab
```

### Failed Initialization
```
[Firebase Admin] ❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: SyntaxError: Unexpected token ' in JSON at position 0
[Firebase Admin] ⚠️ Credentials not found (no service-account.json or FIREBASE_SERVICE_ACCOUNT_KEY)
```

### Database Query Timeout
```
[Auth] Error querying adminUsers path: RTDB query timeout after 8000ms
[Auth] Firebase RTDB query timed out - check database connection
```

## 🛠️ Troubleshooting Commands

### Check Firebase Admin SDK Status
```bash
curl https://stealdeals.co.in/api/auth/debug?debug=stealdeals_debug_2024 | jq '.firebaseAdmin'
```

### Check Token Status
```bash
curl https://stealdeals.co.in/api/auth/debug?debug=stealdeals_debug_2024 | jq '.cookies.adminToken'
```

### Check Environment Variables
```bash
curl https://stealdeals.co.in/api/auth/debug?debug=stealdeals_debug_2024 | jq '.environment'
```

### Test Auth Check Endpoint
```bash
# With valid token (get from browser cookies)
curl -H "Cookie: adminToken=YOUR_TOKEN_HERE" \
  https://stealdeals.co.in/api/auth/check
```

### Test Permissions Endpoint
```bash
curl -H "Cookie: adminToken=YOUR_TOKEN_HERE" \
  https://stealdeals.co.in/api/auth/verify-permissions
```

## 🎓 Best Practices

### 1. Always Check Debug Endpoint First
Before diving into logs, check the debug endpoint to get a quick overview of the auth status.

### 2. Use Browser Console Logs
The comprehensive logging makes it easy to trace where failures occur. Always check the console first.

### 3. Verify Environment Variables
Most issues are caused by missing or malformed environment variables. Always verify they're set correctly.

### 4. Check Vercel Logs
For production issues, Vercel logs show server-side errors that aren't visible in the browser.

### 5. Test Locally First
Before deploying to production, test the login flow locally to catch issues early.

### 6. Monitor Timeout Errors
If you see frequent timeout errors, consider:
- Increasing timeout values
- Optimizing Firebase RTDB queries
- Checking network connectivity
- Reviewing Firebase database rules

## 📞 Support Resources

### Documentation
- `ADMIN_LOGIN_ANALYSIS.md` - Complete technical analysis
- `ADMIN_LOGIN_FIX_SUMMARY.md` - Detailed fix documentation
- This file - Quick reference guide

### Debug Endpoints
- `/api/auth/debug` - Auth status and diagnostics
- `/api/auth/check` - Token validation
- `/api/auth/verify-permissions` - Permission check

### Key Files
- `src/app/admin/login/page.tsx` - Login page
- `src/app/admin/components/AdminLayout.tsx` - Layout with auth check
- `src/app/api/auth/verify-firebase-token/route.ts` - Token verification
- `src/lib/firebase-server-admin.ts` - Firebase Admin SDK
- `src/lib/admin/adminUserService.ts` - Admin user service

### Environment Variables
See `.env.example` for all required variables.

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` properly formatted
- [ ] Debug endpoint accessible
- [ ] Firebase Admin SDK initializes successfully
- [ ] Login flow works locally
- [ ] Admin user exists in Firebase RTDB
- [ ] JWT secret is set and matches across endpoints
- [ ] Firebase database URL is correct
- [ ] Network connectivity to Firebase verified
- [ ] Browser console shows successful login flow
- [ ] No timeout errors in console
- [ ] Vercel logs show successful initialization

## 🎉 Success Indicators

You know the fix is working when:

1. ✅ Debug endpoint shows `firebaseAdmin.initialized: true`
2. ✅ Login completes without hanging
3. ✅ Browser console shows successful auth flow
4. ✅ Dashboard loads without "Verifying credentials..." spinner
5. ✅ Cookies are set correctly
6. ✅ No timeout errors in console
7. ✅ Vercel logs show successful initialization
8. ✅ Can access all admin pages

---

**Last Updated:** 2026-07-30  
**Version:** 1.0  
**Status:** ✅ Production Ready
