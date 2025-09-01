# Production Environment Setup Guide

## Issue: Admin Users Page Not Loading

The admin users page at `https://stealdeals.co.in/admin/users` is currently failing because Clerk configuration is missing in production.

### Error Details
```
Error fetching Clerk users: Error: Failed to fetch users from Clerk
```

### Root Cause
The production environment is using placeholder values for Clerk API keys:
```bash
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY_HERE
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY_HERE
```

## Fix Instructions

### Step 1: Get Clerk Production Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your StealDeals production project
3. Navigate to **Configure** → **API Keys**
4. Copy the following keys:
   - **Secret key** (starts with `sk_live_...`)
   - **Publishable key** (starts with `pk_live_...`)

### Step 2: Update Production Environment Variables

Replace the placeholder values with your actual production keys:

```bash
# In your production environment (.env.production or hosting platform)
CLERK_SECRET_KEY=sk_live_your_actual_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
```

### Step 3: Redeploy Application

After updating the environment variables, redeploy your application for the changes to take effect.

### Step 4: Verify Fix

1. Visit `https://stealdeals.co.in/api/admin/health` to check system status
2. Go to `https://stealdeals.co.in/admin/users` to confirm users page loads

## Health Check Endpoint

A new health check endpoint has been added: `/api/admin/health`

This endpoint will show:
- ✅ Environment variable status
- ✅ Clerk connection test
- ✅ Firebase configuration status
- ❌ Specific issues and recommendations

## Security Notes

⚠️ **Important**: Never commit actual API keys to the repository. Only set them in your production environment configuration.

## Additional Fixes Applied

1. **Enhanced Error Handling**: Better error messages for Clerk configuration issues
2. **Configuration Validation**: API now validates keys before attempting Clerk operations
3. **User-Friendly Error Pages**: Admin users page now shows helpful setup instructions
4. **Health Check API**: New endpoint to diagnose configuration issues

## Testing

After applying the fix, the following should work:
- ✅ Admin users page loads without errors
- ✅ User list displays from Clerk
- ✅ Search and pagination functionality
- ✅ User statistics and counts

## Support

If you continue to experience issues after following these steps:
1. Check the health endpoint: `/api/admin/health`
2. Verify your Clerk dashboard configuration
3. Ensure the production deployment includes the updated environment variables