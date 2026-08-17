// Firestore-only abstraction layer (previously dual-write for RTDB → Firestore migration)
// Migration complete: all reads/writes go to Firestore only.
//
// The rtdbPath parameter on each function is kept for API compatibility but is ignored.
// All operations target Firestore exclusively.

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
} from 'firebase/firestore';
import { firestoreDb as fsDb } from '@/lib/firestore';

// ─── Write helpers ──────────────────────────────────────────────────────────

/** Set a document in Firestore. `rtdbPath` is ignored (kept for API compat). */
export async function dualSet(
  _rtdbPath: string,
  fsCollection: string,
  fsDocId: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(fsDb, fsCollection, fsDocId), data);
}

/** Update a document in Firestore. `rtdbPath` is ignored (kept for API compat). */
export async function dualUpdate(
  _rtdbPath: string,
  fsCollection: string,
  fsDocId: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(fsDb, fsCollection, fsDocId), data);
}

/** Remove a document from Firestore. `rtdbPath` is ignored (kept for API compat). */
export async function dualRemove(
  _rtdbPath: string,
  fsCollection: string,
  fsDocId: string
): Promise<void> {
  await deleteDoc(doc(fsDb, fsCollection, fsDocId));
}

/** Add (auto-ID) a new document to Firestore. `rtdbParentPath` is ignored. Returns the generated Firestore doc ID. */
export async function dualPush(
  _rtdbParentPath: string,
  fsCollectionPath: string,
  data: Record<string, unknown>
): Promise<string> {
  const segments = fsCollectionPath.split('/');
  const colRef = collection(fsDb, ...segments);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

// ─── Read helpers ───────────────────────────────────────────────────────────

/** Read a single document from Firestore. Returns { exists, data, id }. */
export async function dualGetSingle(
  _rtdbPath: string,
  fsCollection: string,
  fsDocId: string
): Promise<{ exists: boolean; data: Record<string, unknown> | null; id: string }> {
  const docSnap = await getDoc(doc(fsDb, fsCollection, fsDocId));
  if (docSnap.exists()) {
    return { exists: true, data: docSnap.data() as Record<string, unknown>, id: docSnap.id };
  }
  return { exists: false, data: null, id: fsDocId };
}

/** Read a full collection from Firestore — returns array of {id, data} objects. */
export async function dualGetCollection(
  _rtdbPath: string,
  fsCollection: string,
  constraints?: Array<unknown>
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const segments = fsCollection.split('/');
  const colRef = collection(fsDb, ...segments);
  const q = constraints ? fsQuery(colRef, ...(constraints as any[])) : colRef;
  const querySnap = await getDocs(q);
  return querySnap.docs.map(d => ({ id: d.id, data: d.data() as Record<string, unknown> }));
}

// ─── Firestore query helpers ────────────────────────────────────────────────

export function firestoreCollection(path: string) {
  const segments = path.split('/');
  return collection(fsDb, ...segments);
}

export function firestoreDoc(colPath: string, docId: string) {
  const segments = colPath.split('/');
  return doc(fsDb, ...segments, docId);
}

export { fsQuery, where, orderBy, fsLimit, getDocs, getDoc, setDoc, updateDoc, deleteDoc, addDoc };
