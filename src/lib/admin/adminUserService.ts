import { auth, database, AdminUser } from '../firebase-server-admin';
import { UserRecord } from 'firebase-admin/auth';

/**
 * Service for managing admin users in Firebase
 * Handles user creation, permission management, and database operations
 */
export class AdminUserService {
  private static readonly ADMIN_USERS_PATH = 'admin_users';

  /**
   * Create a new admin user with Firebase Authentication and store permissions in Realtime Database
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

      // Prepare admin user data for database
      const adminUser: AdminUser = {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions,
        createdAt: new Date().toISOString(),
        createdBy: userData.createdBy,
      };

      // Store admin user data in Realtime Database
      await database.ref(`${this.ADMIN_USERS_PATH}/${userRecord.uid}`).set(adminUser);

      return { success: true, user: adminUser };
    } catch (error) {
      console.error('Error creating admin user:', error);

      // Provide specific error messages
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
   * Get admin user data from Realtime Database
   */
  static async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      // Try new path first
      let snapshot = await database.ref(`adminUsers/${uid}`).once('value');

      // Fallback to legacy path
      if (!snapshot.exists()) {
        snapshot = await database.ref(`${this.ADMIN_USERS_PATH}/${uid}`).once('value');
      }

      let userData = snapshot.val() as AdminUser | null;
      
      // Ensure new permissions are added to existing users
      if (userData && userData.permissions && userData.permissions.pages) {
        // Add missing permissions with default values
        const updatedPages = {
          vacant: userData.permissions.pages.vacant ?? false,
          plots: userData.permissions.pages.plots ?? false,
          franchise: userData.permissions.pages.franchise ?? false,
          preleased: userData.permissions.pages.preleased ?? false,
          // Add new permissions with default values
          dashboard: userData.permissions.pages.dashboard ?? false,
          users: userData.permissions.pages.users ?? false,
          wishlist: userData.permissions.pages.wishlist ?? false,
          analytics: userData.permissions.pages.analytics ?? false,
          migration: userData.permissions.pages.migration ?? false,
        };
        
        // Update the user data if new permissions were added
        if (JSON.stringify(updatedPages) !== JSON.stringify(userData.permissions.pages)) {
          userData.permissions.pages = updatedPages;
          
          // Update the database with the new permissions structure
          await database.ref(`${this.ADMIN_USERS_PATH}/${uid}/permissions/pages`).update(updatedPages);
          await database.ref(`adminUsers/${uid}/permissions/pages`).update(updatedPages);
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error fetching admin user:', error);
      return null;
    }
  }

  /**
   * Get all admin users from Realtime Database
   */
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const snapshot = await database.ref(this.ADMIN_USERS_PATH).once('value');
      const users = snapshot.val();

      if (!users) return [];

      return Object.values(users) as AdminUser[];
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
      // Update in both potential locations to be safe
      await Promise.all([
        database.ref(`${this.ADMIN_USERS_PATH}/${uid}/permissions`).set(permissions),
        database.ref(`adminUsers/${uid}/permissions`).set(permissions)
      ]);
      return { success: true };
    } catch (error) {
      console.error('Error updating admin user permissions:', error);
      return { success: false, error: 'Failed to update permissions' };
    }
  }

  /**
   * Delete admin user (both from Authentication and Database)
   */
  static async deleteAdminUser(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete from Firebase Authentication
      await auth.deleteUser(uid);

      // Delete from Realtime Database
      await database.ref(`${this.ADMIN_USERS_PATH}/${uid}`).remove();

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
   * Initialize database schema - create admin_users collection structure
   */
  static async initializeSchema(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if admin_users path exists
      const snapshot = await database.ref(this.ADMIN_USERS_PATH).once('value');

      if (!snapshot.exists()) {
        // Initialize with empty object to create the path
        await database.ref(this.ADMIN_USERS_PATH).set({});
        console.log('Admin users collection initialized');
      }

      return { success: true };
    } catch (error) {
      console.error('Error initializing admin users schema:', error);
      return { success: false, error: 'Failed to initialize schema' };
    }
  }
}