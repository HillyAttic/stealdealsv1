#!/usr/bin/env node

/**
 * Post-deployment verification script
 * Verifies that all features are working correctly after deployment
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT);
    
    const req = protocol.get(url, options, (res) => {
      clearTimeout(timeout);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function testEndpoint(name, path, expectedStatus = 200) {
  try {
    log(`Testing ${name}...`, 'blue');
    const response = await makeRequest(`${BASE_URL}${path}`);
    
    if (response.statusCode === expectedStatus) {
      log(`✅ ${name} - OK (${response.statusCode})`, 'green');
      return true;
    } else {
      log(`❌ ${name} - Failed (${response.statusCode})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - Error: ${error.message}`, 'red');
    return false;
  }
}

async function testRealTimeConnection() {
  try {
    log('Testing real-time connection...', 'blue');
    
    // Test SSE endpoint
    const response = await makeRequest(`${BASE_URL}/api/realtime?channel=global`);
    
    if (response.headers['content-type']?.includes('text/event-stream')) {
      log('✅ Real-time SSE endpoint - OK', 'green');
      return true;
    } else {
      log('❌ Real-time SSE endpoint - Invalid content type', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Real-time connection - Error: ${error.message}`, 'red');
    return false;
  }
}

async function runHealthChecks() {
  log('🏥 Running health checks...', 'cyan');
  log('=====================================', 'cyan');
  
  const tests = [
    // Basic endpoints
    { name: 'Home Page', path: '/' },
    { name: 'Health Check', path: '/api/health' },
    { name: 'System Health Check', path: '/api/system/health' },
    
    // API endpoints
    { name: 'Properties API', path: '/api/properties' },
    { name: 'Franchises API', path: '/api/franchises' },
    
    // User endpoints (may require auth)
    { name: 'User Activity API', path: '/api/user/activity', expectedStatus: 401 },
    { name: 'User Wishlist API', path: '/api/user/wishlist', expectedStatus: 401 },
    
    // Admin endpoints (should require auth)
    { name: 'Admin Users API', path: '/api/admin/users', expectedStatus: 401 },
    { name: 'Admin Analytics API', path: '/api/admin/analytics', expectedStatus: 401 },
    { name: 'Admin Real-time Stats', path: '/api/admin/realtime-stats', expectedStatus: 401 },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.path, test.expectedStatus);
    results.push({ name: test.name, passed: result });
  }
  
  // Test real-time connection
  const realTimeResult = await testRealTimeConnection();
  results.push({ name: 'Real-time Connection', passed: realTimeResult });
  
  return results;
}

function generateReport(results) {
  log('=====================================', 'cyan');
  log('📊 Verification Report', 'cyan');
  log('=====================================', 'cyan');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  log(`Total Tests: ${total}`, 'bright');
  log(`Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`Failed: ${total - passed}`, total - passed === 0 ? 'green' : 'red');
  log(`Success Rate: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');
  
  log('', 'reset');
  log('Test Results:', 'bright');
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalTests: total,
    passed: passed,
    failed: total - passed,
    successRate: percentage,
    results: results
  };
  
  require('fs').writeFileSync(
    'post-deploy-verification.json',
    JSON.stringify(report, null, 2)
  );
  
  log('', 'reset');
  log('📄 Report saved to post-deploy-verification.json', 'blue');
  
  return percentage === 100;
}

async function main() {
  log('🔍 Starting post-deployment verification...', 'cyan');
  log(`Target URL: ${BASE_URL}`, 'blue');
  log('', 'reset');
  
  try {
    const results = await runHealthChecks();
    const allPassed = generateReport(results);
    
    if (allPassed) {
      log('', 'reset');
      log('🎉 All verification tests passed!', 'green');
      log('Your deployment is ready for production use.', 'green');
      process.exit(0);
    } else {
      log('', 'reset');
      log('⚠️  Some verification tests failed.', 'yellow');
      log('Please review the results and fix any issues.', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log('❌ Verification failed with error:', 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testEndpoint,
  testRealTimeConnection,
  runHealthChecks,
  generateReport
};