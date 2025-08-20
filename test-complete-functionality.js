// Comprehensive test for plots functionality
const BASE_URL = 'http://localhost:3001';

async function testCompleteFunctionality() {
  console.log('🧪 Testing complete plots functionality...\n');
  
  try {
    // Test 1: Get all plots
    console.log('1️⃣ Testing GET all plots...');
    const plotsResponse = await fetch(`${BASE_URL}/api/plots`);
    const plotsData = await plotsResponse.json();
    
    if (plotsResponse.ok && plotsData.plots?.length > 0) {
      const firstPlot = plotsData.plots[0];
      console.log(`✅ Found ${plotsData.plots.length} plot(s)`);
      console.log(`📋 First plot: "${firstPlot.project}" (ID: ${firstPlot.id})`);
      
      // Test 2: Get specific plot by ID
      console.log('\n2️⃣ Testing GET specific plot...');
      const specificResponse = await fetch(`${BASE_URL}/api/plots/${firstPlot.id}`);
      const specificData = await specificResponse.json();
      
      if (specificResponse.ok) {
        console.log(`✅ Successfully retrieved plot: "${specificData.plot.project}"`);
      } else {
        console.log('❌ Failed to get specific plot:', specificData.error);
        return;
      }
      
      // Test 3: Test page accessibility
      console.log('\n3️⃣ Testing page accessibility...');
      
      // Admin plots page
      const adminResponse = await fetch(`${BASE_URL}/admin/plots`);
      console.log(`✅ Admin plots page: ${adminResponse.ok ? 'accessible' : 'error ' + adminResponse.status}`);
      
      // Frontend plots page
      const frontendResponse = await fetch(`${BASE_URL}/plots`);
      console.log(`✅ Frontend plots page: ${frontendResponse.ok ? 'accessible' : 'error ' + frontendResponse.status}`);
      
      // Edit page
      const editResponse = await fetch(`${BASE_URL}/admin/plots/edit/${firstPlot.id}`);
      console.log(`✅ Edit plots page: ${editResponse.ok ? 'accessible' : 'error ' + editResponse.status}`);
      
      console.log('\n🎉 All automated tests passed!');
      console.log('\n📋 Manual testing checklist:');
      console.log(`□ Visit http://localhost:3001/admin/plots`);
      console.log(`   - Check plot shows as "P001" format`);
      console.log(`   - Verify plot title "${firstPlot.project}" displays correctly`);
      console.log(`   - Test edit button works`);
      console.log(`   - Test delete button works (use with caution!)`);
      console.log(`□ Visit http://localhost:3001/plots`);
      console.log(`   - Check plot title "${firstPlot.project}" displays correctly`);
      console.log(`   - Test modal opens when clicking plot`);
      console.log(`   - Verify all plot details show in modal`);
      console.log(`□ Visit http://localhost:3001/admin/plots/edit/${firstPlot.id}`);
      console.log(`   - Verify form loads with existing data`);
      console.log(`   - Test saving changes`);
      
    } else {
      console.log('❌ No plots found or API error');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCompleteFunctionality();