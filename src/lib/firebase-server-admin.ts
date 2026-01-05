import admin from 'firebase-admin';

// Check if Firebase Admin is already initialized to avoid multiple initializations
if (!admin.apps.length) {
  try {
    // Check if we have service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Use service account from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } else {
      // For Vercel deployment with Firebase Extensions or default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // Fallback initialization - this may not work in all environments
    try {
      admin.initializeApp({
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError);
      throw new Error('Unable to initialize Firebase Admin SDK');
    }
  }
}

export const auth = admin.auth();
export const db = admin.firestore ? admin.firestore() : undefined;
export default admin;