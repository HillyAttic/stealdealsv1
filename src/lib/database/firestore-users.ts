// Firestore users module — Firestore-only implementation
// Migration complete: all operations go to Firestore exclusively.
//
// Firestore structure: users/{userId}
//
// NOTE: Uses Admin SDK (bypasses security rules) because
// this module is imported by SERVER routes that have no signed-in client user.

import { User, UserPreferences } from '@/types/auth';

// Admin SDK imports — used for Firestore (server-side, no rules)
import { db } from '@/lib/firebase-server-admin';
import admin from 'firebase-admin';

// ─── Admin SDK helpers ──────────────────────────────────────────────────────

function adminUsersCol() {
  return (db as admin.firestore.Firestore).collection('users');
}

function adminUserDoc(userId: string) {
  return (db as admin.firestore.Firestore).collection('users').doc(userId);
}

// ─── Date normalization: handles Date, Timestamp, ISO strings ────────────────

function toDate(value: any): Date {
  if (value instanceof Date) return value;
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
  if (value?.seconds && typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'string') return new Date(value);
  return new Date();
}

function deserializeUser(id: string, data: any): User {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastLoginAt: toDate(data.lastLoginAt),
  } as User;
}

function serializeUser(user: User): any {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt.toISOString(),
  };
}

// ─── Create user ────────────────────────────────────────────────────────────

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const docRef = adminUsersCol().doc();
  const userId = docRef.id;
  const user: User = {
    ...userData,
    id: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await docRef.set(serializeUser(user));
  return user;
}

// ─── Get user by ID ─────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<User | null> {
  const docSnap = await adminUserDoc(userId).get();
  if (docSnap.exists) {
    return deserializeUser(docSnap.id, docSnap.data());
  }
  return null;
}

// ─── Get user by email ──────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase();
  const snap = await adminUsersCol().where('email', '==', normalizedEmail).get();
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return deserializeUser(docSnap.id, docSnap.data());
  }
  return null;
}

// ─── Get user by provider ID (OAuth) ────────────────────────────────────────

export async function getUserByProviderId(providerId: string, provider: string): Promise<User | null> {
  const snap = await adminUsersCol().where('providerId', '==', providerId).get();
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.provider === provider) {
      return deserializeUser(docSnap.id, data);
    }
  }
  return null;
}

// ─── Update user ────────────────────────────────────────────────────────────

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const updateData: any = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.lastLoginAt) {
    updateData.lastLoginAt = updates.lastLoginAt.toISOString();
  }

  await adminUserDoc(userId).update(updateData);
  const updated = await getUserById(userId);
  if (!updated) throw new Error('User not found after update');
  return updated;
}

// ─── Update user preferences ────────────────────────────────────────────────

export async function updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  await adminUserDoc(userId).update({ preferences });
}

// ─── Delete user ────────────────────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<void> {
  await adminUserDoc(userId).delete();

  // Delete user activities
  const activitiesSnap = await (db as admin.firestore.Firestore)
    .collection('userActivities')
    .where('userId', '==', userId)
    .get();
  const batch = (db as admin.firestore.Firestore).batch();
  activitiesSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  // Delete wishlist items (subcollection)
  const wishlistSnap = await (db as admin.firestore.Firestore)
    .collection('wishlists')
    .doc(userId)
    .collection('items')
    .get();
  const wishBatch = (db as admin.firestore.Firestore).batch();
  wishlistSnap.docs.forEach(d => wishBatch.delete(d.ref));
  await wishBatch.commit();
}

// ─── Get all users (paginated) ──────────────────────────────────────────────

export async function getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
  const snap = await adminUsersCol().get();
  const allUsers = snap.docs.map(d => deserializeUser(d.id, d.data()));
  const total = allUsers.length;
  const start = (page - 1) * limit;
  return { users: allUsers.slice(start, start + limit), total };
}

// ─── Search users ───────────────────────────────────────────────────────────

export async function searchUsers(searchTerm: string, limit: number = 20): Promise<User[]> {
  const term = searchTerm.toLowerCase();
  const snap = await adminUsersCol().get();
  const all = snap.docs.map(d => deserializeUser(d.id, d.data()));
  return all
    .filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
    .slice(0, limit);
}

// ─── User statistics ────────────────────────────────────────────────────────

export async function getUserStatistics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}> {
  const snap = await adminUsersCol().get();
  const allUsers = snap.docs.map(d => d.data());
  return computeStats(allUsers);
}

function computeStats(allUsers: any[]): { totalUsers: number; activeUsers: number; newUsersThisMonth: number } {
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => new Date(u.lastLoginAt) > weekAgo).length,
    newUsersThisMonth: allUsers.filter(u => new Date(u.createdAt) > monthAgo).length,
  };
}

// ─── Aliases and profile helpers ────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<User | null> {
  return getUserById(userId);
}

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
  const updateData: any = { updatedAt: new Date().toISOString() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.company !== undefined) updateData.company = updates.company;
  if (updates.website !== undefined) updateData.website = updates.website;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

  if (updates.preferences) {
    const currentUser = await getUserById(userId);
    if (currentUser) {
      updateData.preferences = { ...currentUser.preferences, ...updates.preferences };
    }
  }

  await adminUserDoc(userId).update(updateData);
  return getUserById(userId);
}

export async function updateUserAvatar(userId: string, avatarUrl: string | null): Promise<User | null> {
  const updateData = { avatar: avatarUrl, updatedAt: new Date().toISOString() };
  await adminUserDoc(userId).update(updateData);
  return getUserById(userId);
}

export async function deleteUserAccount(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    if (user.provider !== 'email') {
      await deleteUser(userId);
      return { success: true };
    }

    if (!user.password) return { success: false, error: 'Invalid account state' };

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { success: false, error: 'Invalid password' };

    await deleteUser(userId);
    return { success: true };
  } catch (err) {
    console.error('Error deleting user account:', err);
    return { success: false, error: 'Failed to delete account' };
  }
}

// ─── Firebase Auth Integration ──────────────────────────────────────────────

/**
 * Get user by Firebase UID (alias for getUserById)
 * This is the primary lookup method for Firebase Auth integration
 */
export async function getUserByUid(uid: string): Promise<User | null> {
  return getUserById(uid);
}

/**
 * Create or update user document for Firebase Auth user
 */
export async function upsertUserForFirebaseAuth(
  uid: string,
  userData: Partial<User>
): Promise<User> {
  const now = new Date().toISOString();

  const userDocPayload = {
    ...userData,
    id: uid,
    updatedAt: now,
  };

  await adminUserDoc(uid).set(userDocPayload, { merge: true });
  const user = await getUserById(uid);
  if (!user) throw new Error('User not found after upsert');
  return user;
}

/**
 * Update last login timestamp for Firebase Auth user
 */
export async function updateFirebaseAuthLastLogin(uid: string): Promise<void> {
  const now = new Date().toISOString();
  await adminUserDoc(uid).update({ lastLoginAt: now, updatedAt: now });
}
