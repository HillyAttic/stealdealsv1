// Test vacant properties limit fix
const fetch = require('node-fetch');

async function testVacantLimit() {
  console.log('=== TESTING VACANT PROPERTIES LIMIT FIX ===\n');
  
  try {
    console.log('🧪 Testing vacant properties API...');
    const response = await fetch('http://localhost:3000/api/properties?propertyType=vacant');
    const data = await response.json();
    
    if (response.ok) {
      const count = data.properties?.length || 0;
      const total = data.total || 0;
      
      console.log(`✅ Vacant Properties API Response:`);
      console.log(`   - Properties returned: ${count}`);
      console.log(`   - Total available: ${total}`);
      
      if (count === total && count === 93) {
        console.log(`🎉 SUCCESS: All 93 vacant properties are now returned!`);
      } else if (count < total) {
        console.log(`⚠️  PARTIAL: Only ${count} of ${total} properties returned (limit issue)`);
      } else {
        console.log(`✅ GOOD: ${count} properties returned`);
      }
      
      // Show first few property titles
      if (data.properties && data.properties.length > 0) {
        console.log(`\n📋 Sample properties:`);
        data.properties.slice(0, 5).forEach((prop, index) => {
          console.log(`   ${index + 1}. ${prop.title || prop.location || 'Untitled'}`);
        });
        if (data.properties.length > 5) {
          console.log(`   ... and ${data.properties.length - 5} more`);
        }
      }
    } else {
      console.log(`❌ API Error: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

testVacantLimit().catch(console.error);