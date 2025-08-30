// Test nested data extraction fix
const fetch = require('node-fetch');

async function testNestedDataFix() {
  console.log('=== TESTING NESTED DATA EXTRACTION FIX ===\n');
  
  const endpoints = [
    { 
      name: 'Franchises', 
      url: 'http://localhost:3000/api/franchises',
      expectedFields: ['industry', 'segment', 'model', 'headquarter', 'royalty'],
      detailsKey: 'franchiseDetails'
    },
    { 
      name: 'Plots', 
      url: 'http://localhost:3000/api/plots',
      expectedFields: ['project', 'developerName', 'plotSize', 'investmentStartsFrom'],
      detailsKey: 'plotDetails'
    },
    { 
      name: 'Vacant Properties', 
      url: 'http://localhost:3000/api/properties?propertyType=vacant',
      expectedFields: ['category', 'city', 'state', 'carpetArea', 'contactName'],
      detailsKey: 'vacantDetails'
    },
    { 
      name: 'Preleased Properties', 
      url: 'http://localhost:3000/api/properties?propertyType=preleased',
      expectedFields: ['tenant', 'buildingName', 'leaseTerm', 'remainingLease'],
      detailsKey: 'preleasedDetails'
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing ${endpoint.name}...`);
      const response = await fetch(endpoint.url);
      const data = await response.json();
      
      if (response.ok) {
        const items = data.franchises || data.plots || data.properties || [];
        const count = items.length;
        console.log(`✅ ${endpoint.name}: ${count} items returned`);
        
        if (count > 0) {
          const sample = items[0];
          console.log(`   Sample item: ${sample.id} - "${sample.title || sample.name || sample.project}"`);
          
          // Check if nested data is properly extracted
          let extractedFields = 0;
          let missingFields = [];
          
          endpoint.expectedFields.forEach(field => {
            if (sample[field] && sample[field] !== '' && sample[field] !== 'Not specified') {
              extractedFields++;
            } else {
              missingFields.push(field);
            }
          });
          
          const extractionRate = (extractedFields / endpoint.expectedFields.length) * 100;
          console.log(`   Data extraction: ${extractedFields}/${endpoint.expectedFields.length} fields (${extractionRate.toFixed(1)}%)`);
          
          if (extractionRate >= 60) {
            console.log(`   🎉 GOOD: Most nested data is being extracted properly`);
          } else {
            console.log(`   ⚠️  PARTIAL: Some nested data missing: ${missingFields.join(', ')}`);
          }
          
          // Show sample extracted data
          console.log(`   Sample extracted data:`);
          endpoint.expectedFields.slice(0, 3).forEach(field => {
            const value = sample[field];
            if (value && value !== '' && value !== 'Not specified') {
              console.log(`     - ${field}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
            }
          });
        }
      } else {
        console.log(`❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Network error - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('=== NESTED DATA EXTRACTION TEST COMPLETE ===');
}

testNestedDataFix().catch(console.error);