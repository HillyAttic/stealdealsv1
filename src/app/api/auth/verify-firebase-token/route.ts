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

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { idToken, adminLogin } = body;

    console.log('[Auth] Starting Firebase token verification');

    // Validate input
    if (!idToken) {
      console.log('[Auth] Missing ID token');
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
      // Use Firebase Auth REST API to get user info from the ID token with timeout
      const response = await withTimeout(
        fetch(
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
        ),
        10000, // 10 second timeout
        'Firebase token verification timed out'
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
      console.log(`[Auth] Firebase token verified in ${Date.now() - startTime}ms`);

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
        // Check both paths simultaneously for better performance with timeout
        const [adminUsersSnapshot, oldAdminUsersSnapshot] = await withTimeout(
          Promise.all([
            adminDb.ref(`adminUsers/${userId}`).once('value').catch(() => null),
            adminDb.ref(`admin_users/${userId}`).once('value').catch(() => null)
          ]),
          5000, // 5 second timeout for database operations
          'Database lookup timed out'
        );

        let userSnapshot = null;

        // Prioritize new path (adminUsers) over old path
        if (adminUsersSnapshot && adminUsersSnapshot.exists()) {
          userSnapshot = adminUsersSnapshot;
          console.log(`User ${userId} found in adminUsers`);
        } else if (oldAdminUsersSnapshot && oldAdminUsersSnapshot.exists()) {
          userSnapshot = oldAdminUsersSnapshot;
          console.log(`User ${userId} found in admin_users (legacy path)`);
        }

        if (userSnapshot && userSnapshot.exists()) {
          const userData = userSnapshot.val();

          // Check if user is a known superuser by email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
          } else {
            userRole = userData.role || 'admin';
          }

          userPermissions = userData.permissions;
          console.log(`User ${userEmail} authenticated with role: ${userRole}`);
        } else {
          // For users not in database, check if it's the known superuser email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
            console.log(`Known superuser ${userEmail} not in database, assigning superuser role`);
          } else {
            console.log(`User ${userEmail} not found in database, using default admin role`);
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

      console.log(`[Auth] Database lookup completed in ${Date.now() - startTime}ms`);

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

      console.log(`[Auth] Authentication successful for ${userEmail} in ${Date.now() - startTime}ms`);
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
