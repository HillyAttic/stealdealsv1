#!/usr/bin/env node

/**
 * Simple Authentication Test Runner
 * 
 * Run this script to test your authentication endpoints:
 * node test-auth.js
 */

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

console.log('🔐 Testing StealDeals Authentication System');
console.log(`Base URL: ${baseUrl}`);
console.log('='.repeat(50));

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}${JSON.stringify(data).length > 200 ? '...' : ''}`);
    
    return { response, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { error };
  }
}

async function testAuthentication() {
  console.log('\n1️⃣  Testing Health Check');
  await makeRequest('/', { method: 'GET' });
  
  console.log('\n2️⃣  Testing Session Status');
  await makeRequest('/api/auth/user/session');
  
  console.log('\n3️⃣  Testing Registration');
  const testEmail = `test${Date.now()}@example.com`;
  const { response: regResponse } = await makeRequest('/api/auth/user/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: testEmail,
      password: 'TestPassword123!'
    })
  });
  
  console.log('\n4️⃣  Testing Login');
  const { response: loginResponse } = await makeRequest('/api/auth/user/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'TestPassword123!'
    })
  });
  
  // Extract cookies if login was successful
  const cookies = loginResponse?.headers?.get?.('Set-Cookie');
  
  if (cookies) {
    console.log('\n5️⃣  Testing Authenticated Session');
    await makeRequest('/api/auth/user/session', {
      headers: { Cookie: cookies }
    });
    
    console.log('\n6️⃣  Testing Logout');
    await makeRequest('/api/auth/user/logout', {
      method: 'POST',
      headers: { Cookie: cookies }
    });
  }
  
  console.log('\n7️⃣  Testing Invalid Login');
  await makeRequest('/api/auth/user/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    })
  });
  
  console.log('\n✅ Authentication tests completed!');
  console.log('='.repeat(50));
  console.log('💡 Check the responses above to verify everything is working correctly.');
  console.log('💡 Look for status codes: 200 = success, 401 = unauthorized, etc.');
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  console.log('📦 Installing fetch polyfill for Node.js...');
  try {
    global.fetch = require('node-fetch');
  } catch (error) {
    console.log('❌ node-fetch not found. Please install it:');
    console.log('   npm install node-fetch');
    process.exit(1);
  }
}

// Run the tests
testAuthentication().catch(console.error);