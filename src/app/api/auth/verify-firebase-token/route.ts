import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { database as adminDb } from '@/lib/firebase-server-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

interface FirebaseUserInfo {
  localId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}

interface AdminUserPermissions {
  pages: {
    vacant: boolean;
    plots: boolean;
    franchise: boolean;
    preleased: boolean;
    // NEW PERMISSIONS
    dashboard: boolean;
    users: boolean;
    wishlist: boolean;
    analytics: boolean;
    migration: boolean;
  };
  viewOthers: boolean;
  editOthers: boolean;
}

interface AdminUserData {
  email: string;
  name: string;
  role: 'superuser' | 'subuser' | 'admin';
  permissions: AdminUserPermissions;
  createdAt: string;
  createdBy: string;
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

      // Fetch user permissions from Realtime Database
      let userRole: 'superuser' | 'subuser' | 'admin' = 'admin';
      let userPermissions: AdminUserPermissions | null = null;

      try {
        // Try adminUsers first (new path)
        let userRef = adminDb.ref(`adminUsers/${userId}`);
        let userSnapshot = await userRef.once('value');

        if (!userSnapshot.exists()) {
          // Fallback to old path
          console.log(`User ${userId} not found in adminUsers, checking admin_users...`);
          userRef = adminDb.ref(`admin_users/${userId}`);
          userSnapshot = await userRef.once('value');
        }

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          
          // Check if user is a known superuser by email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
          } else {
            userRole = userData.role || 'admin';
          }
          
          userPermissions = userData.permissions;
          console.log(`User ${userEmail} found in database with key ${userSnapshot.key}, role: ${userRole}`);
        } else {
          // For users not in database, check if it's the known superuser email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
            console.log(`Known superuser ${userEmail} not in database, assigning superuser role`);
          } else {
            console.log(`User ${userEmail} not found in database (checked adminUsers and admin_users), using default admin role`);
          }
        }
      } catch (dbError) {
        console.error('Error fetching user permissions from database:', dbError);
        // For known superuser emails, assign superuser role even if DB fails
        if (userEmail === 'stealdeals.co.in@gmail.com') {
          userRole = 'superuser';
          console.log(`Known superuser ${userEmail}, assigning superuser role despite DB error`);
        } else {
          // Continue with default admin role if database fetch fails
        }
      }

      // Generate our own JWT token for internal use
      const token = jwt.sign(
        {
          userId: userId,
          email: userEmail,
          role: userRole,
          permissions: userPermissions
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
          role: userRole,
          permissions: userPermissions
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
          role: userRole,
          permissions: userPermissions
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
