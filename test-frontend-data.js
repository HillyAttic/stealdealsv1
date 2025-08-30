// Test frontend data loading
const fetch = require('node-fetch');

async function testFrontendAPIs() {
  console.log('=== TESTING FRONTEND API ENDPOINTS ===\n');
  
  const endpoints = [
    { name: 'Franchises', url: 'http://localhost:3000/api/franchises' },
    { name: 'Plots', url: 'http://localhost:3000/api/plots' },
    { name: 'Vacant Properties', url: 'http://localhost:3000/api/properties?propertyType=vacant' },
    { name: 'Preleased Properties', url: 'http://localhost:3000/api/properties?propertyType=preleased' },
    { name: 'All Properties', url: 'http://localhost:3000/api/properties' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing ${endpoint.name}...`);
      const response = await fetch(endpoint.url);
      const data = await response.json();
      
      if (response.ok) {
        const count = data.total || data.franchises?.length || data.plots?.length || data.properties?.length || 0;
        console.log(`✅ ${endpoint.name}: ${count} items`);
        
        // Show sample data structure
        const items = data.franchises || data.plots || data.properties || [];
        if (items.length > 0) {
          const sample = items[0];
          console.log(`   Sample item: ${sample.id} - "${sample.title || sample.name || sample.project}"`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: Error ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Network error`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('=== FRONTEND API TEST COMPLETE ===');
}

testFrontendAPIs().catch(console.error);