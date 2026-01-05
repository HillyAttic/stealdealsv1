import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// List of allowed admin emails
const ADMIN_EMAILS = [
  'mehul@stealdeals.co.in',
  'stealdeals.co.in@gmail.com',
  'ishank@stealdeals.co.in'
];

interface FirebaseUserInfo {
  localId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, adminLogin } = body;

    console.log('Verifying Firebase ID token');

    // Validate input
    if (!idToken) {
      console.log('Missing ID token');
      return NextResponse.json(
        { error: 'ID token required' },
        { status: 400 }
      );
    }

    if (!FIREBASE_API_KEY) {
      console.error('Missing Firebase API key');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      // Use Firebase Auth REST API to get user info from the ID token
      // https://firebase.google.com/docs/reference/rest/auth#section-get-account-info
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Firebase token verification failed:', errorData);
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      const data = await response.json();
      
      if (!data.users || data.users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      const userInfo: FirebaseUserInfo = data.users[0];
      const userEmail = userInfo.email;
      const userId = userInfo.localId;

      // Check if user has admin role (by checking if email is in admin list)
      const isAdmin = ADMIN_EMAILS.includes(userEmail?.toLowerCase() || '');
      
      if (adminLogin && !isAdmin) {
        console.log('User is not an admin:', userEmail);
        return NextResponse.json(
          { error: 'Unauthorized: Admin access required' },
          { status: 403 }
        );
      }

      // Generate our own JWT token for internal use
      const token = jwt.sign(
        { 
          userId: userId,
          email: userEmail,
          role: isAdmin ? 'admin' : 'user'
        }, 
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create response
      const jsonResponse = NextResponse.json({
        success: true,
        token,
        user: { 
          id: userId, 
          email: userEmail,
          role: isAdmin ? 'admin' : 'user'
        }
      });

      // Set HTTP-only cookie for enhanced security
      jsonResponse.cookies.set({
        name: 'adminToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      // Also set a readable cookie for client with user info
      jsonResponse.cookies.set({
        name: 'adminUser',
        value: JSON.stringify({ 
          id: userId, 
          email: userEmail,
          role: isAdmin ? 'admin' : 'user'
        }),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      console.log('Authentication successful for:', userEmail);
      return jsonResponse;

    } catch (verifyError) {
      console.error('Firebase ID token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}