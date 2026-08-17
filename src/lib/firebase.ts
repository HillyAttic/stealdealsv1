// Firebase configuration for StealDeals app
// Migration complete: all CRUD operations use Firestore.
// This module now only initializes the Firebase app and exports auth/storage.
// For property/franchise/plot/wishlist/user CRUD, use the modules in @/lib/database/.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { validateConfigOrThrow, logConfigValidation } from '@/lib/config/validation';

// Detect if we're in a build environment (Vercel build phase)
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    (process.env.VERCEL && !process.env.VERCEL_ENV);

if (isBuildTime) {
  console.log('[Firebase] Build time detected - skipping Firebase client SDK initialization');
}

// Validate environment configuration before initializing Firebase
try {
  const isActualProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';
  if (isActualProduction) {
    validateConfigOrThrow();
  } else {
    logConfigValidation();
  }
} catch (error) {
  console.error('[Firebase] Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    throw error;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Enhanced Firebase configuration validation
const requiredFields = ['apiKey', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  const errorMessage = `Firebase configuration is missing required fields: ${missingFields.join(', ')}. Make sure your environment variables are set properly.`;
  console.error('[Firebase]', errorMessage);

  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  }
} else {
  console.log('[Firebase] ✅ Configuration validation passed');
}

// Initialize Firebase lazily to avoid build-time errors
let _app: ReturnType<typeof initializeApp> | null = null;

function ensureApp() {
  if (!_app) {
    _app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

// Lazy proxy for app
const app = new Proxy({} as ReturnType<typeof initializeApp>, {
  get(_, prop, receiver) {
    const a = ensureApp();
    const val = Reflect.get(a as any, prop, receiver);
    return typeof val === 'function' ? val.bind(a) : val;
  },
});

let _auth: ReturnType<typeof getAuth> | null = null;
let _storage: ReturnType<typeof getStorage> | null = null;

function ensureAuth() {
  if (!_auth) {
    _auth = getAuth(ensureApp());
  }
  return _auth;
}

function ensureStorage() {
  if (!_storage) {
    _storage = getStorage(ensureApp());
  }
  return _storage;
}

const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_, prop, receiver) {
    const a = ensureAuth();
    const val = Reflect.get(a as any, prop, receiver);
    return typeof val === 'function' ? val.bind(a) : val;
  },
});

function getStorageInstance(): ReturnType<typeof getStorage> {
  return ensureStorage();
}

const storage = new Proxy({} as ReturnType<typeof getStorage>, {
  get(_, prop, receiver) {
    const s = ensureStorage();
    const val = Reflect.get(s as any, prop, s);
    return typeof val === 'function' ? val.bind(s) : val;
  },
  has(_, prop) {
    return Reflect.has(ensureStorage() as any, prop);
  },
  getPrototypeOf() {
    return Reflect.getPrototypeOf(ensureStorage() as any);
  },
}) as ReturnType<typeof getStorage>;

// Re-export types for backward compatibility
export interface Property {
  id: string;
  title?: string;
  tenant?: string;
  category: string;
  price?: number;
  buildingName?: string;
  location: string;
  state?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  area?: number;
  superArea?: string;
  carpetArea?: string;
  totalArea?: string;
  areaOnSale?: string;
  description?: string;
  featured?: boolean;
  propertyStatus?: string;
  leaseTerm?: string;
  remainingLease?: string;
  lockIn?: string;
  escalation?: string;
  rentalType?: string;
  rent?: number;
  askingPrice?: number;
  securityDeposit?: string;
  roi?: string;
  advance?: string;
  reference?: string;
  contactName?: string;
  contactNumber?: string;
  channel?: string;
  propertyType?: string;
  unitType?: string;
  image?: string;
  facing?: string;
  length?: string;
  width?: string;
  height?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Franchise {
  id?: string | null;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number;
  maxInvestment?: number;
  royalty?: string;
  establishmentYear?: string;
  franchiseStartedYear?: string;
  numberOutlets?: string;
  minPaybackPeriod?: string;
  maxPaybackPeriod?: string;
  headquarter?: string;
  remarks?: string;
  brandDeck?: string;
  productList?: string;
  roiSheet?: string;
  investment: number;
  location: string;
  status: string;
  roi: string;
  description?: string;
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Plot {
  id?: string | null;
  developerName: string;
  project: string;
  description: string;
  status: string;
  plotSize: {
    min: number;
    max: number;
    unit: string;
  };
  location: string;
  investmentStartsFrom: {
    amount: number;
    unit: string;
  };
  investorDiscoveryKit: {
    title: string;
    url: string;
    description: string;
  };
  keySalientFeatures?: string[];
  images: string[];
  createdAt?: number;
  updatedAt?: number;
}

export {
  app,
  auth,
  storage,
  getStorageInstance,
};
