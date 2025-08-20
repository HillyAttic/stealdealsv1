// Test plot data structure
const BASE_URL = 'http://localhost:3001';

async function testPlotData() {
  console.log('🧪 Testing plot data structure...\n');
  
  try {
    console.log('1️⃣ Fetching plots from API...');
    const response = await fetch(`${BASE_URL}/api/plots`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Response successful');
      console.log('📊 Total plots:', data.total);
      console.log('📦 Plots array length:', data.plots?.length);
      
      if (data.plots && data.plots.length > 0) {
        console.log('\n📋 First plot data:');
        const plot = data.plots[0];
        console.log('- ID:', JSON.stringify(plot.id));
        console.log('- Project:', JSON.stringify(plot.project));
        console.log('- Developer:', JSON.stringify(plot.developerName));
        console.log('- Location:', JSON.stringify(plot.location));
        console.log('- Status:', JSON.stringify(plot.status));
        
        console.log('\n🔍 Full plot object:');
        console.log(JSON.stringify(plot, null, 2));
        
        // If ID exists, test specific plot endpoint
        if (plot.id) {
          console.log(`\n2️⃣ Testing specific plot API with ID: ${plot.id}`);
          const specificResponse = await fetch(`${BASE_URL}/api/plots/${plot.id}`);
          const specificData = await specificResponse.json();
          
          if (specificResponse.ok) {
            console.log('✅ Specific plot fetch successful');
            console.log('📋 Specific plot data:');
            console.log('- ID:', JSON.stringify(specificData.plot?.id));
            console.log('- Project:', JSON.stringify(specificData.plot?.project));
          } else {
            console.log('❌ Specific plot fetch failed:', specificData.error);
          }
        } else {
          console.log('\n⚠️  Plot ID is empty/null - cannot test specific endpoint');
        }
        
      } else {
        console.log('⚠️  No plots found in response');
      }
      
    } else {
      console.log('❌ API request failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testPlotData();