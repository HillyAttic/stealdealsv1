import { User, UserActivity, WishlistItem, UserPreferences } from '@/types/auth';

// In-memory user storage for testing (replace with real database in production)
const users: Map<string, User> = new Map();
const usersByEmail: Map<string, string> = new Map(); // email -> userId mapping
let nextUserId = 1;

/**
 * Create a new user in the mock database
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const userId = nextUserId.toString();
    nextUserId++;
    
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.set(userId, user);
    usersByEmail.set(userData.email.toLowerCase(), userId);
    
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
    const user = users.get(userId);
    return user || null;
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
    const userId = usersByEmail.get(email.toLowerCase());
    if (!userId) {
      return null;
    }
    
    return users.get(userId) || null;
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
    for (const user of users.values()) {
      if (user.providerId === providerId && user.provider === provider) {
        return user;
      }
    }
    return null;
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
    const existingUser = users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date()
    };
    
    users.set(userId, updatedUser);
    
    // Update email mapping if email changed
    if (updates.email && updates.email !== existingUser.email) {
      usersByEmail.delete(existingUser.email.toLowerCase());
      usersByEmail.set(updates.email.toLowerCase(), userId);
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
    const existingUser = users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...existingUser,
      preferences,
      updatedAt: new Date()
    };
    
    users.set(userId, updatedUser);
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
    const user = users.get(userId);
    if (user) {
      users.delete(userId);
      usersByEmail.delete(user.email.toLowerCase());
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
    const allUsers = Array.from(users.values());
    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);
    
    return { users: paginatedUsers, total };
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
    const allUsers = Array.from(users.values());
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
    const allUsers = Array.from(users.values());
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => 
      user.lastLoginAt > weekAgo
    ).length;
    const newUsersThisMonth = allUsers.filter(user => 
      user.createdAt > monthAgo
    ).length;
    
    return { totalUsers, activeUsers, newUsersThisMonth };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw new Error('Failed to get user statistics');
  }
}

/**
 * Initialize with some test data
 */
export function initializeTestData() {
  // Add a test admin user
  const adminUser: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@stealdeals.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // hashed "admin123"
    provider: 'email',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    preferences: {
      propertyTypes: [],
      priceRange: { min: 0, max: 10000000 },
      locations: [],
      notifications: {
        email: true,
        push: false,
        newProperties: true,
        priceAlerts: true
      }
    }
  };
  
  // Add test regular users
  const testUsers: User[] = [
    {
      id: '2',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
      provider: 'email',
      role: 'user',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(),
      lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      preferences: {
        propertyTypes: ['Apartment', 'Villa'],
        priceRange: { min: 500000, max: 2000000 },
        locations: ['Mumbai', 'Delhi'],
        notifications: {
          email: true,
          push: true,
          newProperties: true,
          priceAlerts: true
        }
      }
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      provider: 'google' as const,
      providerId: 'google-123456',
      role: 'user',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(),
      lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      preferences: {
        propertyTypes: ['Office', 'Retail'],
        priceRange: { min: 1000000, max: 5000000 },
        locations: ['Bangalore', 'Pune'],
        notifications: {
          email: true,
          push: false,
          newProperties: false,
          priceAlerts: true
        }
      }
    },
    {
      id: '4',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G',
      provider: 'email',
      role: 'user',
      isActive: false,
      emailVerified: false,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(),
      lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      preferences: {
        propertyTypes: ['House'],
        priceRange: { min: 300000, max: 1000000 },
        locations: ['Chennai'],
        notifications: {
          email: false,
          push: false,
          newProperties: false,
          priceAlerts: false
        }
      }
    }
  ];
  
  users.set('1', adminUser);
  usersByEmail.set('admin@stealdeals.com', '1');
  
  testUsers.forEach(user => {
    users.set(user.id, user);
    usersByEmail.set(user.email.toLowerCase(), user.id);
  });
  
  nextUserId = 5;
}

// Initialize test data
initializeTestData();

// Seed some test activity data
export function seedTestActivityData() {
  // This would be called from activity.ts to create test activities
  // We'll implement this in the activity file
}