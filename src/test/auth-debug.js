/**
 * Test script to debug authentication and activity fetching issues
 */

// Test authentication flow and activity context
async function testAuthAndActivity() {
  console.log('🔧 Starting authentication and activity debug test...');
  
  // 1. Check current authentication state
  console.log('\n1. Checking current authentication state...');
  
  try {
    const debugResponse = await fetch('/api/debug/auth-status', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Auth debug response:', debugData);
    } else {
      console.log('❌ Auth debug failed:', debugResponse.status, debugResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Auth debug error:', error);
  }
  
  // 2. Set up mock authentication if needed
  console.log('\n2. Setting up mock authentication...');
  
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=test@example.com',
    role: 'user',
    provider: 'email'
  };
  
  localStorage.setItem('mock_user', JSON.stringify(mockUser));
  localStorage.setItem('mock_authenticated', 'true');
  
  console.log('✅ Mock authentication set up:', {
    mockUser,
    mockAuthenticated: localStorage.getItem('mock_authenticated')
  });
  
  // 3. Test activity API calls
  console.log('\n3. Testing activity API calls...');
  
  try {
    // Test without authentication headers (cookie-only)
    console.log('📡 Testing cookie-only authentication...');
    const response1 = await fetch('/api/user/activity?limit=5', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Response 1 (cookie-only):', {
      status: response1.status,
      statusText: response1.statusText,
      ok: response1.ok
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Cookie auth successful:', data1);
    } else {
      const errorText1 = await response1.text();
      console.log('❌ Cookie auth failed:', errorText1);
    }
    
  } catch (error) {
    console.log('❌ Activity API test error:', error);
  }
  
  // 4. Test with Authorization header
  console.log('\n4. Testing Bearer token authentication...');
  
  try {
    const response2 = await fetch('/api/user/activity?limit=5', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock_token',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('Response 2 (Bearer token):', {
      status: response2.status,
      statusText: response2.statusText,
      ok: response2.ok
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Bearer auth successful:', data2);
    } else {
      const errorText2 = await response2.text();
      console.log('❌ Bearer auth failed:', errorText2);
    }
    
  } catch (error) {
    console.log('❌ Bearer token test error:', error);
  }
  
  // 5. Test session status
  console.log('\n5. Testing session status...');
  
  try {
    const sessionResponse = await fetch('/api/auth/user/session', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('Session response:', {
      status: sessionResponse.status,
      statusText: sessionResponse.statusText,
      ok: sessionResponse.ok
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ Session valid:', sessionData);
    } else {
      const sessionErrorText = await sessionResponse.text();
      console.log('❌ Session invalid:', sessionErrorText);
    }
    
  } catch (error) {
    console.log('❌ Session test error:', error);
  }
  
  // 6. Check cookies
  console.log('\n6. Checking browser cookies...');
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  
  console.log('Current cookies:', cookies);
  
  console.log('\n🎯 Test complete! Check the console output above for authentication details.');
}

// Auto-run test when script loads
if (typeof window !== 'undefined') {
  console.log('🚀 Authentication debug script loaded. Running test...');
  testAuthAndActivity();
} else {
  console.log('⚠️ This script should be run in a browser environment.');
}