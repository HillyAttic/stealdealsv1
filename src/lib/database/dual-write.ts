// Dual-write abstraction layer for RTDB → Firestore migration
// Controls routing of reads/writes based on MIGRATION_PHASE env var
//
// Phases:
//   "shadow"     → writes go to RTDB + Firestore (shadow), reads from RTDB only
//   "dual-read"  → writes go to both, reads from Firestore primary with RTDB fallback
//   "firestore"  → reads/writes go to Firestore only
//   "rtdb"       → reads/writes go to RTDB only (default / fallback)

import {
  ref as rtdbRef,
  get as rtdbGet,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  push as rtdbPush,
  DataSnapshot as RtdbDataSnapshot,
} from 'firebase/database';
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
  orderBy,
  limit as fsLimit,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { database as rtdbDatabase } from '@/lib/firebase';
import { firestoreDb as fsDb } from '@/lib/firestore';

type MigrationPhase = 'rtdb' | 'shadow' | 'dual-read' | 'firestore';

function getPhase(): MigrationPhase {
  return (process.env.MIGRATION_PHASE as MigrationPhase) || 'rtdb';
}

// ─── Write helpers ──────────────────────────────────────────────────────────

/** Set a document — routes to RTDB, Firestore, or both based on phase */
export async function dualSet(
  rtdbPath: string,
  fsCollection: string,
  fsDocId: string,
  data: Record<string, unknown>
): Promise<void> {
  const phase = getPhase();

  if (phase === 'firestore') {
    await setDoc(doc(fsDb, fsCollection, fsDocId), data);
    return;
  }

  if (phase === 'rtdb') {
    await rtdbSet(rtdbRef(rtdbDatabase, rtdbPath), data);
    return;
  }

  // shadow or dual-read: write to RTDB primary, Firestore secondary
  await rtdbSet(rtdbRef(rtdbDatabase, rtdbPath), data);
  try {
    await setDoc(doc(fsDb, fsCollection, fsDocId), data);
  } catch (err) {
    console.warn(`[dual-write] Firestore shadow write failed for ${fsCollection}/${fsDocId}:`, err);
  }
}

/** Update a document — routes to RTDB, Firestore, or both based on phase */
export async function dualUpdate(
  rtdbPath: string,
  fsCollection: string,
  fsDocId: string,
  data: Record<string, unknown>
): Promise<void> {
  const phase = getPhase();

  if (phase === 'firestore') {
    await updateDoc(doc(fsDb, fsCollection, fsDocId), data);
    return;
  }

  if (phase === 'rtdb') {
    await rtdbUpdate(rtdbRef(rtdbDatabase, rtdbPath), data);
    return;
  }

  await rtdbUpdate(rtdbRef(rtdbDatabase, rtdbPath), data);
  try {
    await updateDoc(doc(fsDb, fsCollection, fsDocId), data);
  } catch (err) {
    console.warn(`[dual-write] Firestore shadow update failed for ${fsCollection}/${fsDocId}:`, err);
  }
}

/** Remove a document — routes to RTDB, Firestore, or both based on phase */
export async function dualRemove(
  rtdbPath: string,
  fsCollection: string,
  fsDocId: string
): Promise<void> {
  const phase = getPhase();

  if (phase === 'firestore') {
    await deleteDoc(doc(fsDb, fsCollection, fsDocId));
    return;
  }

  if (phase === 'rtdb') {
    await rtdbRemove(rtdbRef(rtdbDatabase, rtdbPath));
    return;
  }

  await rtdbRemove(rtdbRef(rtdbDatabase, rtdbPath));
  try {
    await deleteDoc(doc(fsDb, fsCollection, fsDocId));
  } catch (err) {
    console.warn(`[dual-write] Firestore shadow delete failed for ${fsCollection}/${fsDocId}:`, err);
  }
}

/** Push (auto-ID) a new item — returns the generated ID */
export async function dualPush(
  rtdbParentPath: string,
  fsCollectionPath: string,
  data: Record<string, unknown>
): Promise<string> {
  const phase = getPhase();

  if (phase === 'firestore') {
    // Firestore collection path like "wishlists/userId/items"
    const segments = fsCollectionPath.split('/');
    const colRef = collection(fsDb, ...segments);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  if (phase === 'rtdb') {
    const parentRef = rtdbRef(rtdbDatabase, rtdbParentPath);
    const newRef = rtdbPush(parentRef, data);
    return newRef.key!;
  }

  // shadow or dual-read: push to RTDB, add to Firestore
  const parentRef = rtdbRef(rtdbDatabase, rtdbParentPath);
  const newRef = rtdbPush(parentRef, data);
  const itemId = newRef.key!;
  try {
    const segments = fsCollectionPath.split('/');
    const colRef = collection(fsDb, ...segments);
    await setDoc(doc(colRef, itemId), data);
  } catch (err) {
    console.warn(`[dual-write] Firestore shadow push failed for ${fsCollectionPath}:`, err);
  }
  return itemId;
}

// ─── Read helpers ───────────────────────────────────────────────────────────

/** Read a single document — routes based on phase */
export async function dualGetSingle(
  rtdbPath: string,
  fsCollection: string,
  fsDocId: string
): Promise<{ exists: boolean; data: Record<string, unknown> | null; id: string }> {
  const phase = getPhase();

  // Firestore primary (dual-read / firestore phases)
  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const docSnap = await getDoc(doc(fsDb, fsCollection, fsDocId));
      if (docSnap.exists()) {
        return { exists: true, data: docSnap.data() as Record<string, unknown>, id: docSnap.id };
      }
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn(`[dual-write] Firestore read failed, falling back to RTDB for ${fsCollection}/${fsDocId}:`, err);
      } else {
        throw err;
      }
    }
  }

  // RTDB primary (rtdb / shadow / dual-read fallback)
  const snap = await rtdbGet(rtdbRef(rtdbDatabase, rtdbPath));
  if (snap.exists()) {
    return { exists: true, data: snap.val(), id: fsDocId };
  }
  return { exists: false, data: null, id: fsDocId };
}

/** Read a full collection — returns array of {id, data} objects */
export async function dualGetCollection(
  rtdbPath: string,
  fsCollection: string,
  constraints?: Array<unknown>
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const phase = getPhase();

  // Firestore primary
  if (phase === 'firestore' || phase === 'dual-read') {
    try {
      const segments = fsCollection.split('/');
      const colRef = collection(fsDb, ...segments);
      const q = constraints ? fsQuery(colRef, ...(constraints as any[])) : colRef;
      const querySnap = await getDocs(q);
      return querySnap.docs.map(d => ({ id: d.id, data: d.data() as Record<string, unknown> }));
    } catch (err) {
      if (phase === 'dual-read') {
        console.warn(`[dual-write] Firestore collection read failed, falling back to RTDB for ${fsCollection}:`, err);
      } else {
        throw err;
      }
    }
  }

  // RTDB primary
  const snap = await rtdbGet(rtdbRef(rtdbDatabase, rtdbPath));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.entries(val).map(([key, value]) => ({
    id: key,
    data: value as Record<string, unknown>,
  }));
}

// ─── Firestore query helpers (for when Firestore is the primary or only source) ───

export function firestoreCollection(path: string) {
  const segments = path.split('/');
  return collection(fsDb, ...segments);
}

export function firestoreDoc(colPath: string, docId: string) {
  const segments = colPath.split('/');
  return doc(fsDb, ...segments, docId);
}

export { fsQuery, where, orderBy, fsLimit, getDocs, getDoc, setDoc, updateDoc, deleteDoc, addDoc };
