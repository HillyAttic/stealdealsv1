// Does the admin data cache actually hit? Counts fetches to the vacant list across
// a vacant -> plots -> vacant round trip. 1 means the cache works; 2+ means it never hits.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const WATCH = '/api/properties?propertyType=Vacant';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  await page.addInitScript(() => {
    window.__apiCalls = [];
    const orig = window.fetch;
    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (url && url.includes('/api/')) window.__apiCalls.push(url);
      return orig.apply(this, args);
    };
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('#email', process.env.ADMIN_EMAIL);
  await page.fill('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin/dashboard', { timeout: 90000 });

  const hits = () => page.evaluate(w => window.__apiCalls.filter(u => u.includes(w)).length, WATCH);

  const hop = async (href) => {
    const before = await hits();
    await page.click(`a[href="${href}"]`);
    await page.waitForURL(`**${href}`, { timeout: 90000 });
    await page.waitForTimeout(1500);
    return (await hits()) - before;
  };

  const a = await hop('/admin/vacant');
  const b = await hop('/admin/plots');
  const c = await hop('/admin/vacant');

  console.log(`/admin/vacant  -> ${WATCH} fetches: ${a}`);
  console.log(`/admin/plots   -> ${WATCH} fetches: ${b}   (other page, expect 0)`);
  console.log(`/admin/vacant  -> ${WATCH} fetches: ${c}   (cached, expect 0)`);
  console.log(`TOTAL: ${await hits()}  — expect 1`);
  await browser.close();
  process.exit((await 0, a === 1 && c === 0) ? 0 : 1);
})().catch(e => { console.error('LOOP ERROR:', e.message); process.exit(2); });
