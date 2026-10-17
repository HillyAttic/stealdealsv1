// Read-only: does replacing the full-collection scan in /api/admin/dashboard-stats
// with count aggregations + a projected franchise read produce the SAME numbers?
// Run: node temp/admin-perf-loop/compare-dashboard-math.js
const fs = require('fs');
const admin = require('firebase-admin');

const raw = fs.readFileSync('.env.local', 'utf8');
const line = raw.split(/\r?\n/).find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY='));
let val = line.slice('FIREBASE_SERVICE_ACCOUNT_KEY='.length).trim();
if (val.startsWith('"') || val.startsWith("'")) val = JSON.parse(val);
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(val)) });
const db = admin.firestore();

const INDUSTRIES = ['Education', 'F&B', 'Fashion', 'Pharmaceutical', 'Retail', 'Sports, Fitness & Entertainments'];

// ── CURRENT algorithm, replayed on the flattened shape the route actually sees ──
function current(docs) {
  let preleased = 0, vacant = 0, franchise = 0, plots = 0;
  const segmentCounts = {};
  const industryCounts = Object.fromEntries(INDUSTRIES.map(i => [i, 0]));

  for (const { data } of docs) {
    const fd = data.franchiseDetails || {};
    const vd = data.vacantDetails || {};
    const pd = data.preleasedDetails || {};
    const t = (data.type || '').toLowerCase();

    // Replicate flattenPropertyByType's propertyType, which is what the loop reads first.
    let flatPropertyType;
    if (t === 'vacant') flatPropertyType = vd.propertyType || 'Vacant';
    else if (t === 'preleased') flatPropertyType = pd.propertyType || 'Pre-Leased';
    else if (t === 'franchise') flatPropertyType = 'Franchise';
    else if (t === 'plot') flatPropertyType = 'Plot';
    else flatPropertyType = data.propertyType || '';

    const type = (flatPropertyType || data.type || '').toLowerCase();
    const isPreleased = type === 'preleased' || type === 'pre-leased' || type === 'lockable' || type === 'virtual';

    if (isPreleased) preleased++;
    else if (type === 'vacant') vacant++;
    else if (type === 'franchise') {
      franchise++;
      const segment = fd.segment || data.segment || '';
      if (segment) segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
      const industry = fd.industry || 'Franchise'; // flattened category is hardcoded 'Franchise'
      if (Object.prototype.hasOwnProperty.call(industryCounts, industry)) industryCounts[industry]++;
    } else if (type === 'plot' || type === 'plots') plots++;
  }

  const sortedSegments = Object.entries(segmentCounts).sort(([, a], [, b]) => b - a)
    .reduce((acc, [k, v]) => { acc.labels.push(k); acc.data.push(v); return acc; }, { labels: [], data: [] });

  return { stats: { preleased, vacant, franchise, plots, total: preleased + vacant + franchise + plots }, segmentData: sortedSegments, franchiseData: { labels: Object.keys(industryCounts), data: Object.values(industryCounts) } };
}

// ── PROPOSED algorithm: counts by `type` field, breakdowns from a projected read ──
async function proposed() {
  const col = db.collection('properties');
  const [v, p, f, pl] = await Promise.all([
    col.where('type', '==', 'vacant').count().get(),
    col.where('type', '==', 'preleased').count().get(),
    col.where('type', '==', 'franchise').count().get(),
    col.where('type', '==', 'plot').count().get(),
  ]);

  const snap = await col.where('type', '==', 'franchise')
    .select('franchiseDetails', 'segment', 'category').get();

  const segmentCounts = {};
  const industryCounts = Object.fromEntries(INDUSTRIES.map(i => [i, 0]));
  let projectedBytes = 0;

  snap.forEach(d => {
    const data = d.data();
    const fd = data.franchiseDetails || {};
    projectedBytes += Buffer.byteLength(JSON.stringify(data));
    const segment = fd.segment || data.segment || '';
    if (segment) segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
    const industry = fd.industry || data.category || '';
    if (Object.prototype.hasOwnProperty.call(industryCounts, industry)) industryCounts[industry]++;
  });

  const sortedSegments = Object.entries(segmentCounts).sort(([, a], [, b]) => b - a)
    .reduce((acc, [k, v]) => { acc.labels.push(k); acc.data.push(v); return acc; }, { labels: [], data: [] });

  return {
    result: { stats: { preleased: p.data().count, vacant: v.data().count, franchise: f.data().count, plots: pl.data().count, total: v.data().count + p.data().count + f.data().count + pl.data().count }, segmentData: sortedSegments, franchiseData: { labels: Object.keys(industryCounts), data: Object.values(industryCounts) } },
    projectedBytes,
  };
}

(async () => {
  const snap = await db.collection('properties').get();
  const docs = snap.docs.map(d => ({ id: d.id, data: d.data() }));

  const a = current(docs);
  const b = await proposed();

  const same = JSON.stringify(a) === JSON.stringify(b.result);
  console.log('current :', JSON.stringify(a));
  console.log('proposed:', JSON.stringify(b.result));
  console.log('IDENTICAL:', same);
  console.log('franchise projected payload:', (b.projectedBytes / 1024).toFixed(1) + 'KB  (vs 407KB full scan)');
  process.exit(same ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
