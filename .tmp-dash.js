// Temp: screenshots /admin/dashboard with mocked admin APIs (no credentials needed).
const { chromium } = require('playwright');

const STATS = {
  stats: { preleased: 184, vacant: 96, franchise: 58, plots: 42, total: 380 },
  segmentData: {
    labels: ['F&B', 'Retail', 'Education', 'Fashion', 'Pharmaceutical', 'Sports, Fitness & Entertainment'],
    data: [21, 14, 9, 7, 4, 3],
  },
  franchiseData: {
    labels: ['Education', 'F&B', 'Fashion', 'Pharmaceutical', 'Retail', 'Sports, Fitness & Entertainments'],
    data: [9, 21, 7, 4, 14, 3],
  },
};

const USER = {
  success: true,
  user: {
    email: 'ops@stealdeals.com',
    name: 'Ops',
    role: 'superuser',
    effectivePermissions: {
      pages: { vacant: true, plots: true, franchise: true, preleased: true, dashboard: true, users: true, wishlist: true, analytics: true, migration: true },
      viewOthers: true,
      editOthers: true,
      manageUsers: true,
    },
  },
};

async function mock(page) {
  // Register the catch-all FIRST: Playwright matches the most recently added route first.
  await page.route('**/api/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.route('**/api/admin/dashboard-stats', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(STATS) }));
  await page.route('**/api/auth/check', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }) }));
  await page.route('**/api/auth/verify-permissions', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(USER) }));
}

(async () => {
  const tag = process.argv[2] || 'before';
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const s of [
    { name: 'desktop', width: 1440, height: 1100 },
    { name: 'mobile', width: 390, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[console.${m.type()}]`, m.text().slice(0, 300)); });
    page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
    await mock(page);
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#segmentChart', { timeout: 90000 }).catch(() => console.log('!! dashboard content never appeared'));
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `.tmp-dash/${tag}-${s.name}.png`, fullPage: true });
    if (s.name === 'desktop') {
      console.log('URL:', page.url());
      console.log('h1:', await page.locator('h1').first().textContent().catch(() => 'none'));
    }
    await page.close();
  }
  await browser.close();
  console.log('done', tag);
})();
