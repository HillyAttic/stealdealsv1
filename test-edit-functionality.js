// Test edit plot functionality
const BASE_URL = 'http://localhost:3000';

async function testEditFunctionality() {
  console.log('🧪 Testing edit plot functionality...\n');
  
  try {
    // Step 1: Get plot data to find valid ID
    console.log('1️⃣ Getting plot data...');
    const plotsResponse = await fetch(`${BASE_URL}/api/plots`);
    const plotsData = await plotsResponse.json();
    
    if (!plotsResponse.ok || !plotsData.plots?.length) {
      console.log('❌ No plots found for testing');
      return;
    }
    
    const firstPlot = plotsData.plots[0];
    console.log(`✅ Found plot: "${firstPlot.project}" (ID: ${firstPlot.id})`);
    
    // Step 2: Test specific plot API endpoint
    console.log('\n2️⃣ Testing specific plot API...');
    const specificResponse = await fetch(`${BASE_URL}/api/plots/${firstPlot.id}`);
    
    if (specificResponse.ok) {
      const specificData = await specificResponse.json();
      console.log(`✅ Plot API working: "${specificData.plot.project}"`);
    } else {
      console.log('❌ Plot API failed with status:', specificResponse.status);
      return;
    }
    
    // Step 3: Test edit page accessibility
    console.log('\n3️⃣ Testing edit page accessibility...');
    const editResponse = await fetch(`${BASE_URL}/admin/plots/edit/${firstPlot.id}`);
    
    if (editResponse.ok) {
      console.log('✅ Edit page accessible');
      const htmlContent = await editResponse.text();
      
      // Check if page contains form elements
      const hasForm = htmlContent.includes('form') || htmlContent.includes('input');
      const hasReact = htmlContent.includes('_app-client') || htmlContent.includes('next/static');
      
      console.log(`✅ Page structure: ${hasForm ? 'has form elements' : 'no form detected'}`);
      console.log(`✅ React hydration: ${hasReact ? 'ready' : 'pending'}`);
      
    } else {
      console.log('❌ Edit page failed with status:', editResponse.status);
    }
    
    // Step 4: Test admin plots page
    console.log('\n4️⃣ Testing admin plots page...');
    const adminResponse = await fetch(`${BASE_URL}/admin/plots`);
    
    if (adminResponse.ok) {
      console.log('✅ Admin plots page accessible');
    } else {
      console.log('❌ Admin plots page failed with status:', adminResponse.status);
    }
    
    console.log('\n🎉 Basic functionality tests completed!');
    console.log('\n📋 Manual testing steps:');
    console.log(`1. Visit: http://localhost:3000/admin/plots/edit/${firstPlot.id}`);
    console.log('2. Check if form loads without React errors');
    console.log('3. Verify form is populated with existing plot data');
    console.log('4. Try editing a field and check for validation');
    console.log('5. Test the save functionality');
    console.log('6. Check browser console for any errors');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testEditFunctionality();