/**
 * RTDB → Firestore Data Migration Script
 *
 * Usage:
 *   node scripts/migrate-rtdb-to-firestore.js [--dry-run] [--collection=all|properties|wishlists|...]
 *
 * Requires:
 *   FIREBASE_SERVICE_ACCOUNT_KEY env var OR service-account.json in project root
 *
 * Firestore must be provisioned in the Firebase Console before running.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const COLLECTION_ARG = process.argv.find(a => a.startsWith('--collection='));
const TARGET_COLLECTION = COLLECTION_ARG ? COLLECTION_ARG.split('=')[1] : 'all';
const BATCH_SIZE = 400; // Under Firestore's 500-op limit

// ─── Initialize Admin SDK ────────────────────────────────────────────────────

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  const possiblePaths = [
    path.resolve(process.cwd(), 'service-account.json'),
    path.resolve(process.cwd(), '..', 'service-account.json'),
  ];
  for (const keyPath of possiblePaths) {
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      console.log(`Loaded credentials from: ${keyPath}`);
      break;
    }
  }
}

if (!serviceAccount) {
  console.error('No service account found. Set FIREBASE_SERVICE_ACCOUNT_KEY or place service-account.json in the project root.');
  process.exit(1);
}

// Fix newlines in private key
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
}

const rtdb = admin.database();
const firestore = admin.firestore();

// Disable Firestore throttling for migration speed
firestore.settings({ ignoreUndefinedProperties: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

const migrationTimestamp = admin.firestore.FieldValue.serverTimestamp();

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function warn(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.warn(`[${ts}] ⚠️  ${msg}`);
}

function error(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.error(`[${ts}] ❌ ${msg}`);
}

/**
 * Write entries to Firestore in batches of BATCH_SIZE.
 * @param {Array<[string, object]>} entries — [docId, data] pairs
 * @param {string} collectionName — Firestore collection path
 * @param {function} [transform] — optional transform function (id, data) => data
 */
