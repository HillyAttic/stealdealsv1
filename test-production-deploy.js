// Test production deployment
const BASE_URL = 'https://stealdeals-p2kkiysv7-hillyattics-projects.vercel.app';

async function testProductionDeployment() {
  console.log('🧪 Testing production deployment...\n');
  console.log(`🌍 Testing URL: ${BASE_URL}\n`);
  
  try {
    // Test 1: Homepage
    console.log('1️⃣ Testing homepage...');
    const homeResponse = await fetch(`${BASE_URL}/`);
    console.log(`✅ Homepage: ${homeResponse.ok ? 'accessible' : 'error ' + homeResponse.status}`);
    
    // Test 2: Plots API
    console.log('\n2️⃣ Testing plots API...');
    const plotsResponse = await fetch(`${BASE_URL}/api/plots`);
    if (plotsResponse.ok) {
      const plotsData = await plotsResponse.json();
      console.log(`✅ Plots API working: ${plotsData.plots?.length || 0} plots found`);
      
      if (plotsData.plots?.length > 0) {
        const firstPlot = plotsData.plots[0];
        console.log(`📋 First plot: "${firstPlot.project}" (ID: ${firstPlot.id})`);
        
        // Test specific plot API
        console.log('\n3️⃣ Testing specific plot API...');
        const specificResponse = await fetch(`${BASE_URL}/api/plots/${firstPlot.id}`);
        console.log(`✅ Specific plot API: ${specificResponse.ok ? 'working' : 'error ' + specificResponse.status}`);
      }
    } else {
      console.log('❌ Plots API failed with status:', plotsResponse.status);
    }
    
    // Test 3: Frontend plots page
    console.log('\n4️⃣ Testing frontend plots page...');
    const frontendResponse = await fetch(`${BASE_URL}/plots`);
    console.log(`✅ Frontend plots page: ${frontendResponse.ok ? 'accessible' : 'error ' + frontendResponse.status}`);
    
    // Test 4: Admin plots page
    console.log('\n5️⃣ Testing admin plots page...');
    const adminResponse = await fetch(`${BASE_URL}/admin/plots`);
    console.log(`✅ Admin plots page: ${adminResponse.ok ? 'accessible' : 'error ' + adminResponse.status}`);
    
    // Test 5: Edit page (without auth, should redirect or show error)
    console.log('\n6️⃣ Testing edit page (without auth)...');
    const editResponse = await fetch(`${BASE_URL}/admin/plots/edit/1`);
    console.log(`✅ Edit page response: ${editResponse.status} (expected: 401/403 or redirect)`);
    
    // Test 6: New plot page (without auth)
    console.log('\n7️⃣ Testing new plot page (without auth)...');
    const newResponse = await fetch(`${BASE_URL}/admin/plots/new`);
    console.log(`✅ New plot page response: ${newResponse.status} (expected: 401/403 or redirect)`);
    
    console.log('\n🎉 Production deployment test completed!');
    console.log('\n📋 Manual testing checklist:');
    console.log('□ Visit the homepage and check if it loads properly');
    console.log('□ Go to /plots page and verify plot cards display correctly');
    console.log('□ Try opening a plot modal by clicking on a plot card');
    console.log('□ Navigate to /admin/plots (may require authentication)');
    console.log('□ Test edit functionality in admin panel');
    console.log('□ Verify ReactQuill editor loads without errors');
    console.log('\n🔗 Production URLs:');
    console.log(`Homepage: ${BASE_URL}`);
    console.log(`Plots: ${BASE_URL}/plots`);
    console.log(`Admin: ${BASE_URL}/admin/plots`);
    console.log(`Edit: ${BASE_URL}/admin/plots/edit/1`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testProductionDeployment();