// Test specific plot functionality
const BASE_URL = 'http://localhost:3001';

async function testSpecificPlot() {
  console.log('🧪 Testing specific plot functionality...\n');
  
  try {
    // Get all plots first
    console.log('1️⃣ Getting plots list...');
    const plotsResponse = await fetch(`${BASE_URL}/api/plots`);
    const plotsData = await plotsResponse.json();
    
    if (plotsResponse.ok && plotsData.plots && plotsData.plots.length > 0) {
      const firstPlot = plotsData.plots[0];
      console.log(`✅ Found plot: ${firstPlot.project} (ID: ${firstPlot.id})`);
      
      // Test getting specific plot
      console.log('\n2️⃣ Testing GET specific plot...');
      const plotResponse = await fetch(`${BASE_URL}/api/plots/${firstPlot.id}`);
      const plotData = await plotResponse.json();
      
      if (plotResponse.ok) {
        console.log('✅ GET specific plot successful');
        console.log(`📋 Project: ${plotData.plot.project}`);
        console.log(`🏢 Developer: ${plotData.plot.developerName}`);
        console.log(`📍 Location: ${plotData.plot.location}`);
        console.log(`📏 Size: ${plotData.plot.plotSize?.min}-${plotData.plot.plotSize?.max} ${plotData.plot.plotSize?.unit}`);
        console.log(`💰 Investment: ₹${plotData.plot.investmentStartsFrom?.amount} per ${plotData.plot.investmentStartsFrom?.unit}`);
      } else {
        console.log('❌ GET specific plot failed:', plotData.error);
      }
      
      // Test edit page accessibility
      console.log('\n3️⃣ Testing edit page accessibility...');
      const editResponse = await fetch(`${BASE_URL}/admin/plots/edit/${firstPlot.id}`);
      
      if (editResponse.ok) {
        console.log('✅ Edit page accessible');
      } else {
        console.log('⚠️ Edit page returned status:', editResponse.status);
      }
      
    } else {
      console.log('❌ No plots found for testing');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSpecificPlot();