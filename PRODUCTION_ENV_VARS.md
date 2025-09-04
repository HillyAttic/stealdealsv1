# 🚨 URGENT: Complete Production Environment Fix Guide

## Current Error Analysis
```
x-clerk-auth-reason: secret-key-invalid
x-matched-path: /404 (route missing from build)
Status: 404 Not Found (from disk cache)
```

## IMMEDIATE ACTION REQUIRED

### 1. Clerk Authentication (CRITICAL - DO THIS FIRST)
```bash
# WRONG (current production): sk_test_... or missing
# CORRECT (required for production):
CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Must match domain stealdeals.co.in
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlYWxkZWFscy5jby5pbiQ

# Additional Clerk settings
CLERK_WEBHOOK_SECRET=whsec_...  # If using webhooks
```

**WHERE TO GET THESE:**
1. Go to https://dashboard.clerk.com
2. Select your project 
3. Go to "API Keys"
4. Copy the "Secret key" (starts with sk_live_)
5. Copy the "Publishable key" (starts with pk_live_)

### 2. Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Other Required Variables
```bash
NODE_ENV=production
NEXTAUTH_URL=https://stealdeals.co.in
NEXTAUTH_SECRET=... # Generate with: openssl rand -base64 32
```

## 🔧 How to Fix

### Vercel Deployment
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all variables above
3. **IMPORTANT**: Make sure `CLERK_SECRET_KEY` starts with `sk_live_` for production
4. Redeploy after setting variables

### Other Hosting
1. Set environment variables in your hosting dashboard
2. Ensure all values match your production domain
3. Restart/redeploy the application

## 🚨 Current Error Details
```
x-clerk-auth-message: The provided Clerk Secret Key is invalid
x-clerk-auth-reason: secret-key-invalid
x-clerk-auth-status: signed-out
```

This indicates the `CLERK_SECRET_KEY` in production doesn't match the publishable key domain.

## ✅ Verification
After setting variables, test:
1. `curl https://stealdeals.co.in/api/debug/wishlist`
2. Should not show Clerk auth errors
3. Wishlist should be accessible at `https://stealdeals.co.in/my-wishlist`

## 🆘 Emergency Routes Created
While fixing env vars, these backup routes are available:
- `/my-wishlist` - Full wishlist functionality
- `/wishlist-simple` - Basic debug information