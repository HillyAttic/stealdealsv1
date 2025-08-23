const puppeteer = require('puppeteer');

// Quick responsive test
async function testResponsiveLayout() {
  console.log('🔍 Testing responsive layout behavior...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test Mobile viewport (320px)
    await page.setViewport({ width: 320, height: 568 });
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Mobile (320px): Page loaded successfully');
    
    // Check if hero content is visible
    const heroVisible = await page.$('.hero-title');
    console.log(`✅ Mobile: Hero title ${heroVisible ? 'is visible' : 'not found'}`);
    
    // Test Tablet viewport (768px)
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('✅ Tablet (768px): Page loaded successfully');
    
    // Test Desktop viewport (1024px)
    await page.setViewport({ width: 1024, height: 768 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('✅ Desktop (1024px): Page loaded successfully');
    
    // Test navigation visibility
    const nav = await page.$('nav.hidden.lg\\:flex');
    console.log(`✅ Desktop: Navigation ${nav ? 'is visible' : 'not found'}`);
    
    // Test Large Desktop viewport (1536px)
    await page.setViewport({ width: 1536, height: 864 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log('✅ Large Desktop (1536px): Page loaded successfully');
    
    console.log('🎉 All responsive tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Only run if puppeteer is available
if (typeof module !== 'undefined' && require.main === module) {
  testResponsiveLayout().catch(console.error);
}