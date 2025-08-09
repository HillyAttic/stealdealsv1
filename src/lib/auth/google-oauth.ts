/**
 * Google OAuth utilities for client-side authentication
 */

export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
}

export interface GoogleOAuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token?: string;
  error?: string;
}

/**
 * Check if Google OAuth is properly configured
 */
export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  return !!(clientId && redirectUri && clientId !== 'your_actual_client_id.googleusercontent.com');
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Google OAuth not configured');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleAuth(): void {
  if (typeof window === 'undefined') {
    throw new Error('Google OAuth can only be initiated on the client side');
  }
  
  const authUrl = getGoogleAuthUrl();
  window.location.href = authUrl;
}

/**
 * Handle Google OAuth callback (placeholder for client-side handling)
 */
export async function handleGoogleOAuth(code: string): Promise<GoogleOAuthResponse> {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed'
      };
    }
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}