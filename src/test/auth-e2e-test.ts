/**
 * End-to-End Authentication Test Script
 * 
 * This script tests the complete authentication flow by making actual HTTP requests
 * to your authentication endpoints.
 */

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  error?: string;
}

class AuthE2ETest {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private log(message: string) {
    console.log(`[AUTH-TEST] ${message}`);
  }

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string, error?: string) {
    this.results.push({ test, status, message, error });
  }

  async testRegistration(): Promise<boolean> {
    this.log('Testing user registration...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'TestPassword123!'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.addResult('Registration', 'PASS', 'User registration successful');
        return true;
      } else {
        this.addResult('Registration', 'FAIL', data.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      this.addResult('Registration', 'FAIL', 'Network error during registration', error.message);
      return false;
    }
  }

  async testLogin(): Promise<{ success: boolean; cookies?: string }> {
    this.log('Testing user login...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });

      const data = await response.json();
      const cookies = response.headers.get('Set-Cookie');

      if (response.ok && data.success) {
        this.addResult('Login', 'PASS', 'User login successful');
        return { success: true, cookies: cookies || undefined };
      } else {
        this.addResult('Login', 'FAIL', data.error || 'Login failed');
        return { success: false };
      }
    } catch (error) {
      this.addResult('Login', 'FAIL', 'Network error during login', error.message);
      return { success: false };
    }
  }

  async testSessionValidation(cookies?: string): Promise<boolean> {
    this.log('Testing session validation...');
    
    try {
      const headers: Record<string, string> = {};
      if (cookies) {
        headers['Cookie'] = cookies;
      }

      const response = await fetch(`${this.baseUrl}/api/auth/user/session`, {
        headers
      });

      const data = await response.json();

      if (response.ok && data.success && data.authenticated) {
        this.addResult('Session Validation', 'PASS', 'Session validation successful');
        return true;
      } else {
        this.addResult('Session Validation', 'FAIL', data.error || 'Session validation failed');
        return false;
      }
    } catch (error) {
      this.addResult('Session Validation', 'FAIL', 'Network error during session validation', error.message);
      return false;
    }
  }

  async testLogout(cookies?: string): Promise<boolean> {
    this.log('Testing user logout...');
    
    try {
      const headers: Record<string, string> = {};
      if (cookies) {
        headers['Cookie'] = cookies;
      }

      const response = await fetch(`${this.baseUrl}/api/auth/user/logout`, {
        method: 'POST',
        headers
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.addResult('Logout', 'PASS', 'User logout successful');
        return true;
      } else {
        this.addResult('Logout', 'FAIL', data.error || 'Logout failed');
        return false;
      }
    } catch (error) {
      this.addResult('Logout', 'FAIL', 'Network error during logout', error.message);
      return false;
    }
  }

  async testCSRFProtection(): Promise<boolean> {
    this.log('Testing CSRF protection...');
    
    try {
      // Try to make a request without CSRF token
      const response = await fetch(`${this.baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });

      // Check if CSRF protection is working (should return 403 or similar)
      if (response.status === 403) {
        this.addResult('CSRF Protection', 'PASS', 'CSRF protection is working');
        return true;
      } else {
        this.addResult('CSRF Protection', 'FAIL', 'CSRF protection may not be working properly');
        return false;
      }
    } catch (error) {
      this.addResult('CSRF Protection', 'FAIL', 'Error testing CSRF protection', error.message);
      return false;
    }
  }

  async testRateLimit(): Promise<boolean> {
    this.log('Testing rate limiting...');
    
    try {
      // Make multiple rapid requests
      const promises = Array.from({ length: 10 }, () =>
        fetch(`${this.baseUrl}/api/auth/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      if (rateLimitedResponses.length > 0) {
        this.addResult('Rate Limiting', 'PASS', 'Rate limiting is working');
        return true;
      } else {
        this.addResult('Rate Limiting', 'FAIL', 'Rate limiting may not be working');
        return false;
      }
    } catch (error) {
      this.addResult('Rate Limiting', 'FAIL', 'Error testing rate limiting', error.message);
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    this.log('Starting comprehensive authentication tests...');
    console.log('='.repeat(50));

    // Test registration
    const registrationSuccess = await this.testRegistration();

    // Test login
    const { success: loginSuccess, cookies } = await this.testLogin();

    // Test session validation if login was successful
    if (loginSuccess && cookies) {
      await this.testSessionValidation(cookies);
      await this.testLogout(cookies);
    }

    // Test security features
    await this.testCSRFProtection();
    await this.testRateLimit();

    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULTS:');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }

      if (result.status === 'PASS') {
        passed++;
      } else {
        failed++;
      }
    });

    console.log('='.repeat(50));
    console.log(`Total: ${this.results.length} tests`);
    console.log(`Passed: ${passed} tests`);
    console.log(`Failed: ${failed} tests`);
    console.log('='.repeat(50));

    if (failed === 0) {
      console.log('🎉 All authentication tests passed!');
    } else {
      console.log('⚠️  Some authentication tests failed. Please review the results above.');
    }
  }
}

// Export for use in other files
export default AuthE2ETest;

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthE2ETest();
  tester.runAllTests().catch(console.error);
}