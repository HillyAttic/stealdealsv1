# Google OAuth Integration

This directory contains the Google OAuth integration for the StealDeals user authentication system.

## Overview

The Google OAuth integration allows users to sign in and register using their Google accounts. It supports:

- New user registration via Google OAuth
- Existing user login via Google OAuth
- Linking Google accounts to existing email-based accounts
- Comprehensive error handling and validation

## Files

### Core Integration Files

- `firebase-auth.ts` - Firebase configuration and Google token verification
- `google-oauth.ts` - Client-side OAuth utilities and URL generation
- `oauth-errors.ts` - Error handling and mapping for OAuth flows

### API Endpoints

- `/api/auth/google` - Main OAuth endpoint for token exchange
- `/api/auth/google/callback` - OAuth callback handler for redirects

### Tests

- `__tests__/google-oauth.test.ts` - Unit tests for OAuth utilities
- `../api/auth/google/__tests__/route.test.ts` - Integration tests for API endpoints

## Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and add Google as a sign-in provider
4. Copy the Firebase configuration values

### 3. Environment Variables

Add the following to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Usage

### Client-Side Integration

```typescript
import { initiateGoogleAuth, isGoogleOAuthConfigured } from '@/lib/auth/google-oauth';

// Check if OAuth is configured
if (isGoogleOAuthConfigured()) {
  // Initiate OAuth flow
  initiateGoogleAuth('/dashboard'); // Optional redirect URL
}
```

### API Integration

```typescript
import { handleGoogleOAuth } from '@/lib/auth/google-oauth';

// Handle OAuth callback with authorization code
const result = await handleGoogleOAuth(code, state);

if (result.success) {
  console.log('User authenticated:', result.user);
  console.log('JWT Token:', result.token);
  console.log('Is new user:', result.isNewUser);
} else {
  console.error('OAuth failed:', result.error);
}
```

### Error Handling

```typescript
import { mapGoogleOAuthError, createUserFriendlyErrorMessage } from '@/lib/auth/oauth-errors';

try {
  // OAuth operation
} catch (error) {
  const oauthError = mapGoogleOAuthError(error.message);
  const userMessage = createUserFriendlyErrorMessage(oauthError);
  
  // Display user-friendly error message
  console.error(userMessage);
}
```

## OAuth Flow

### Authorization Code Flow

1. User clicks "Sign in with Google"
2. Client redirects to Google OAuth authorization URL
3. User authorizes the application
4. Google redirects back with authorization code
5. Server exchanges code for user information
6. Server creates or updates user account
7. Server creates session and returns JWT token

### Account Linking

The system supports linking Google accounts to existing email-based accounts:

1. If user exists with same email but no Google provider ID
2. System links the Google account to existing user
3. User can now sign in with either email/password or Google OAuth

## Security Features

- **State Parameter Validation**: Prevents CSRF attacks
- **Token Verification**: Validates Google ID tokens using Firebase
- **Account Linking Protection**: Prevents unauthorized account linking
- **Session Security**: Uses HTTP-only cookies and secure JWT tokens
- **Error Logging**: Comprehensive error tracking for monitoring

## Error Codes

The system uses standardized error codes from `AuthErrorCodes`:

- `GOOGLE_AUTH_FAILED`: General Google OAuth failure
- `EMAIL_ALREADY_EXISTS`: Email conflict during registration
- `UNAUTHORIZED`: Account disabled or access denied
- `INVALID_CREDENTIALS`: Invalid or expired tokens
- `TOKEN_EXPIRED`: JWT token has expired

## Testing

### Unit Tests

```bash
npm test src/lib/auth/__tests__/google-oauth.test.ts
```

### Integration Tests

```bash
npm test src/app/api/auth/google/__tests__/route.test.ts
```

### Manual Testing

1. Set up environment variables
2. Start development server: `npm run dev`
3. Navigate to authentication page
4. Click "Sign in with Google"
5. Complete OAuth flow
6. Verify user creation/login

## Troubleshooting

### Common Issues

1. **"OAuth client ID not configured"**
   - Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable
   - Ensure Firebase project is properly configured

2. **"Invalid redirect URI"**
   - Verify redirect URI in Google Cloud Console matches your environment
   - Check `GOOGLE_REDIRECT_URI` environment variable

3. **"Firebase configuration missing"**
   - Ensure all Firebase environment variables are set
   - Check Firebase project settings

4. **"Token verification failed"**
   - Verify Firebase Auth is enabled
   - Check Google sign-in provider configuration in Firebase

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will provide detailed console logs for OAuth operations.

## Production Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Domain Verification**: Verify your domain in Google Cloud Console
3. **Rate Limiting**: Implement rate limiting for OAuth endpoints
4. **Error Monitoring**: Set up error tracking (Sentry, LogRocket, etc.)
5. **Security Headers**: Configure proper CORS and security headers

## API Reference

### POST /api/auth/google

Exchange Google authorization code for user session.

**Request Body:**
```json
{
  "code": "google_authorization_code",
  "state": "optional_state_parameter"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "avatar_url",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastLoginAt": "2023-01-01T00:00:00.000Z",
    "preferences": {...}
  },
  "isNewUser": false
}
```

### GET /api/auth/google/callback

OAuth callback endpoint for handling Google redirects.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: Optional state parameter for CSRF protection
- `error`: Error code if OAuth failed

**Response:**
- Redirects to dashboard on success
- Redirects to home with error parameter on failure