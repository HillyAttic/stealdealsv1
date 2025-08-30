// Test investment display fix
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

async function testInvestmentDisplayFix() {
  console.log('=== TESTING INVESTMENT DISPLAY FIX ===\n');
  
  try {
    // Test the API endpoint
    console.log('🧪 Testing Franchise API...');
    const response = await fetch('http://localhost:3000/api/franchises');
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${data.total} franchises returned\n`);
    
    // Check the first few franchises for proper investment data
    console.log('📊 Investment Data Sample:');
    data.franchises.slice(0, 5).forEach((franchise, index) => {
      console.log(`\n${index + 1}. ${franchise.name} (${franchise.industry})`);
      console.log(`   Min Investment: ${JSON.stringify(franchise.minInvestment)}`);
      console.log(`   Max Investment: ${JSON.stringify(franchise.maxInvestment)}`);
      console.log(`   Investment: ${JSON.stringify(franchise.investment)}`);
      
      // Test the display logic
      if (franchise.maxInvestment && franchise.maxInvestment !== "" && franchise.maxInvestment !== franchise.minInvestment) {
        console.log(`   → Display: ₹${franchise.minInvestment} - ₹${franchise.maxInvestment}`);
      } else {
        console.log(`   → Display: ₹${franchise.minInvestment || franchise.investment}`);
      }
    });
    
    // Test specific franchise with known investment data
    const kidzeeFranchise = data.franchises.find(f => f.name?.includes('KIDZEE'));
    if (kidzeeFranchise) {
      console.log(`\n🎯 KIDZEE Test Case:`);
      console.log(`   Name: ${kidzeeFranchise.name}`);
      console.log(`   Min Investment: "${kidzeeFranchise.minInvestment}"`);
      console.log(`   Max Investment: "${kidzeeFranchise.maxInvestment}"`);
      console.log(`   Expected Display: ₹20 LACS - ₹25 LACS`);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

testInvestmentDisplayFix();