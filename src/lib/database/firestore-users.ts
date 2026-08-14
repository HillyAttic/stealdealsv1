// Firestore users module — drop-in replacement for src/lib/database/users.ts
// Routes to RTDB or Firestore based on MIGRATION_PHASE env var
//
// Firestore structure: users/{userId}
// RTDB structure:      users/{userId}
//
// NOTE: Firestore-phase now uses Admin SDK (bypasses security rules) because
// this module is imported by SERVER routes that have no signed-in client user.

import { User, UserPreferences } from '@/types/auth';

// RTDB imports
import { database } from '@/lib/firebase';
import {
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  push as rtdbPush,
  query as rtdbQuery,
  orderByChild,
  equalTo,
  limitToFirst,
  startAt,
  endAt,
} from 'firebase/database';

// Admin SDK imports — used for Firestore-phase (server-side, no rules)
import { db } from '@/lib/firebase-server-admin';
import admin from 'firebase-admin';

// Client SDK imports — kept for shadow / dual-read fallback paths ONLY
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query as fsQuery,
  where,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firestore';

type MigrationPhase = 'rtdb' | 'shadow' | 'dual-read' | 'firestore';

function getPhase(): MigrationPhase {
  return (process.env.MIGRATION_PHASE as MigrationPhase) || 'rtdb';
}

// ─── Admin SDK helpers (primary for firestore phase) ──────────────────────

function adminUsersCol() {
  return (db as admin.firestore.Firestore).collection('users');
}

function adminUserDoc(userId: string) {
  return (db as admin.firestore.Firestore).collection('users').doc(userId);
}

// ─── Client SDK helpers (fallback for shadow / dual-read only) ───────────────

function usersCol() {
  return collection(firestoreDb, 'users');
}

function userDoc(userId: string) {
  return doc(firestoreDb, 'users', userId);
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
  const phase = getPhase();

  if (phase === 'firestore') {
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

  // RTDB path (also for shadow/dual-read — primary write)
  const newUserRef = rtdbPush(rtdbRef(database, 'users'));
  const userId = newUserRef.key!;
  const user: User = {
    ...userData,
    id: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await rtdbSet(newUserRef, serializeUser(user));

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await setDoc(userDoc(userId), serializeUser(user));
    } catch (err) {
      console.warn('[Firestore Users] Shadow write failed for createUser:', err);
    }
  }

  return user;
}

