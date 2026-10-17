// Read-only: how big is the properties collection, and would count-aggregations
// change the dashboard numbers? Run: node temp/admin-perf-loop/measure-properties.js
const fs = require('fs');
const admin = require('firebase-admin');

const raw = fs.readFileSync('.env.local', 'utf8');
const line = raw.split(/\r?\n/).find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
if (!line) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
let val = line.slice('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();
if (val.startsWith('"') || val.startsWith("'")) val = JSON.parse(val);
const sa = JSON.parse(val);

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const NEEDED = ['type', 'propertyType', 'category', 'segment', 'franchiseDetails', 'vacantDetails', 'preleasedDetails', 'plotDetails'];

(async () => {
  const snap = await db.collection('properties').get();
  const byType = {};
  let totalBytes = 0;
  let neededBytes = 0;
  const divergences = [];

  snap.forEach(d => {
    const data = d.data();
    const json = JSON.stringify(data);
    totalBytes += Buffer.byteLength(json);
    const picked = {};
    for (const k of NEEDED) if (data[k] !== undefined) picked[k] = data[k];
    neededBytes += Buffer.byteLength(JSON.stringify(picked));

    const t = (data.type || '').toLowerCase();
    byType[t] = (byType[t] || 0) + 1;

    // The dashboard loop reads propertyType from the *flattened* doc, which for
    // vacant/preleased comes from the nested details object when present.
    if (t === 'vacant' && data.vacantDetails?.propertyType && data.vacantDetails.propertyType !== 'Vacant') {
      divergences.push({ id: d.id, type: t, detailsPropertyType: data.vacantDetails.propertyType });
    }
    if (t === 'preleased' && data.preleasedDetails?.propertyType && data.preleasedDetails.propertyType !== 'Pre-Leased') {
      divergences.push({ id: d.id, type: t, detailsPropertyType: data.preleasedDetails.propertyType });
    }
  });

  console.log('docs:', snap.size);
  console.log('by type field:', byType);
  console.log('bytes: full=' + (totalBytes / 1024).toFixed(0) + 'KB  needed-fields-only=' + (neededBytes / 1024).toFixed(0) + 'KB');
  console.log('docs whose flattened propertyType would diverge from `type`:', divergences.length);
  if (divergences.length) console.log(JSON.stringify(divergences.slice(0, 10), null, 2));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
