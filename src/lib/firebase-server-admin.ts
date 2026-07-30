import admin from 'firebase-admin';

// Admin User interface for type safety
export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'superuser' | 'subuser';
  permissions: {
    pages: {
      vacant: boolean;
      plots: boolean;
      franchise: boolean;
      preleased: boolean;
      // NEW PERMISSIONS ADDED
      dashboard: boolean;
      users: boolean;
      wishlist: boolean;
      analytics: boolean;
      migration: boolean;
    };
    viewOthers: boolean;
    editOthers: boolean;
  };
  createdAt: string;
  createdBy: string;
}

// Property with ownership interface
export interface PropertyWithOwnership {
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Check if Firebase Admin is already initialized to avoid multiple initializations
if (!admin.apps.length) {
  try {
    console.log('[Firebase Admin] Initializing Firebase Admin SDK...');
    console.log('[Firebase Admin] Environment:', process.env.NODE_ENV);
    console.log('[Firebase Admin] VERCEL:', !!process.env.VERCEL);

    let serviceAccount;

    // Priority 1: Environment Variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        console.log('[Firebase Admin] Found FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
        console.log('[Firebase Admin] Key length:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length);

        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('[Firebase Admin] ✅ Service account parsed successfully');
        console.log('[Firebase Admin] Project ID:', serviceAccount.project_id);
        console.log('[Firebase Admin] Client email:', serviceAccount.client_email);
        console.log('[Firebase Admin] Private key ID:', serviceAccount.private_key_id);

        if (serviceAccount.private_key) {
          console.log('[Firebase Admin] Private key length:', serviceAccount.private_key.length);
          console.log('[Firebase Admin] Private key starts with:', serviceAccount.private_key.substring(0, 50));
        } else {
          console.error('[Firebase Admin] ❌ Private key is missing!');
        }
      } catch (e) {
        console.error('[Firebase Admin] ❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        console.error('[Firebase Admin] First 100 chars:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY.substring(0, 100));
      }
    } else {
      console.log('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
    }

    // Priority 2: local service-account.json file
    if (!serviceAccount) {
      try {
        const path = require('path');
        const fs = require('fs');

        // Log current working directory for debugging
        const cwd = process.cwd();
        console.log(`[Firebase Admin] Current working directory: ${cwd}`);

        const possiblePaths = [
          path.resolve(cwd, 'service-account.json'),
          path.resolve(cwd, '..', 'service-account.json'),
          path.join(process.cwd(), 'service-account.json')
        ];

        for (const keyPath of possiblePaths) {
          console.log(`[Firebase Admin] Checking path: ${keyPath}`);
          if (fs.existsSync(keyPath)) {
            const fileContent = fs.readFileSync(keyPath, 'utf8');
            serviceAccount = JSON.parse(fileContent);
            console.log(`[Firebase Admin] ✅ Firebase credentials loaded from: ${keyPath}`);
            console.log('[Firebase Admin] Project ID:', serviceAccount.project_id);
            break;
          }
        }
      } catch (e) {
        console.warn('[Firebase Admin] Failed to load service-account.json:', e);
      }
    }

    let databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app';

    // Fix for region-specific database URL if incorrectly set in env
    if (databaseURL.includes('firebaseio.com')) {
      console.warn('[Firebase Admin] Detected incorrect database region URL, auto-correcting to asia-southeast1');
      databaseURL = 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app';
    }

    console.log('[Firebase Admin] Database URL:', databaseURL);

    if (serviceAccount) {
      // Ensure private key handles newlines correctly
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        const originalKey = serviceAccount.private_key;
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        // Diagnostic logs
        if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
          console.error('[Firebase Admin] ❌ CRITICAL: Firebase private key is missing BEGIN header');
          console.error('[Firebase Admin] Key starts with:', serviceAccount.private_key.substring(0, 100));
        } else {
          console.log('[Firebase Admin] ✅ Private key has BEGIN header');
        }

        if (!serviceAccount.private_key.includes('-----END PRIVATE KEY-----')) {
          console.error('[Firebase Admin] ❌ CRITICAL: Firebase private key is missing END header');
        } else {
          console.log('[Firebase Admin] ✅ Private key has END header');
        }

        const lineCount = serviceAccount.private_key.split('\n').length;
        console.log(`[Firebase Admin] Private key diagnostic: ${lineCount} lines detected (after processing)`);

        if (lineCount < 20) {
          console.warn('[Firebase Admin] ⚠️ WARNING: Firebase private key seems unusually short. It might be truncated.');
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      });
      console.log('[Firebase Admin] ✅ Firebase Admin initialized successfully for project:', serviceAccount.project_id);
      console.log('[Firebase Admin] Using Key ID:', serviceAccount.private_key_id?.substring(0, 8) + '...');
    } else {
      // Check if we are in an environment that might have default credentials (GCP/Vercel)
      const isCloudEnv = process.env.VERCEL || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GAE_SERVICE;

      if (isCloudEnv) {
        console.log('[Firebase Admin] Attempting default credential initialization in cloud environment');
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: databaseURL,
        });
        console.log('[Firebase Admin] ✅ Firebase Admin initialized with default credentials');
      } else {
        console.warn('[Firebase Admin] ⚠️ Credentials not found (no service-account.json or FIREBASE_SERVICE_ACCOUNT_KEY)');
        console.warn('[Firebase Admin] ⚠️ Skipping initialization to avoid "invalid-credential" warnings.');
        console.warn('[Firebase Admin] 💡 To fix: Add FIREBASE_SERVICE_ACCOUNT_KEY to your environment variables');
      }
    }
  } catch (error) {
    console.error('[Firebase Admin] ❌ Initialization error:', error);
    if (error instanceof Error) {
      console.error('[Firebase Admin] Error message:', error.message);
      console.error('[Firebase Admin] Error stack:', error.stack);
    }
  }
}

// Helper to get initialized service or throw clear error
function getService<T>(name: 'auth' | 'database' | 'firestore'): T {
  if (!admin.apps.length) {
    throw new Error(`[Firebase Admin] ${name} service is unavailable because the Admin SDK could not be initialized. Please add FIREBASE_SERVICE_ACCOUNT_KEY to your environment variables or provide a service-account.json file.`);
  }
  return (admin as any)[name]() as T;
}

// Export Firebase Admin services as Proxies to prevent crash on import
export const auth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    const service = getService<admin.auth.Auth>('auth');
    const val = (service as any)[prop];
    return typeof val === 'function' ? val.bind(service) : val;
  }
});

export const database = new Proxy({} as admin.database.Database, {
  get(_, prop) {
    const service = getService<admin.database.Database>('database');
    const val = (service as any)[prop];
    return typeof val === 'function' ? val.bind(service) : val;
  }
});

export const db = new Proxy({} as any, {
  get(_, prop) {
    try {
      const service = getService<any>('firestore');
      const val = (service as any)[prop];
      return typeof val === 'function' ? val.bind(service) : val;
    } catch (e) {
      return undefined;
    }
  }
});

/**
 * Helper function to check if Firebase Admin SDK is initialized
 */
export function isAdminInitialized(): boolean {
  return admin.apps.length > 0;
}

/**
 * Helper function to get Firebase Admin initialization status
 */
export function getAdminInitStatus(): { initialized: boolean; projectId?: string } {
  if (admin.apps.length === 0) {
    return { initialized: false };
  }

  try {
    const app = admin.apps[0];
    return {
      initialized: true,
      projectId: app.options.projectId
    };
  } catch (error) {
    return { initialized: false };
  }
}

export default admin;