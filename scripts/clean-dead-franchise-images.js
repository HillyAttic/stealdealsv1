/**
 * Blank out franchise image URLs whose host no longer serves them.
 *
 * Dead hosts (e.g. obaiandhill.com, which fails TLS) make every card render an
 * image request that hangs until timeout. Blanking the field lets FranchiseCard
 * fall back to its default image.
 *
 * Usage:
 *   node --env-file=.env.local scripts/clean-dead-franchise-images.js            # dry run
 *   node --env-file=.env.local scripts/clean-dead-franchise-images.js --apply    # write
 */

const admin = require('firebase-admin');

const APPLY = process.argv.includes('--apply');
const TIMEOUT_MS = 8000;

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Run with --env-file=.env.local');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
});
const db = admin.firestore();

// A host is "alive" if it answers at all — 401/403/405/429 mean the server is
// there and just doesn't like our probe. Only 404/410/network/TLS failure is dead.
const ALIVE_STATUS = new Set([401, 403, 405, 429]);

async function isAlive(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return ALIVE_STATUS.has(res.status) || res.ok;
  } catch {
    return false;
  }
}

(async () => {
  const snap = await db.collection('properties').where('type', '==', 'franchise').get();
  console.log(`Scanned ${snap.size} franchises`);

  const urls = new Set();
  const docs = snap.docs.map((d) => {
    const data = d.data();
    const images = Array.isArray(data.images) ? data.images : [];
    // [fieldPath, url] pairs for every image slot this doc uses.
    const fields = [
      ...(typeof data.image === 'string' && data.image ? [['image', data.image]] : []),
      ...images.map((u, i) => (typeof u === 'string' && u ? [`images.${i}`, u] : null)).filter(Boolean),
    ];
    fields.forEach(([, u]) => urls.add(u));
    return { ref: d.ref, id: d.id, name: data.title || data.name || '(unnamed)', images, fields };
  });

  console.log(`Checking ${urls.size} unique URLs...`);
  const dead = new Set();
  await Promise.all(
    [...urls].map(async (u) => {
      if (!(await isAlive(u))) dead.add(u);
    })
  );

  const affected = docs.filter((d) => d.fields.some(([, u]) => dead.has(u)));
  console.log(`\n${affected.length} franchises reference ${dead.size} dead URL(s):\n`);
  dead.forEach((u) => console.log(`  DEAD  ${u}`));
  affected.slice(0, 20).forEach((d) => {
    console.log(`  ${d.id}  ${d.name}`);
    d.fields.filter(([, u]) => dead.has(u)).forEach(([f, u]) => console.log(`      ${f}: ${u}`));
  });
  if (affected.length > 20) console.log(`  ...and ${affected.length - 20} more`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to blank these fields.');
    return;
  }

  for (let i = 0; i < affected.length; i += 400) {
    const batch = db.batch();
    affected.slice(i, i + 400).forEach((d) => {
      const update = {};
      const deadIdx = [];
      d.fields.forEach(([field, u]) => {
        if (!dead.has(u)) return;
        if (field === 'image') update.image = '';
        else deadIdx.push(Number(field.split('.')[1]));
      });
      // Keep the surviving entries; an empty array falls through to the default image.
      if (deadIdx.length) update.images = d.images.filter((_, i) => !deadIdx.includes(i));
      batch.update(d.ref, update);
    });
    await batch.commit();
    console.log(`Committed ${Math.min(400, affected.length - i)} updates`);
  }

  console.log('\nDone.');
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
