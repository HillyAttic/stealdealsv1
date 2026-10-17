// RED-CAPABLE LOOP: count /api/auth/verify-permissions round-trips per admin navigation.
// Baseline expectation if AdminLayout remounts on every nav: 1 call per page visited.
// Green (layout persists): exactly 1 call total, for the whole session.
//
// Run: node temp/admin-perf-loop/loop.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const HOP = ['/admin/dashboard', '/admin/vacant', '/admin/plots'];

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD missing from .env.local');

  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  const authCalls = [];
  page.on('request', r => {
    if (r.url().includes('/api/auth/verify-permissions')) authCalls.push(Date.now());
  });

  // ── login ──
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  const afterLogin = authCalls.length;
  console.log(`after login -> ${afterLogin} auth call(s)`);

  // ── navigate the sidebar ──
  const timings = [];
  for (const href of HOP) {
    const before = authCalls.length;
    const t0 = Date.now();

    await page.click(`a[href="${href}"]`);
    // "settled" = the page's own content is on screen and network has gone quiet
    await page.waitForURL(`**${href}`, { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    const ms = Date.now() - t0;
    const newCalls = authCalls.length - before;
    timings.push({ href, ms, newCalls });
    console.log(`nav ${href} -> ${ms}ms, +${newCalls} auth call(s)`);
  }

  console.log('\n─── RESULT ───');
  console.log(`total auth calls this session: ${authCalls.length}`);
  console.log(`expected if layout persists:   1`);
  for (const t of timings) console.log(`  ${t.href}: ${t.ms}ms, +${t.newCalls} auth`);

  const total = authCalls.length;
  const verdict = total > 1 ? 'RED — AdminLayout re-authenticates per navigation' : 'GREEN — layout persists';
  console.log(`\nVERDICT: ${verdict}`);

  await browser.close();
  process.exit(total > 1 ? 1 : 0);
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
