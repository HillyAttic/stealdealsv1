import { NextRequest, NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/security/csrf';

/**
 * Get CSRF token endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      token: '' // Will be set by setCSRFToken
    });
    
    // Generate and set CSRF token
    const token = setCSRFToken(response);
    
    // Update response with token
    const responseData = await response.json();
    responseData.token = token;
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSRF token'
      },
      { status: 500 }
    );
  }
}