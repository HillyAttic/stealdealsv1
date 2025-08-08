/**
 * PKCE (Proof Key for Code Exchange) utilities for secure OAuth2 flows
 */

/**
 * Generate a random code verifier for PKCE
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from code verifier using SHA256
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode without padding
 */
function base64URLEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Verify code challenge matches code verifier
 */
export async function verifyCodeChallenge(
  codeVerifier: string, 
  codeChallenge: string
): Promise<boolean> {
  try {
    const generatedChallenge = await generateCodeChallenge(codeVerifier);
    return generatedChallenge === codeChallenge;
  } catch (error) {
    console.error('Error verifying code challenge:', error);
    return false;
  }
}