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
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable:', e);
      }
    }

    // Priority 2: local service-account.json file
    if (!serviceAccount) {
      try {
        // dynamic require to avoid build issues on client side (though this file is server-only)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');

        const keyPath = path.resolve(process.cwd(), 'service-account.json');
        if (fs.existsSync(keyPath)) {
          const fileContent = fs.readFileSync(keyPath, 'utf8');
          serviceAccount = JSON.parse(fileContent);
          console.log('Firebase credentials loaded from service-account.json file');
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
      // For Vercel deployment with Firebase Extensions or default credentials
      console.log('Attempting default credential initialization');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: databaseURL,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);

    // Fallback initialization - this may not work in all environments
    try {
      admin.initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app',
      });
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError);
      throw new Error('Unable to initialize Firebase Admin SDK');
    }
  }
}

// Export Firebase Admin services
export const auth = admin.auth();
export const database = admin.database();
export const db = admin.firestore ? admin.firestore() : undefined;
export default admin;