import { auth } from '@/lib/firebase-server-admin';

/**
 * Firebase Admin User Service
 * Replaces Clerk's clerkClient for admin user management
 */
export class FirebaseAdminUserService {
  /**
   * List users with pagination
   */
  static async listUsers(options: {
    limit?: number;
    pageToken?: string;
  } = {}) {
    const { limit = 100, pageToken } = options;
    
    const result = await auth.listUsers(limit, pageToken);
    
    return {
      users: result.users.map(u => ({
        id: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        emailVerified: u.emailVerified,
        disabled: u.disabled,
        createdAt: u.metadata.creationTime,
        lastSignInAt: u.metadata.lastSignInTime,
        provider: u.providerData[0]?.providerId || 'unknown',
      })),
      nextPageToken: result.pageToken,
    };
  }

  /**
   * Get user by ID
   */
  static async getUser(uid: string) {
    const user = await auth.getUser(uid);
    
    return {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignInAt: user.metadata.lastSignInTime,
      provider: user.providerData[0]?.providerId || 'unknown',
    };
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    const user = await auth.getUserByEmail(email);
    
    return {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignInAt: user.metadata.lastSignInTime,
      provider: user.providerData[0]?.providerId || 'unknown',
    };
  }

  /**
   * Create user
   */
  static async createUser(params: {
    email: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
  }) {
    const user = await auth.createUser(params);
    
    return {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
    };
  }

  /**
   * Update user
   */
  static async updateUser(uid: string, params: {
    email?: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
    disabled?: boolean;
  }) {
    const user = await auth.updateUser(uid, params);
    
    return {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
    };
  }

  /**
   * Delete user
   */
  static async deleteUser(uid: string) {
    await auth.deleteUser(uid);
  }

  /**
   * Get total user count
   */
  static async getUserCount(): Promise<number> {
    let count = 0;
    let pageToken: string | undefined;
    
    do {
      const result = await auth.listUsers(1000, pageToken);
      count += result.users.length;
      pageToken = result.pageToken;
    } while (pageToken);
    
    return count;
  }
}
