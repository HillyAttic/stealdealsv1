// Verifies /api/admin/dashboard-stats still reports the same aggregates as before the
// rewrite (vacant 121, preleased 44, franchise 181, plots 1, total 347) and that the
// breakdown buckets are intact.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });

  const body = await page.evaluate(async () => {
    const r = await fetch('/api/admin/dashboard-stats', { credentials: 'include' });
    return { status: r.status, json: await r.json() };
  });

  console.log('status:', body.status);
  console.log('stats:', JSON.stringify(body.json.stats));
  console.log('segments:', body.json.segmentData?.labels?.length, 'buckets, top:', body.json.segmentData?.labels?.[0], '=', body.json.segmentData?.data?.[0]);
  console.log('industries:', JSON.stringify(body.json.franchiseData));

  const s = body.json.stats || {};
  const ok = body.status === 200 && s.vacant === 121 && s.preleased === 44 && s.franchise === 181 && s.plots === 1 && s.total === 347;
  console.log(ok ? 'MATCHES baseline' : 'MISMATCH vs baseline (121/44/181/1/347)');
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
