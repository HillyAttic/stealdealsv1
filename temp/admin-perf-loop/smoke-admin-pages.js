// After moving AdminLayout into a route layout, every admin page must still render
// inside the sidebar chrome — and /admin/login must still render bare.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const PAGES = [
  '/admin/dashboard', '/admin/vacant', '/admin/plots', '/admin/franchise',
  '/admin/Pre-Leased', '/admin/users', '/admin/subusers', '/admin/manage-admins',
  '/admin/wishlist-analytics', '/admin/migrate', '/admin/migrate-images',
  '/admin/test', '/admin/vacant/new', '/admin/plots/new', '/admin/franchise/new',
  '/admin/Pre-Leased/new', '/admin/properties/new',
  '/admin/vacant/edit/PROP_VCNT_001', '/admin/plots/edit/PROP_PLOT_001',
  '/admin/franchise/edit/FR-1', '/admin/Pre-Leased/edit/PROP_PRLS_002',
  '/admin/properties/edit/PROP_PRLS_002', '/admin/users/env-admin-superuser',
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  // /admin/login must NOT be wrapped in the admin chrome
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const loginHasSidebar = await page.locator('aside').count();
  const loginHasBrand = await page.getByText('Admin Panel').count();
  console.log(`/admin/login  sidebar=${loginHasSidebar} brandmark=${loginHasBrand}  (both must be 0)`);

  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });

  let bad = loginHasSidebar !== 0 || loginHasBrand !== 0 ? 1 : 0;

  for (const href of PAGES) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    // Dev compiles each route on demand; wait for the chrome instead of guessing a delay.
    let appeared = true;
    let loaded = true;
    await page.waitForSelector('aside', { timeout: 60000 }).catch(() => { appeared = false; });
    // Data-loading pages show skeletons first; fail only if they never clear.
    await page.waitForFunction(() => document.querySelectorAll('.admin-skeleton').length === 0, { timeout: 45000 })
      .catch(() => { loaded = false; });
    const sidebars = await page.locator('aside').count();
    const skeletons = await page.locator('.admin-skeleton').count();
    const spinner = await page.getByText('Loading admin panel...').count();
    const errored = await page.locator('text=/Application error|Unhandled Runtime Error|__next_error__/').count();
    const ok = appeared && loaded && sidebars === 1 && skeletons === 0 && spinner === 0 && errored === 0;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${href.padEnd(38)} sidebar=${sidebars} skeleton=${skeletons} spinner=${spinner} error=${errored}`);
  }

  console.log(bad === 0 ? '\nALL PAGES OK' : `\n${bad} PROBLEM(S)`);
  await browser.close();
  process.exit(bad === 0 ? 0 : 1);
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
