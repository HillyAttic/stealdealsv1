// Time the admin API endpoints from an authenticated browser session.
// Tells us which endpoint is the actual bottleneck, instead of guessing.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const ENDPOINTS = [
  '/api/auth/verify-permissions',
  '/api/admin/dashboard-stats',
  '/api/properties?propertyType=Vacant',
  '/api/plots',
  '/api/franchises',
  '/api/properties?propertyType=Pre-Leased',
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });
  await page.waitForTimeout(2000);

  console.log('── endpoint timings (authenticated, ms) ──');
  for (const ep of ENDPOINTS) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const r = await page.evaluate(async (url) => {
        const t = performance.now();
        const res = await fetch(url, { credentials: 'include' });
        const text = await res.text();
        return { ms: Math.round(performance.now() - t), status: res.status, bytes: text.length };
      }, ep);
      runs.push(r);
    }
    const ms = runs.map(r => r.ms);
    const avg = Math.round(ms.reduce((a, b) => a + b, 0) / ms.length);
    console.log(
      `${ep.padEnd(38)} avg=${String(avg).padStart(5)}ms  ` +
      `runs=[${ms.join(', ')}]  status=${runs[0].status}  payload=${(runs[0].bytes / 1024).toFixed(1)}KB`
    );
  }

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(2); });