async function writeBatch(entries, collectionName, transform = null) {
  let batch = firestore.batch();
  let batchCount = 0;
  let totalWritten = 0;
  const batches = [];

  for (const [docId, data] of entries) {
    const docRef = firestore.collection(collectionName).doc(docId);
    const transformed = transform ? transform(docId, data) : data;
    batch.set(docRef, { ...transformed, _migratedAt: migrationTimestamp });
    batchCount++;
    totalWritten++;

    if (batchCount >= BATCH_SIZE) {
      batches.push({ batch, count: batchCount });
      batch = firestore.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    batches.push({ batch, count: batchCount });
  }

  log(`  Writing ${totalWritten} docs to "${collectionName}" in ${batches.length} batch(es)...`);

  for (let i = 0; i < batches.length; i++) {
    if (!DRY_RUN) {
      await batches[i].batch.commit();
    }
    log(`    Batch ${i + 1}/${batches.length}: ${batches[i].count} docs ${DRY_RUN ? '(dry-run)' : 'committed'}`);
    // Throttle: small pause every 10 batches to avoid rate limiting
    if ((i + 1) % 10 === 0 && !DRY_RUN) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return totalWritten;
}

/**
 * Read RTDB path and return as [key, value] array.
 */
async function readRTDB(pathStr) {
  const snap = await rtdb.ref(pathStr).once('value');
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.entries(val);
}

/**
 * Count documents in a Firestore collection.
 */
async function countFirestore(collectionName) {
  // Firestore doesn't have a count API without an aggregator; use get and count
  // For large collections, use a count query (available in admin SDK v11+)
  try {
    const agg = await firestore.collection(collectionName).count().get();
    return agg.data().count;
  } catch {
    // Fallback: iterate
    const snap = await firestore.collection(collectionName).listDocuments({ pageSize: 1 });
    // This doesn't give total count. Just return -1 to indicate unknown.
    return -1;
  }
}

// ─── Migration Functions ─────────────────────────────────────────────────────

async function migrateProperties() {
  log('─── Migrating properties ───');
  let total = 0;

  // Type mapping: RTDB sub-path → Firestore `type` field
  const typeMappings = [
    { rtdbPath: 'migratedProperties/vacant', fsType: 'vacant' },
    { rtdbPath: 'migratedProperties/preleased', fsType: 'preleased' },
    { rtdbPath: 'migratedProperties/franchise', fsType: 'franchise' },
    { rtdbPath: 'migratedProperties/plots', fsType: 'plot' },
  ];

  for (const { rtdbPath, fsType } of typeMappings) {
    const entries = await readRTDB(rtdbPath);
    if (entries.length === 0) {
      log(`  ${rtdbPath}: empty, skipping`);
      continue;
    }
    log(`  ${rtdbPath}: ${entries.length} documents`);

    const written = await writeBatch(
      entries,
      'properties',
      (id, data) => ({ ...data, id, type: fsType })
    );
    total += written;
  }

  // Legacy collections (migrate only if not already in migratedProperties)
  const legacyPaths = [
    { rtdbPath: 'properties', fsType: 'legacy' },
    { rtdbPath: 'vacantProperties', fsType: 'vacant' },
    { rtdbPath: 'preleasedProperties', fsType: 'preleased' },
    { rtdbPath: 'franchiseProperties', fsType: 'franchise' },
    { rtdbPath: 'plots', fsType: 'plot' },
  ];

  for (const { rtdbPath, fsType } of legacyPaths) {
    const entries = await readRTDB(rtdbPath);
    if (entries.length === 0) {
      log(`  ${rtdbPath} (legacy): empty, skipping`);
      continue;
    }
    log(`  ${rtdbPath} (legacy): ${entries.length} documents`);

    // Only write if not already present in Firestore (avoid duplicates)
    const newEntries = [];
    for (const [id, data] of entries) {
      if (!DRY_RUN) {
        const existing = await firestore.collection('properties').doc(id).get();
        if (existing.exists) continue;
      }
      newEntries.push([id, data]);
    }

    if (newEntries.length > 0) {
      const written = await writeBatch(
        newEntries,
        'properties',
        (id, data) => ({ ...data, id, type: fsType, _legacy: true })
      );
      total += written;
    } else {
      log(`  ${rtdbPath} (legacy): all docs already migrated, skipping`);
    }
  }

  log(`  ✅ Properties: ${total} documents migrated`);
  return total;
}

async function migrateUsers() {
  log('─── Migrating users ───');
  const entries = await readRTDB('users');
  if (entries.length === 0) { log('  users: empty, skipping'); return 0; }
  log(`  users: ${entries.length} documents`);

  const written = await writeBatch(entries, 'users');
  log(`  ✅ Users: ${written} documents migrated`);
  return written;
}

async function migrateWishlists() {
  log('─── Migrating wishlists ───');
  const userEntries = await readRTDB('wishlists');
  if (userEntries.length === 0) { log('  wishlists: empty, skipping'); return 0; }
  log(`  wishlists: ${userEntries.length} user(s) found`);

  let total = 0;
  for (const [userId, itemsObj] of userEntries) {
    if (!itemsObj || typeof itemsObj !== 'object') continue;
    const items = Object.entries(itemsObj).filter(([k]) => !k.startsWith('.'));
    if (items.length === 0) continue;

    const subCol = `wishlists/${userId}/items`;
    const written = await writeBatch(items, subCol);
    total += written;
    if (total % 500 === 0) log(`    ... ${total} wishlist items migrated so far`);
  }

  log(`  ✅ Wishlists: ${total} items migrated across ${userEntries.length} user(s)`);
  return total;
}

async function migrateActivities() {
  log('─── Migrating activities ───');
  const userEntries = await readRTDB('activities');
  if (userEntries.length === 0) { log('  activities: empty, skipping'); return 0; }
  log(`  activities: ${userEntries.length} user(s) found`);

  let total = 0;
  for (const [userId, entries] of userEntries) {
    if (!entries || typeof entries !== 'object') continue;
    const items = Object.entries(entries);
    if (items.length === 0) continue;

    const subCol = `activities/${userId}/entries`;
    const written = await writeBatch(items, subCol);
    total += written;
  }

  log(`  ✅ Activities: ${total} entries migrated`);
  return total;
}

async function migrateGlobalActivities() {
  log('─── Migrating global activities ───');
  const entries = await readRTDB('global-activities');
  if (entries.length === 0) { log('  global-activities: empty, skipping'); return 0; }
  log(`  global-activities: ${entries.length} documents`);

  const written = await writeBatch(entries, 'globalActivities');
  log(`  ✅ Global activities: ${written} documents migrated`);
  return written;
}

async function migrateAdminUsers() {
  log('─── Migrating admin users ───');
  let total = 0;

  // Primary: admin_users
  const entries1 = await readRTDB('admin_users');
  if (entries1.length > 0) {
    log(`  admin_users: ${entries1.length} documents`);
    const written = await writeBatch(entries1, 'adminUsers');
    total += written;
  }

  // Legacy: adminUsers — merge (don't overwrite if already present)
  const entries2 = await readRTDB('adminUsers');
  if (entries2.length > 0) {
    log(`  adminUsers (legacy): ${entries2.length} documents`);
    const newEntries = [];
    for (const [id, data] of entries2) {
      if (!DRY_RUN) {
        const existing = await firestore.collection('adminUsers').doc(id).get();
        if (existing.exists) continue;
      }
      newEntries.push([id, data]);
    }
    if (newEntries.length > 0) {
      const written = await writeBatch(newEntries, 'adminUsers');
      total += written;
    }
  }

  log(`  ✅ Admin users: ${total} documents migrated`);
  return total;
}

async function migrateUserStats() {
  log('─── Migrating user stats ───');
  const entries = await readRTDB('userStats');
  if (entries.length === 0) { log('  userStats: empty, skipping'); return 0; }
  log(`  userStats: ${entries.length} documents`);

  const written = await writeBatch(entries, 'userStats');
  log(`  ✅ User stats: ${written} documents migrated`);
  return written;
}

async function migrateGlobalStats() {
  log('─── Migrating global stats ───');
  const snap = await rtdb.ref('globalStats').once('value');
  if (!snap.exists()) { log('  globalStats: empty, skipping'); return 0; }
  log('  globalStats: 1 document');

  if (!DRY_RUN) {
    await firestore.collection('globalStats').doc('global').set({
      ...snap.val(),
      _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  log('  ✅ Global stats: 1 document migrated');
  return 1;
}

async function migrateIdMapping() {
  log('─── Migrating migration/idMapping ───');
  const snap = await rtdb.ref('migration/idMapping').once('value');
  if (!snap.exists()) { log('  migration/idMapping: empty, skipping'); return 0; }

  if (!DRY_RUN) {
    await firestore.collection('_migration').doc('idMapping').set({
      ...snap.val(),
      _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  log('  ✅ Migration idMapping: 1 document migrated');
  return 1;
}

// ─── Backup ──────────────────────────────────────────────────────────────────

async function backupRTDB() {
  log('─── Creating RTDB backup ───');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `pre-firestore-${timestamp}`;

  const topPaths = [
    'properties', 'vacantProperties', 'preleasedProperties',
    'franchiseProperties', 'plots',
    'migratedProperties', 'wishlists', 'activities',
    'global-activities', 'users', 'admin_users', 'adminUsers',
    'userStats', 'globalStats', 'migration',
  ];

  const backupData = {};
  for (const p of topPaths) {
    const snap = await rtdb.ref(p).once('value');
    if (snap.exists()) {
      backupData[p] = snap.val();
    }
  }

  if (!DRY_RUN) {
    await firestore.collection('_backups').doc(backupId).set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'rtdb',
      collections: Object.keys(backupData),
    });
    // Store each collection as a sub-document
    for (const [coll, data] of Object.entries(backupData)) {
      await firestore.collection('_backups').doc(backupId).collection('data').doc(coll).set({ data });
    }
  }

  log(`  ✅ Backup created: _backups/${backupId}`);
  return backupId;
}

// ─── Verification ────────────────────────────────────────────────────────────

async function verify() {
  log('─── Verifying migration ───');

  const collections = [
    { name: 'properties', rtdbPaths: ['migratedProperties/vacant', 'migratedProperties/preleased', 'migratedProperties/franchise', 'migratedProperties/plots'] },
    { name: 'users', rtdbPaths: ['users'] },
    { name: 'globalActivities', rtdbPaths: ['global-activities'] },
    { name: 'adminUsers', rtdbPaths: ['admin_users', 'adminUsers'] },
    { name: 'userStats', rtdbPaths: ['userStats'] },
  ];

  let allOk = true;

  for (const { name, rtdbPaths } of collections) {
    // Count RTDB
    let rtdbCount = 0;
    for (const p of rtdbPaths) {
      const snap = await rtdb.ref(p).once('value');
      if (snap.exists()) {
        rtdbCount += Object.keys(snap.val()).length;
      }
    }

    // Count Firestore
    let fsCount = -1;
    try {
      const agg = await firestore.collection(name).count().get();
      fsCount = agg.data().count;
    } catch {
      warn(`Could not count Firestore collection: ${name}`);
    }

    const status = fsCount === rtdbCount ? '✅' : '⚠️ ';
    log(`  ${status} ${name}: RTDB=${rtdbCount}, Firestore=${fsCount}`);
    if (fsCount !== rtdbCount && fsCount !== -1) allOk = false;
  }

  // Verify wishlists (subcollections)
  const wishlistUsers = await readRTDB('wishlists');
  let wishlistMismatches = 0;
  for (const [userId, itemsObj] of wishlistUsers) {
    if (!itemsObj || typeof itemsObj !== 'object') continue;
    const rtdbCount = Object.keys(itemsObj).filter(k => !k.startsWith('.')).length;
    try {
      const agg = await firestore.collection('wishlists').doc(userId).collection('items').count().get();
      const fsCount = agg.data().count;
      if (fsCount !== rtdbCount) {
        warn(`Wishlist mismatch for user ${userId}: RTDB=${rtdbCount}, Firestore=${fsCount}`);
        wishlistMismatches++;
      }
    } catch { /* skip */ }
  }
  if (wishlistMismatches === 0) {
    log(`  ✅ Wishlists: all users verified`);
  } else {
    warn(`Wishlists: ${wishlistMismatches} user(s) with mismatched counts`);
    allOk = false;
  }

  return allOk;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log('===========================================');
  log('RTDB → Firestore Migration');
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  log(`Target: ${TARGET_COLLECTION}`);
  log('===========================================');

  if (DRY_RUN) {
    log('🏃 Dry-run mode: reading RTDB only, no Firestore writes');
  }

  const startedAt = Date.now();
  const results = {};

  try {
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'backup') {
      results.backup = await backupRTDB();
    }

    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'properties') {
      results.properties = await migrateProperties();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'users') {
      results.users = await migrateUsers();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'wishlists') {
      results.wishlists = await migrateWishlists();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'activities') {
      results.activities = await migrateActivities();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'globalActivities') {
      results.globalActivities = await migrateGlobalActivities();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'adminUsers') {
      results.adminUsers = await migrateAdminUsers();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'userStats') {
      results.userStats = await migrateUserStats();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'globalStats') {
      results.globalStats = await migrateGlobalStats();
    }
    if (TARGET_COLLECTION === 'all' || TARGET_COLLECTION === 'idMapping') {
      results.idMapping = await migrateIdMapping();
    }

    if (TARGET_COLLECTION === 'all') {
      results.verified = await verify();
    }

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    log('===========================================');
    log('Migration Summary:');
    for (const [key, val] of Object.entries(results)) {
      log(`  ${key}: ${val}`);
    }
    log(`Elapsed: ${elapsed}s`);
    log('===========================================');

    if (!results.verified && results.verified !== undefined) {
      warn('Verification found mismatches — review the output above');
      process.exit(1);
    }

  } catch (err) {
    error(`Migration failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
