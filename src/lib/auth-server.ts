// Firebase Auth server-side utilities using Admin SDK
import { auth } from './firebase-server-admin';

export interface ServerUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;
  providerData: Array<{
    providerId: string;
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }>;
}

/**
 * Verify Firebase ID token and return user data
 */
export async function verifyIdToken(idToken: string): Promise<ServerUser | null> {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email,
        displayName: p.displayName,
        photoURL: p.photoURL,
      })),
    };
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string): Promise<ServerUser | null> {
  try {
    const user = await auth.getUser(uid);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email,
        displayName: p.displayName,
        photoURL: p.photoURL,
      })),
    };
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(params: {
  email: string;
  password?: string;
  displayName?: string;
  photoURL?: string;
}): Promise<ServerUser | null> {
  try {
    const user = await auth.createUser(params);
    return {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email,
        displayName: p.displayName,
        photoURL: p.photoURL,
      })),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user
 */
export async function updateUser(
  uid: string,
  params: {
    email?: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
    disabled?: boolean;
  }
): Promise<ServerUser | null> {
  try {
    const user = await auth.updateUser(uid, params);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email,
        displayName: p.displayName,
        photoURL: p.photoURL,
      })),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Delete user
 */
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}
