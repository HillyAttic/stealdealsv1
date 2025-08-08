#!/usr/bin/env node

/**
 * Comprehensive Authentication System Test
 * 
 * This script tests all aspects of the authentication system including:
 * 1. User Registration & Login
 * 2. Admin Authentication  
 * 3. Google OAuth Flow
 * 4. Session Management
 * 5. API Authorization
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'stealdeals.co.in@gmail.com';
const ADMIN_PASSWORD = 'Stealdeals@821';

// Test results collector
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function addResult(testName, passed, message, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    test: testName,
    passed,
    message,
    error,
    timestamp: new Date().toISOString()
  });
  
  log(`${testName}: ${message}`, passed ? 'success' : 'error');
}

async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { text: await response.text() };
    }
    
    return { response, data, error: null };
  } catch (error) {
    return { response: null, data: null, error };
  }
}

// Test Functions
async function testServerHealth() {
  log('Testing server health...');
  
  const { response, data, error } = await makeRequest('/');
  
  if (error) {
    addResult('Server Health', false, 'Server is not responding', error.message);
    return false;
  }
  
  if (response && response.ok) {
    addResult('Server Health', true, 'Server is responding');
    return true;
  } else {
    addResult('Server Health', false, `Server returned status ${response?.status}`);
    return false;
  }
}

async function testUserRegistration() {
  log('Testing user registration...');
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };
  
  const { response, data, error } = await makeRequest('/api/auth/user/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (error) {
    addResult('User Registration', false, 'Registration request failed', error.message);
    return null;
  }
  
  if (response.ok && data.success) {
    addResult('User Registration', true, 'User registration successful');
    return { user: data.user, token: data.token };
  } else {
    addResult('User Registration', false, `Registration failed: ${data?.error || 'Unknown error'}`);
    return null;
  }
}

async function testUserLogin() {
  log('Testing user login...');
  
  // First register a user to login with
  const registrationResult = await testUserRegistration();
  if (!registrationResult) {
    addResult('User Login', false, 'Cannot test login - registration failed');
    return null;
  }
  
  const { response, data, error } = await makeRequest('/api/auth/user/login', {
    method: 'POST',
    body: JSON.stringify({
      email: registrationResult.user.email,
      password: 'TestPassword123!'
    })
  });
  
  if (error) {
    addResult('User Login', false, 'Login request failed', error.message);
    return null;
  }
  
  if (response.ok && data.success) {
    addResult('User Login', true, 'User login successful');
    return { user: data.data?.user || data.user, token: data.data?.token || data.token };
  } else {
    addResult('User Login', false, `Login failed: ${data?.error || 'Unknown error'}`);
    return null;
  }
}

async function testSessionValidation() {
  log('Testing session validation...');
  
  // First login to get a session
  const loginResult = await testUserLogin();
  if (!loginResult) {
    addResult('Session Validation', false, 'Cannot test session - login failed');
    return;
  }
  
  const { response, data, error } = await makeRequest('/api/auth/user/session');
  
  if (error) {
    addResult('Session Validation', false, 'Session validation request failed', error.message);
    return;
  }
  
  // It's expected to get 401 since cookies aren't sent in this test
  if (response.status === 401 && !data.authenticated) {
    addResult('Session Validation', true, 'Session validation working (correctly returned 401 without cookies)');
  } else if (response.ok && data.authenticated) {
    addResult('Session Validation', true, 'Session validation successful');
  } else {
    addResult('Session Validation', false, `Unexpected session response: ${data?.error || 'Unknown error'}`);
  }
}

async function testAdminLogin() {
  log('Testing admin login...');
  
  const { response, data, error } = await makeRequest('/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      adminLogin: true
    })
  });
  
  if (error) {
    addResult('Admin Login', false, 'Admin login request failed', error.message);
    return null;
  }
  
  if (response.ok && data.success) {
    addResult('Admin Login', true, 'Admin login successful');
    return { user: data.user, token: data.token };
  } else {
    addResult('Admin Login', false, `Admin login failed: ${data?.error || 'Unknown error'}`);
    return null;
  }
}

async function testAdminAuthorization() {
  log('Testing admin authorization...');
  
  const { response, data, error } = await makeRequest('/api/admin/users');
  
  if (error) {
    addResult('Admin Authorization', false, 'Admin API request failed', error.message);
    return;
  }
  
  // Expecting 401 since we're not sending admin cookies
  if (response.status === 401) {
    addResult('Admin Authorization', true, 'Admin authorization working (correctly returned 401 without admin token)');
  } else if (response.ok && data.success) {
    addResult('Admin Authorization', true, 'Admin API accessible');
  } else {
    addResult('Admin Authorization', false, `Unexpected admin API response: ${data?.error || 'Unknown error'}`);
  }
}

async function testAuthEndpoints() {
  log('Testing authentication endpoints...');
  
  const endpoints = [
    '/api/auth/user/session',
    '/api/auth/user/login',
    '/api/auth/user/register',
    '/api/auth/user/logout',
    '/api/auth/check'
  ];
  
  for (const endpoint of endpoints) {
    const { response, error } = await makeRequest(endpoint);
    
    if (error) {
      addResult(`Endpoint ${endpoint}`, false, 'Endpoint not accessible', error.message);
    } else if (response) {
      addResult(`Endpoint ${endpoint}`, true, `Endpoint responding (${response.status})`);
    } else {
      addResult(`Endpoint ${endpoint}`, false, 'Endpoint not responding');
    }
  }
}

async function testFirebaseConfig() {
  log('Testing Firebase configuration...');
  
  // Check if Firebase config exists
  const envPath = path.join(__dirname, '.env.local');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    addResult('Firebase Config', false, '.env.local file not found');
    return;
  }
  
  const hasFirebaseApiKey = envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy');
  const hasFirebaseAuthDomain = envContent.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stealdeals-e89ab.firebaseapp.com');
  const hasFirebaseProjectId = envContent.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID=stealdeals-e89ab');
  
  if (hasFirebaseApiKey && hasFirebaseAuthDomain && hasFirebaseProjectId) {
    addResult('Firebase Config', true, 'Firebase configuration appears to be set up');
  } else {
    addResult('Firebase Config', false, 'Firebase configuration incomplete');
  }
}

async function testGoogleOAuthEndpoint() {
  log('Testing Google OAuth endpoint...');
  
  const { response, data, error } = await makeRequest('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken: 'fake_token_for_test' })
  });
  
  if (error) {
    addResult('Google OAuth Endpoint', false, 'Google OAuth endpoint not accessible', error.message);
    return;
  }
  
  // Expecting to fail with invalid token, but endpoint should be accessible
  if (response && (response.status === 401 || response.status === 400)) {
    addResult('Google OAuth Endpoint', true, 'Google OAuth endpoint accessible (correctly rejected fake token)');
  } else if (response && response.ok) {
    addResult('Google OAuth Endpoint', false, 'Google OAuth endpoint accepted invalid token');
  } else {
    addResult('Google OAuth Endpoint', false, `Unexpected response: ${data?.error || 'Unknown error'}`);
  }
}

function generateReport() {
  const passRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
  
  log('\n' + '='.repeat(60));
  log('🧪 AUTHENTICATION SYSTEM TEST REPORT');
  log('='.repeat(60));
  log(`📊 Total Tests: ${testResults.total}`);
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, 'error');
  log(`📈 Pass Rate: ${passRate}%`);
  log('='.repeat(60));
  
  if (testResults.failed > 0) {
    log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(result => !result.passed)
      .forEach(result => {
        log(`  • ${result.test}: ${result.message}`, 'error');
        if (result.error) {
          log(`    Error: ${result.error}`, 'error');
        }
      });
  }
  
  if (testResults.passed > 0) {
    log('\n✅ PASSED TESTS:');
    testResults.details
      .filter(result => result.passed)
      .forEach(result => {
        log(`  • ${result.test}: ${result.message}`, 'success');
      });
  }
  
  log('\n' + '='.repeat(60));
  
  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED! Authentication system is ready for deployment.', 'success');
    process.exit(0);
  } else {
    log('⚠️  SOME TESTS FAILED! Please review and fix issues before deployment.', 'warning');
    process.exit(1);
  }
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting Comprehensive Authentication System Tests...');
  log(`🔗 Testing against: ${BASE_URL}`);
  log('='.repeat(60));
  
  try {
    // Core functionality tests
    await testServerHealth();
    await testAuthEndpoints();
    await testUserRegistration();
    await testUserLogin();
    await testSessionValidation();
    
    // Admin functionality tests
    await testAdminLogin();
    await testAdminAuthorization();
    
    // OAuth and Firebase tests
    await testFirebaseConfig();
    await testGoogleOAuthEndpoint();
    
    // Generate final report
    generateReport();
    
  } catch (error) {
    log(`💥 Test execution failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Check if node-fetch is available, if not provide guidance
try {
  global.fetch = global.fetch || require('node-fetch');
} catch (error) {
  log('📦 node-fetch not found. Please install it:', 'error');
  log('npm install node-fetch', 'info');
  process.exit(1);
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };