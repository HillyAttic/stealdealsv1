// PASS 1 vs PASS 2 over identical routes.
// If pass 2 is fast -> the cost was dev-server compile (one-time, not the user's complaint).
// If pass 2 is still slow -> per-navigation runtime cost (the real bug).
// Also: how long the full-screen AdminLayout skeleton stays up after each click.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const HOPS = ['/admin/vacant', '/admin/plots', '/admin/vacant', '/admin/plots'];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  const authCalls = [];
  page.on('request', r => {
    if (r.url().includes('/api/auth/verify-permissions')) authCalls.push(Date.now());
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });

  // warm the two routes once so compile cost is paid before we measure
  for (const h of ['/admin/vacant', '/admin/plots']) {
    await page.click(`a[href="${h}"]`);
    await page.waitForURL(`**${h}`, { timeout: 90000 });
    await page.waitForTimeout(1500);
  }

  console.log('── measured hops (routes already warm) ──');
  for (const href of HOPS) {
    const before = authCalls.length;
    const t0 = Date.now();

    await page.click(`a[href="${href}"]`);

    // when did real content replace the skeleton?
    let skeletonGoneAt = null;
    for (let i = 0; i < 400; i++) {
      const skeletons = await page.locator('.admin-skeleton').count();
      const spinner = await page.getByText('Loading admin panel...').count();
      if (skeletons === 0 && spinner === 0) { skeletonGoneAt = Date.now() - t0; break; }
      await page.waitForTimeout(25);
    }
    await page.waitForLoadState('networkidle').catch(() => {});
    const settled = Date.now() - t0;

    console.log(
      `${href.padEnd(15)} skeleton-gone=${String(skeletonGoneAt).padStart(6)}ms  ` +
      `settled=${String(settled).padStart(6)}ms  +${authCalls.length - before} auth`
    );
  }

  console.log(`\ntotal auth calls: ${authCalls.length}`);
  await browser.close();
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
