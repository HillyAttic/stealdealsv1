import { auth, db, AdminUser } from '../firebase-server-admin';
import { UserRecord } from 'firebase-admin/auth';

/**
 * Service for managing admin users in Firestore
 * Handles user creation, permission management, and database operations
 *
 * Migrated from RTDB (admin_users path) to Firestore (adminUsers collection).
 * Uses the Firestore admin SDK proxy (`db`) from firebase-server-admin.ts.
 */
export class AdminUserService {
  private static readonly COLLECTION = 'adminUsers';

  /**
   * Create a new admin user with Firebase Authentication and store permissions in Firestore
   */
  static async createAdminUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'superuser' | 'subuser';
    permissions: AdminUser['permissions'];
    createdBy: string;
  }): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // Create Firebase Authentication user
      const userRecord: UserRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        emailVerified: true, // Admin users are pre-verified
      });

      // Prepare admin user data for Firestore
      const adminUser: AdminUser = {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions,
        createdAt: new Date().toISOString(),
        createdBy: userData.createdBy,
      };

      // Store admin user data in Firestore
      await db.collection(this.COLLECTION).doc(userRecord.uid).set(adminUser);

      return { success: true, user: adminUser };
    } catch (error) {
      console.error('Error creating admin user:', error);

      if (error instanceof Error) {
        if (error.message.includes('email-already-exists')) {
          return { success: false, error: 'Email already exists' };
        }
        if (error.message.includes('weak-password')) {
          return { success: false, error: 'Password is too weak' };
        }
        if (error.message.includes('invalid-email')) {
          return { success: false, error: 'Invalid email format' };
        }
      }

      return { success: false, error: 'Failed to create admin user' };
    }
  }

  /**
   * Get admin user data from Firestore
   */
  static async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      console.log('[AdminUserService] Fetching admin user from Firestore:', uid);

      const docRef = db.collection(this.COLLECTION).doc(uid);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        console.log('[AdminUserService] User not found in Firestore');
        return null;
      }

      let userData = docSnap.data() as AdminUser;
      console.log('[AdminUserService] User found in Firestore');

      // Ensure new permissions are added to existing users
      if (userData && userData.permissions && userData.permissions.pages) {
        const updatedPages = {
          vacant: userData.permissions.pages.vacant ?? false,
          plots: userData.permissions.pages.plots ?? false,
          franchise: userData.permissions.pages.franchise ?? false,
          preleased: userData.permissions.pages.preleased ?? false,
          dashboard: userData.permissions.pages.dashboard ?? false,
          users: userData.permissions.pages.users ?? false,
          wishlist: userData.permissions.pages.wishlist ?? false,
          analytics: userData.permissions.pages.analytics ?? false,
          migration: userData.permissions.pages.migration ?? false,
        };

        if (JSON.stringify(updatedPages) !== JSON.stringify(userData.permissions.pages)) {
          userData.permissions.pages = updatedPages;
          // Update the document with the new permissions structure
          await docRef.update({ 'permissions.pages': updatedPages });
          console.log('[AdminUserService] Updated permissions schema for user:', uid);
        }
      }

      return userData;
    } catch (error) {
      console.error('[AdminUserService] Error fetching admin user:', error);
      return null;
    }
  }

  /**
   * Get all admin users from Firestore
   */
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const snapshot = await db.collection(this.COLLECTION).get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => doc.data() as AdminUser);
    } catch (error) {
      console.error('Error fetching all admin users:', error);
      return [];
    }
  }

  /**
   * Update admin user permissions
   */
  static async updateAdminUserPermissions(
    uid: string,
    permissions: AdminUser['permissions']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await db.collection(this.COLLECTION).doc(uid).update({ permissions });
      return { success: true };
    } catch (error) {
      console.error('Error updating admin user permissions:', error);
      return { success: false, error: 'Failed to update permissions' };
    }
  }

  /**
   * Delete admin user (both from Authentication and Firestore)
   */
  static async deleteAdminUser(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete from Firebase Authentication
      await auth.deleteUser(uid);

      // Delete from Firestore
      await db.collection(this.COLLECTION).doc(uid).delete();

      return { success: true };
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return { success: false, error: 'Failed to delete admin user' };
    }
  }

  /**
   * Verify if a user is an admin and get their permissions
   */
  static async verifyAdminUser(uid: string): Promise<{
    isAdmin: boolean;
    user?: AdminUser;
    error?: string;
  }> {
    try {
      const adminUser = await this.getAdminUser(uid);

      if (!adminUser) {
        return { isAdmin: false };
      }

      return { isAdmin: true, user: adminUser };
    } catch (error) {
      console.error('Error verifying admin user:', error);
      return { isAdmin: false, error: 'Failed to verify admin user' };
    }
  }

  /**
   * Initialize Firestore collection — no-op since Firestore creates collections on first write.
   * Kept for API compatibility.
   */
  static async initializeSchema(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[AdminUserService] Firestore collections are auto-created on first write — no schema init needed.');
      return { success: true };
    } catch (error) {
      console.error('Error in schema initialization check:', error);
      return { success: false, error: 'Failed to initialize schema' };
    }
  }
}
