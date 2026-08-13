import { database } from '@/lib/firebase';
import { ref, set, get, update, remove, push, query, orderByChild, equalTo, limitToFirst, startAt, endAt } from 'firebase/database';
import { User, UserActivity, WishlistItem, UserPreferences } from '@/types/auth';

// Database references
const usersRef = ref(database, 'users');
const userActivitiesRef = ref(database, 'userActivities');
const wishlistsRef = ref(database, 'wishlists');

/**
 * Create a new user in the database
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const newUserRef = push(usersRef);
    const userId = newUserRef.key!;
    
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await set(newUserRef, {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt.toISOString()
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const userData = snapshot.val() as {
      name: string;
      email: string;
      password?: string;
      avatar?: string;
      provider: 'email' | 'google';
      providerId?: string;
      role: 'user' | 'admin';
      isActive: boolean;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      lastLoginAt: string;
      preferences: any;
    };
    return {
      ...userData,
      id: userId,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: new Date(userData.lastLoginAt)
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to get user');
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersQuery = query(usersRef, orderByChild('email'), equalTo(email.toLowerCase()));
    const snapshot = await get(usersQuery);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const userData = Object.values(snapshot.val())[0] as {
      name: string;
      email: string;
      password?: string;
      avatar?: string;
      provider: 'email' | 'google';
      providerId?: string;
      role: 'user' | 'admin';
      isActive: boolean;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      lastLoginAt: string;
      preferences: any;
    };
    const userId = Object.keys(snapshot.val())[0];
    
    return {
      ...userData,
      id: userId,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: new Date(userData.lastLoginAt)
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error('Failed to get user');
  }
}

/**
 * Get user by provider ID (for OAuth users)
 */
export async function getUserByProviderId(providerId: string, provider: string): Promise<User | null> {
  try {
    const usersQuery = query(usersRef, orderByChild('providerId'), equalTo(providerId));
    const snapshot = await get(usersQuery);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    // Filter by provider as well since providerId might not be unique across providers
    const users = Object.entries(snapshot.val()).filter(([_, userData]: [string, any]) => 
      userData.provider === provider
    );
    
    if (users.length === 0) {
      return null;
    }
    
    const [userId, userData] = users[0];
    const typedUserData = userData as {
      name: string;
      email: string;
      password?: string;
      avatar?: string;
      provider: 'email' | 'google';
      providerId?: string;
      role: 'user' | 'admin';
      isActive: boolean;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      lastLoginAt: string;
      preferences: any;
    };
    
    return {
      ...typedUserData,
      id: userId,
      createdAt: new Date(typedUserData.createdAt),
      updatedAt: new Date(typedUserData.updatedAt),
      lastLoginAt: new Date(typedUserData.lastLoginAt)
    };
  } catch (error) {
    console.error('Error getting user by provider ID:', error);
    throw new Error('Failed to get user');
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Convert Date objects to ISO strings
    if (updates.lastLoginAt) {
      (updateData as any).lastLoginAt = updates.lastLoginAt.toISOString();
    }
    
    await update(userRef, updateData);
    
    // Get updated user
    const updatedUser = await getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  try {
    const userRef = ref(database, `users/${userId}/preferences`);
    await set(userRef, preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update user preferences');
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
    
    // Also remove user's activities and wishlist
    const userActivitiesQuery = query(userActivitiesRef, orderByChild('userId'), equalTo(userId));
    const activitiesSnapshot = await get(userActivitiesQuery);
    
    if (activitiesSnapshot.exists()) {
      const activities = Object.keys(activitiesSnapshot.val());
      for (const activityId of activities) {
        await remove(ref(database, `userActivities/${activityId}`));
      }
    }
    
    const userWishlistQuery = query(wishlistsRef, orderByChild('userId'), equalTo(userId));
    const wishlistSnapshot = await get(userWishlistQuery);
    
    if (wishlistSnapshot.exists()) {
      const wishlistItems = Object.keys(wishlistSnapshot.val());
      for (const itemId of wishlistItems) {
        await remove(ref(database, `wishlists/${itemId}`));
      }
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Get all users with pagination
 */
export async function getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
  try {
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return { users: [], total: 0 };
    }
    
    const allUsers = Object.entries(snapshot.val()).map(([id, userData]: [string, any]) => ({
      ...userData,
      id,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: new Date(userData.lastLoginAt)
    }));
    
    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = allUsers.slice(startIndex, endIndex);
    
    return { users, total };
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to get users');
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm: string, limit: number = 20): Promise<User[]> {
  try {
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const allUsers = Object.entries(snapshot.val()).map(([id, userData]: [string, any]) => ({
      ...userData,
      id,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: new Date(userData.lastLoginAt)
    }));
    
    const searchTermLower = searchTerm.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
    
    return filteredUsers.slice(0, limit);
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}> {
  try {
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return { totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0 };
    }
    
    const allUsers = Object.values(snapshot.val()) as any[];
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => 
      new Date(user.lastLoginAt) > weekAgo
    ).length;
    const newUsersThisMonth = allUsers.filter(user => 
      new Date(user.createdAt) > monthAgo
    ).length;
    
    return { totalUsers, activeUsers, newUsersThisMonth };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw new Error('Failed to get user statistics');
  }
}

/**
 * Get user profile (alias for getUserById for consistency with API)
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  return getUserById(userId);
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  website?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}): Promise<User | null> {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone;
    }
    
    if (updates.location !== undefined) {
      updateData.location = updates.location;
    }
    
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    
    if (updates.company !== undefined) {
      updateData.company = updates.company;
    }
    
    if (updates.website !== undefined) {
      updateData.website = updates.website;
    }
    
    if (updates.avatar !== undefined) {
      updateData.avatar = updates.avatar;
    }
    
    if (updates.preferences) {
      // Get current user to merge preferences
      const currentUser = await getUserById(userId);
      if (currentUser) {
        updateData.preferences = {
          ...currentUser.preferences,
          ...updates.preferences
        };
      }
    }
    
    await update(userRef, updateData);
    
    // Return updated user
    return getUserById(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(userId: string, avatarUrl: string | null): Promise<User | null> {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const updateData = {
      avatar: avatarUrl,
      updatedAt: new Date().toISOString()
    };
    
    await update(userRef, updateData);
    
    // Return updated user
    return getUserById(userId);
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw new Error('Failed to update user avatar');
  }
}

/**
 * Delete user account with password verification
 */
export async function deleteUserAccount(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user to verify password
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // For OAuth users, skip password verification
    if (user.provider !== 'email') {
      await deleteUser(userId);
      return { success: true };
    }
    
    // Verify password for email users
    if (!user.password) {
      return { success: false, error: 'Invalid account state' };
    }
    
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }
    
    // Delete user account
    await deleteUser(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}