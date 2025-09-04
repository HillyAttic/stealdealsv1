# CRITICAL: Production Environment Variables Fix

## 🚨 Immediate Issue
The Clerk secret key is invalid in production, causing authentication failures.

## Required Environment Variables

### 1. Clerk Authentication (CRITICAL)
```bash
# Get these from https://dashboard.clerk.com
CLERK_SECRET_KEY=sk_live_...  # Must match your domain
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Must match your domain

# Domain Configuration
CLERK_WEBHOOK_SECRET=whsec_...  # If using webhooks
```

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