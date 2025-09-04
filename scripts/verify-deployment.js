#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests all wishlist routes and environment variables after deployment
 */

const https = require('https');
const { URL } = require('url');

const DOMAIN = 'https://stealdeals.co.in';
const ROUTES_TO_TEST = [
  '/my-wishlist',
  '/saved-properties', 
  '/wishlist-simple',
  '/wishlist-static',
  '/api/user/wishlist',
  '/api/debug/wishlist'
];

// Test a single route
async function testRoute(route) {
  return new Promise((resolve) => {
    const url = new URL(route, DOMAIN);
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (deployment-test)',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          headers: {
            'x-matched-path': res.headers['x-matched-path'],
            'x-clerk-auth-status': res.headers['x-clerk-auth-status'],
            'x-clerk-auth-reason': res.headers['x-clerk-auth-reason'],
            'cache-control': res.headers['cache-control']
          },
          bodyPreview: data.substring(0, 200),
          isWorking: res.statusCode === 200 || res.statusCode === 307
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        route,
        status: 'ERROR',
        error: error.message,
        isWorking: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        route,
        status: 'TIMEOUT',
        isWorking: false
      });
    });
  });
}

// Main verification function
async function verifyDeployment() {
  console.log('🚀 Starting deployment verification...\n');
  console.log(`Testing domain: ${DOMAIN}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  const results = [];
  
  for (const route of ROUTES_TO_TEST) {
    process.stdout.write(`Testing ${route}... `);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.isWorking) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status} ${result.error || ''}`);
    }
  }
  
  console.log('\n📊 Results Summary:');
  console.log('='.repeat(50));
  
  let workingRoutes = 0;
  let authIssues = 0;
  let cacheIssues = 0;
  
  results.forEach(result => {
    if (result.isWorking) workingRoutes++;
    if (result.headers?.['x-clerk-auth-reason'] === 'secret-key-invalid') authIssues++;
    if (!result.headers?.['cache-control']?.includes('no-cache')) cacheIssues++;
    
    console.log(`${result.route}: ${result.status} ${result.isWorking ? '✅' : '❌'}`);
    if (result.headers?.['x-clerk-auth-reason']) {
      console.log(`  └─ Clerk: ${result.headers['x-clerk-auth-reason']}`);
    }
  });
  
  console.log('\n🎯 Analysis:');
  console.log(`Working routes: ${workingRoutes}/${results.length}`);
  console.log(`Auth issues: ${authIssues} routes`);
  console.log(`Cache issues: ${cacheIssues} routes`);
  
  if (workingRoutes === results.length) {
    console.log('\n🎉 SUCCESS: All routes are working!');
    process.exit(0);
  } else if (workingRoutes > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS: Some backup routes are working');
    if (authIssues > 0) {
      console.log('\n🔑 ACTION REQUIRED: Fix Clerk environment variables');
      console.log('   Set CLERK_SECRET_KEY=sk_live_...');
    }
    process.exit(1);
  } else {
    console.log('\n💥 FAILURE: No routes are working');
    process.exit(2);
  }
}

// Add cache busting parameters
function cacheBust() {
  const timestamp = Date.now();
  console.log(`🔄 Cache busting with timestamp: ${timestamp}`);
  return timestamp;
}

// Run verification
verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(3);
});