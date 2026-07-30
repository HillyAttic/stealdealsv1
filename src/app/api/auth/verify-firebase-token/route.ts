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
    const { idToken, adminLogin, email, password } = body;

    console.log('[Auth] Starting admin authentication');

    // --- ENV VAR FALLBACK: authenticate directly against ADMIN_EMAIL/ADMIN_PASSWORD ---
    if (email && password) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD not configured');
        return NextResponse.json(
          { error: 'Server configuration error - admin credentials not set' },
          { status: 500 }
        );
      }

      if (email !== adminEmail || password !== adminPassword) {
        console.log('[Auth] Env var credentials mismatch');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('[Auth] Env var authentication successful');

      // Generate JWT token for the env-var-authenticated admin
      const token = jwt.sign(
        {
          userId: 'env-admin-superuser',
          email: adminEmail,
          role: 'superuser',
          permissions: null
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const jsonResponse = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'env-admin-superuser',
          email: adminEmail,
          role: 'superuser',
          permissions: null
        }
      });

      jsonResponse.cookies.set({
        name: 'adminToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      jsonResponse.cookies.set({
        name: 'adminUser',
        value: JSON.stringify({
          id: 'env-admin-superuser',
          email: adminEmail,
          role: 'superuser',
          permissions: null
        }),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      console.log(`[Auth] Env var auth completed in ${Date.now() - startTime}ms`);
      return jsonResponse;
    }

    // --- FIREBASE TOKEN AUTHENTICATION (original flow) ---

    // Validate input
    if (!idToken) {
      console.log('[Auth] Missing ID token and no email/password provided');
      return NextResponse.json(
        { error: 'ID token or email/password required' },
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
        console.log('[Auth] Fetching user permissions from database for userId:', userId);

        // Helper function to add timeout to RTDB queries
        const queryWithTimeout = async (ref: any, timeoutMs = 8000): Promise<any> => {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`RTDB query timeout after ${timeoutMs}ms`)), timeoutMs);
          });
          return Promise.race([ref.once('value'), timeoutPromise]);
        };

        // Check both paths simultaneously for better performance with timeout
        const [adminUsersSnapshot, oldAdminUsersSnapshot] = await withTimeout(
          Promise.all([
            queryWithTimeout(adminDb.ref(`adminUsers/${userId}`), 8000).catch((err) => {
              console.error('[Auth] Error querying adminUsers path:', err.message);
              return null;
            }),
            queryWithTimeout(adminDb.ref(`admin_users/${userId}`), 8000).catch((err) => {
              console.error('[Auth] Error querying admin_users path:', err.message);
              return null;
            })
          ]),
          10000, // 10 second timeout for database operations
          'Database lookup timed out'
        );

        console.log('[Auth] adminUsers snapshot exists:', adminUsersSnapshot?.exists());
        console.log('[Auth] admin_users snapshot exists:', oldAdminUsersSnapshot?.exists());

        let userSnapshot = null;

        // Prioritize new path (adminUsers) over old path
        if (adminUsersSnapshot && adminUsersSnapshot.exists()) {
          userSnapshot = adminUsersSnapshot;
          console.log(`[Auth] User ${userId} found in adminUsers`);
        } else if (oldAdminUsersSnapshot && oldAdminUsersSnapshot.exists()) {
          userSnapshot = oldAdminUsersSnapshot;
          console.log(`[Auth] User ${userId} found in admin_users (legacy path)`);
        }

        if (userSnapshot && userSnapshot.exists()) {
          const userData = userSnapshot.val();
          console.log('[Auth] User data from database:', {
            email: userData.email,
            role: userData.role,
            hasPermissions: !!userData.permissions
          });

          // Check if user is a known superuser by email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
            console.log('[Auth] Known superuser email detected, assigning superuser role');
          } else {
            userRole = userData.role || 'admin';
          }

          userPermissions = userData.permissions;
          console.log(`[Auth] User ${userEmail} authenticated with role: ${userRole}`);
        } else {
          // For users not in database, check if it's the known superuser email
          if (userEmail === 'stealdeals.co.in@gmail.com') {
            userRole = 'superuser';
            console.log(`[Auth] Known superuser ${userEmail} not in database, assigning superuser role`);
          } else {
            console.log(`[Auth] User ${userEmail} not found in database, using default admin role`);
          }
        }
      } catch (dbError) {
        console.error('[Auth] Error fetching user permissions from database:', dbError);

        // Provide more specific error messages
        if (dbError instanceof Error) {
          if (dbError.message.includes('timeout')) {
            console.error('[Auth] Firebase RTDB query timed out - check database connection');
          }
        }

        // For known superuser emails, assign superuser role even if DB fails
        if (userEmail === 'stealdeals.co.in@gmail.com') {
          userRole = 'superuser';
          console.log(`[Auth] Known superuser ${userEmail}, assigning superuser role despite DB error`);
        } else {
          console.log('[Auth] Continuing with default admin role');
        }
      }

      console.log(`[Auth] Database lookup completed in ${Date.now() - startTime}ms`);
      console.log(`[Auth] Final role assignment: ${userRole}`);

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