// ─── Get user by ID ─────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<User | null> {
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const docSnap = await adminUserDoc(userId).get();
      if (docSnap.exists) {
        return deserializeUser(docSnap.id, docSnap.data());
      }
      if (phase === 'firestore') return null;
      // dual-read: fall through to RTDB
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore read failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const snap = await rtdbGet(rtdbRef(database, `users/${userId}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  return {
    ...data,
    id: userId,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastLoginAt: new Date(data.lastLoginAt),
  } as User;
}

// ─── Get user by email ──────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const phase = getPhase();
  const normalizedEmail = email.toLowerCase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const snap = await adminUsersCol().where('email', '==', normalizedEmail).get();
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return deserializeUser(docSnap.id, docSnap.data());
      }
      if (phase === 'firestore') return null;
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore email query failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const q = rtdbQuery(rtdbRef(database, 'users'), orderByChild('email'), equalTo(normalizedEmail));
  const snap = await rtdbGet(q);
  if (!snap.exists()) return null;
  const val = snap.val();
  const userId = Object.keys(val)[0];
  const userData = Object.values(val)[0] as any;
  return {
    ...userData,
    id: userId,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(userData.updatedAt),
    lastLoginAt: new Date(userData.lastLoginAt),
  } as User;
}

// ─── Get user by provider ID (OAuth) ────────────────────────────────────────

export async function getUserByProviderId(providerId: string, provider: string): Promise<User | null> {
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const snap = await adminUsersCol().where('providerId', '==', providerId).get();
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.provider === provider) {
          return deserializeUser(docSnap.id, data);
        }
      }
      if (phase === 'firestore') return null;
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore provider query failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const q = rtdbQuery(rtdbRef(database, 'users'), orderByChild('providerId'), equalTo(providerId));
  const snap = await rtdbGet(q);
  if (!snap.exists()) return null;
  const entries = Object.entries(snap.val()).filter(([_, v]: [string, any]) => v.provider === provider);
  if (entries.length === 0) return null;
  const [userId, userData] = entries[0] as [string, any];
  return {
    ...userData,
    id: userId,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(userData.updatedAt),
    lastLoginAt: new Date(userData.lastLoginAt),
  } as User;
}

// ─── Update user ────────────────────────────────────────────────────────────

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const phase = getPhase();
  const updateData: any = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.lastLoginAt) {
    updateData.lastLoginAt = updates.lastLoginAt.toISOString();
  }

  if (phase === 'firestore') {
    await adminUserDoc(userId).update(updateData);
    return (await getUserById(userId))!;
  }

  await rtdbUpdate(rtdbRef(database, `users/${userId}`), updateData);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await updateDoc(userDoc(userId), updateData);
    } catch (err) {
      console.warn('[Firestore Users] Shadow update failed:', err);
    }
  }

  const updated = await getUserById(userId);
  if (!updated) throw new Error('User not found after update');
  return updated;
}

// ─── Update user preferences ────────────────────────────────────────────────

export async function updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  const phase = getPhase();

  if (phase === 'firestore') {
    await adminUserDoc(userId).update({ preferences });
    return;
  }

  await rtdbSet(rtdbRef(database, `users/${userId}/preferences`), preferences);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await updateDoc(userDoc(userId), { preferences });
    } catch (err) {
      console.warn('[Firestore Users] Shadow preferences update failed:', err);
    }
  }
}

// ─── Delete user ────────────────────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<void> {
  const phase = getPhase();

  if (phase === 'firestore') {
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
    return;
  }

  await rtdbRemove(rtdbRef(database, `users/${userId}`));

  // Clean up activities and wishlists in RTDB
  const activitiesQ = rtdbQuery(rtdbRef(database, 'userActivities'), orderByChild('userId'), equalTo(userId));
  const activitiesSnap = await rtdbGet(activitiesQ);
  if (activitiesSnap.exists()) {
    for (const activityId of Object.keys(activitiesSnap.val())) {
      await rtdbRemove(rtdbRef(database, `userActivities/${activityId}`));
    }
  }

  await rtdbRemove(rtdbRef(database, `wishlists/${userId}`));

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await deleteDoc(userDoc(userId));
    } catch (err) {
      console.warn('[Firestore Users] Shadow delete failed:', err);
    }
  }
}

// ─── Get all users (paginated) ──────────────────────────────────────────────

export async function getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const snap = await adminUsersCol().get();
      const allUsers = snap.docs.map(d => deserializeUser(d.id, d.data()));
      const total = allUsers.length;
      const start = (page - 1) * limit;
      return { users: allUsers.slice(start, start + limit), total };
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore getUsers failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const snap = await rtdbGet(rtdbRef(database, 'users'));
  if (!snap.exists()) return { users: [], total: 0 };
  const allUsers = Object.entries(snap.val()).map(([id, data]: [string, any]) => ({
    ...data,
    id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastLoginAt: new Date(data.lastLoginAt),
  })) as User[];
  const total = allUsers.length;
  const start = (page - 1) * limit;
  return { users: allUsers.slice(start, start + limit), total };
}

// ─── Search users ───────────────────────────────────────────────────────────

export async function searchUsers(searchTerm: string, limit: number = 20): Promise<User[]> {
  const phase = getPhase();
  const term = searchTerm.toLowerCase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const snap = await adminUsersCol().get();
      const all = snap.docs.map(d => deserializeUser(d.id, d.data()));
      return all
        .filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
        .slice(0, limit);
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore search failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const snap = await rtdbGet(rtdbRef(database, 'users'));
  if (!snap.exists()) return [];
  const all = Object.entries(snap.val()).map(([id, data]: [string, any]) => ({
    ...data,
    id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastLoginAt: new Date(data.lastLoginAt),
  })) as User[];
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
  const phase = getPhase();

  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const snap = await adminUsersCol().get();
      const allUsers = snap.docs.map(d => d.data());
      return computeStats(allUsers);
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn('[Firestore Users] Firestore stats failed, falling back to RTDB');
      } else {
        throw err;
      }
    }
  }

  const snap = await rtdbGet(rtdbRef(database, 'users'));
  if (!snap.exists()) return { totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0 };
  return computeStats(Object.values(snap.val()));
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
  const phase = getPhase();
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

  if (phase === 'firestore') {
    await adminUserDoc(userId).update(updateData);
    return getUserById(userId);
  }

  await rtdbUpdate(rtdbRef(database, `users/${userId}`), updateData);
  if (phase === 'shadow' || phase === 'dual-read') {
    try { await updateDoc(userDoc(userId), updateData); } catch (e) { /* shadow */ }
  }
  return getUserById(userId);
}

export async function updateUserAvatar(userId: string, avatarUrl: string | null): Promise<User | null> {
  const phase = getPhase();
  const updateData = { avatar: avatarUrl, updatedAt: new Date().toISOString() };

  if (phase === 'firestore') {
    await adminUserDoc(userId).update(updateData);
    return getUserById(userId);
  }

  await rtdbUpdate(rtdbRef(database, `users/${userId}`), updateData);
  if (phase === 'shadow' || phase === 'dual-read') {
    try { await updateDoc(userDoc(userId), updateData); } catch (e) { /* shadow */ }
  }
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
  const phase = getPhase();
  const now = new Date().toISOString();

  const userDocPayload = {
    ...userData,
    id: uid,
    updatedAt: now,
  };

  if (phase === 'firestore') {
    await adminUserDoc(uid).set(userDocPayload, { merge: true });
    return (await getUserById(uid))!;
  }

  // RTDB path
  await rtdbSet(rtdbRef(database, `users/${uid}`), userDocPayload);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await setDoc(doc(firestoreDb, 'users', uid), userDocPayload, { merge: true });
    } catch (err) {
      console.warn('[Firestore Users] Shadow upsert failed:', err);
    }
  }

  return (await getUserById(uid))!;
}

/**
 * Update last login timestamp for Firebase Auth user
 */
export async function updateFirebaseAuthLastLogin(uid: string): Promise<void> {
  const phase = getPhase();
  const now = new Date().toISOString();

  if (phase === 'firestore') {
    await adminUserDoc(uid).update({ lastLoginAt: now, updatedAt: now });
    return;
  }

  await rtdbUpdate(rtdbRef(database, `users/${uid}`), {
    lastLoginAt: now,
    updatedAt: now
  });

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await updateDoc(userDoc(uid), { lastLoginAt: now, updatedAt: now });
    } catch (err) {
      console.warn('[Firestore Users] Shadow last login update failed:', err);
    }
  }
}
