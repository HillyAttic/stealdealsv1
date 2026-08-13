// Firestore users module — drop-in replacement for src/lib/database/users.ts
// Routes to RTDB or Firestore based on MIGRATION_PHASE env var
//
// Firestore structure: users/{userId}
// RTDB structure:      users/{userId}

import { User, UserActivity, WishlistItem, UserPreferences } from '@/types/auth';

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

// Firestore imports
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
  limit as fsLimit,
  orderBy as fsOrderBy,
  startAt as fsStartAt,
  endAt as fsEndAt,
  DocumentData,
} from 'firebase/firestore';
import { firestoreDb } from '@/lib/firestore';

type MigrationPhase = 'rtdb' | 'shadow' | 'dual-read' | 'firestore';

function getPhase(): MigrationPhase {
  return (process.env.MIGRATION_PHASE as MigrationPhase) || 'rtdb';
}

function usersCol() {
  return collection(firestoreDb, 'users');
}

function userDoc(userId: string) {
  return doc(firestoreDb, 'users', userId);
}

// ─── Helper: serialize/deserialize user ─────────────────────────────────────

function serializeUser(user: User): DocumentData {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt.toISOString(),
  };
}

function deserializeUser(id: string, data: DocumentData): User {
  return {
    ...data,
    id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastLoginAt: new Date(data.lastLoginAt),
  } as User;
}

// ─── Create user ────────────────────────────────────────────────────────────

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const docRef = await addDoc(usersCol(), {});
    const userId = docRef.id;
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(docRef, serializeUser(user));
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
      const docSnap = await getDoc(userDoc(userId));
      if (docSnap.exists()) {
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
      const q = fsQuery(usersCol(), where('email', '==', normalizedEmail));
      const snap = await getDocs(q);
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
      const q = fsQuery(usersCol(), where('providerId', '==', providerId));
      const snap = await getDocs(q);
      // Filter by provider in case providerId is not unique across providers
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
    await updateDoc(userDoc(userId), updateData);
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
    await updateDoc(userDoc(userId), { preferences });
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
    await deleteDoc(userDoc(userId));
    // Delete user activities
    const activitiesQ = fsQuery(collection(firestoreDb, 'userActivities'), where('userId', '==', userId));
    const activitiesSnap = await getDocs(activitiesQ);
    for (const d of activitiesSnap.docs) await deleteDoc(d.ref);
    // Delete wishlist items (subcollection)
    const wishlistCol = collection(firestoreDb, 'wishlists', userId, 'items');
    const wishlistSnap = await getDocs(wishlistCol);
    for (const d of wishlistSnap.docs) await deleteDoc(d.ref);
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
      const snap = await getDocs(usersCol());
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
      // Firestore doesn't support LIKE queries — fetch all and filter client-side
      // (For large user bases, use a search service instead)
      const snap = await getDocs(usersCol());
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
      const snap = await getDocs(usersCol());
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
    await updateDoc(userDoc(userId), updateData);
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
    await updateDoc(userDoc(userId), updateData);
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
