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
    let serviceAccount;

    // Priority 1: Environment Variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        console.log('Firebase credentials found in FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('Firebase credentials found in FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable:', e);
      }
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
          if (fs.existsSync(keyPath)) {
            const fileContent = fs.readFileSync(keyPath, 'utf8');
            serviceAccount = JSON.parse(fileContent);
            console.log(`Firebase credentials loaded from: ${keyPath}`);
            break;
          }
        }
      } catch (e) {
        console.warn('Failed to load service-account.json:', e);
      }
    }

    let databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app';

    // Fix for region-specific database URL if incorrectly set in env
    if (databaseURL.includes('firebaseio.com')) {
      console.warn('Detected incorrect database region URL, auto-correcting to asia-southeast1');
      databaseURL = 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app';
    }

    if (serviceAccount) {
      // Ensure private key handles newlines correctly
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        const originalKey = serviceAccount.private_key;
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        // Diagnostic logs
        if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
          console.error('CRITICAL: Firebase private key is missing BEGIN header');
        }
        if (!serviceAccount.private_key.includes('-----END PRIVATE KEY-----')) {
          console.error('CRITICAL: Firebase private key is missing END header');
        }

        const lineCount = serviceAccount.private_key.split('\n').length;
        console.log(`Firebase private key diagnostic: ${lineCount} lines detected (after processing)`);

        if (lineCount < 20) {
          console.warn('WARNING: Firebase private key seems unusually short. It might be truncated.');
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      });
      console.log('Firebase Admin initialized for project:', serviceAccount.project_id);
      console.log('Using Key ID:', serviceAccount.private_key_id?.substring(0, 8) + '...');
    } else {
      // Check if we are in an environment that might have default credentials (GCP/Vercel)
      const isCloudEnv = process.env.VERCEL || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GAE_SERVICE;

      if (isCloudEnv) {
        console.log('Attempting default credential initialization in cloud environment');
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: databaseURL,
        });
      } else {
        console.warn('⚠️ [Firebase Admin] Credentials not found (no service-account.json or FIREBASE_SERVICE_ACCOUNT_KEY)');
        console.warn('⚠️ [Firebase Admin] Skipping initialization to avoid "invalid-credential" warnings.');
        console.warn('💡 [Firebase Admin] To fix: Add your service account key to .env.local or service-account.json');
      }
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
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

export default admin;