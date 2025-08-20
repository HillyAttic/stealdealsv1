// Test if server is ready
const BASE_URL = 'http://localhost:3002';

async function testServer() {
  try {
    console.log('Testing server availability...');
    const response = await fetch(`${BASE_URL}/api/plots`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is ready!');
      console.log(`📊 Found ${data.plots?.length || 0} plots`);
      return true;
    } else {
      console.log(`⚠️ Server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Server not ready yet:', error.message);
    return false;
  }
}

testServer();