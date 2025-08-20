// Test script for plots functionality
const BASE_URL = 'http://localhost:3001';

async function testPlotsAPI() {
  console.log('🧪 Testing Plots API functionality...\n');
  
  try {
    // Test 1: Get all plots
    console.log('1️⃣ Testing GET /api/plots...');
    const plotsResponse = await fetch(`${BASE_URL}/api/plots`);
    const plotsData = await plotsResponse.json();
    
    if (plotsResponse.ok) {
      console.log('✅ GET plots successful');
      console.log(`📊 Found ${plotsData.plots?.length || 0} plots`);
      
      if (plotsData.plots && plotsData.plots.length > 0) {
        const firstPlot = plotsData.plots[0];
        console.log(`🏗️ First plot: ${firstPlot.project} by ${firstPlot.developerName}`);
        
        // Test 2: Get specific plot by ID
        if (firstPlot.id) {
          console.log('\n2️⃣ Testing GET /api/plots/:id...');
          const plotResponse = await fetch(`${BASE_URL}/api/plots/${firstPlot.id}`);
          const plotData = await plotResponse.json();
          
          if (plotResponse.ok) {
            console.log('✅ GET specific plot successful');
            console.log(`📋 Plot details: ${plotData.plot.project}`);
          } else {
            console.log('❌ GET specific plot failed:', plotData.error);
          }
        }
      }
    } else {
      console.log('❌ GET plots failed:', plotsData.error);
    }
    
    // Test 3: Check admin plots page accessibility
    console.log('\n3️⃣ Testing admin plots page accessibility...');
    const adminResponse = await fetch(`${BASE_URL}/admin/plots`);
    
    if (adminResponse.ok) {
      console.log('✅ Admin plots page accessible');
    } else {
      console.log('⚠️  Admin plots page returned status:', adminResponse.status);
    }
    
    // Test 4: Check frontend plots page accessibility
    console.log('\n4️⃣ Testing frontend plots page accessibility...');
    const frontendResponse = await fetch(`${BASE_URL}/plots`);
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend plots page accessible');
    } else {
      console.log('⚠️  Frontend plots page returned status:', frontendResponse.status);
    }
    
    console.log('\n🎉 All basic tests completed!');
    console.log('\n📋 Manual testing checklist:');
    console.log('□ Visit http://localhost:3001/admin/plots');
    console.log('□ Check that plots display with P001, P002, P003 format');
    console.log('□ Test edit button functionality');
    console.log('□ Test delete button functionality');
    console.log('□ Visit http://localhost:3001/plots');
    console.log('□ Check that plot titles are visible');
    console.log('□ Test modal functionality');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testPlotsAPI();