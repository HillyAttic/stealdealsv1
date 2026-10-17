// Ground truth: hook window.fetch and count every call to /api/auth/verify-permissions.
// Network-layer counting is ambiguous (browser cache, Playwright event timing) — this is not.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const HOPS = ['/admin/vacant', '/admin/plots', '/admin/vacant'];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  // record every verify-permissions fetch BEFORE any app code runs
  await page.addInitScript(() => {
    window.__authFetches = [];
    const orig = window.fetch;
    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (url && url.includes('/api/auth/verify-permissions')) {
        window.__authFetches.push({ url, t: Date.now() });
      }
      return orig.apply(this, args);
    };
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });

  const count = () => page.evaluate(() => window.__authFetches.length);

  // warm both routes
  for (const h of ['/admin/vacant', '/admin/plots']) {
    await page.click(`a[href="${h}"]`);
    await page.waitForURL(`**${h}`, { timeout: 90000 });
    await page.waitForTimeout(1200);
  }
  console.log(`after warm-up: ${await count()} verify-permissions fetch(es)\n`);

  console.log('── measured hops ──');
  for (const href of HOPS) {
    const before = await count();
    const t0 = Date.now();
    await page.click(`a[href="${href}"]`);
    await page.waitForURL(`**${href}`, { timeout: 90000 });

    // wait for skeleton to clear
    let gone = null;
    for (let i = 0; i < 400; i++) {
      const s = await page.locator('.admin-skeleton').count();
      const sp = await page.getByText('Loading admin panel...').count();
      if (s === 0 && sp === 0) { gone = Date.now() - t0; break; }
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(800); // let effects settle
    const after = await count();
    console.log(`${href.padEnd(15)} content@${String(gone).padStart(5)}ms  authFetches +${after - before}`);
  }

  console.log(`\nTOTAL verify-permissions fetches this session: ${await count()}`);
  console.log('If AdminLayout persisted across navigations, this would be 1.');
  await browser.close();
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
