// Test the type error fix for investment parsing
const fetch = require('node-fetch');

async function testTypeErrorFix() {
  console.log('=== TESTING TYPE ERROR FIX ===\n');
  
  try {
    console.log('🧪 Testing franchises API after type error fix...');
    const response = await fetch('http://localhost:3000/api/franchises');
    const data = await response.json();
    
    if (response.ok) {
      const count = data.franchises?.length || 0;
      const total = data.total || 0;
      
      console.log(`✅ SUCCESS: Franchises API is working!`);
      console.log(`   - Franchises returned: ${count}`);
      console.log(`   - Total available: ${total}`);
      
      if (count > 0) {
        const sample = data.franchises[0];
        console.log(`\n📋 Sample franchise data:`);
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Name: ${sample.name}`);
        console.log(`   - Industry: ${sample.industry}`);
        console.log(`   - Investment: ${sample.investment}`);
        console.log(`   - Location: ${sample.location || sample.headquarter}`);
        
        // Check if nested data is properly extracted
        if (sample.industry && sample.industry !== 'Not specified') {
          console.log(`   🎉 Nested data extraction working: Industry = ${sample.industry}`);
        }
        if (sample.segment) {
          console.log(`   🎉 Nested data extraction working: Segment = ${sample.segment}`);
        }
        if (sample.minInvestment && sample.minInvestment > 0) {
          console.log(`   🎉 Investment parsing working: Min Investment = ${sample.minInvestment}`);
        }
      }
    } else {
      console.log(`❌ API Error: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
  
  console.log('\n=== TYPE ERROR FIX TEST COMPLETE ===');
}

testTypeErrorFix().catch(console.error);