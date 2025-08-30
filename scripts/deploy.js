#!/usr/bin/env node

/**
 * Deployment script for StealDeals User Activity & Wishlist System
 * This script handles the deployment process including environment validation,
 * build optimization, and post-deployment verification.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_APP_URL'
];

const OPTIONAL_ENV_VARS = [
  'REALTIME_HEARTBEAT_INTERVAL',
  'REALTIME_CONNECTION_TIMEOUT',
  'ACTIVITY_BATCH_SIZE',
  'WISHLIST_MAX_ITEMS',
  'ENABLE_CACHING'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('🔍 Validating environment configuration...', 'blue');
  
  try {
    // Use the comprehensive validation script
    execSync('node scripts/validate-env.js', { stdio: 'inherit' });
    log('✅ Environment validation passed', 'green');
  } catch (error) {
    log('❌ Environment validation failed', 'red');
    process.exit(1);
  }
}

function runTests() {
  log('🧪 Running test suite...', 'blue');
  
  try {
    execSync('npm run test', { stdio: 'inherit' });
    log('✅ All tests passed', 'green');
  } catch (error) {
    log('❌ Tests failed', 'red');
    process.exit(1);
  }
}

function buildApplication() {
  log('🏗️  Building application...', 'blue');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build completed successfully', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
    process.exit(1);
  }
}

function validateBuild() {
  log('🔍 Validating build output...', 'blue');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found', 'red');
    process.exit(1);
  }
  
  // Check for critical files
  const criticalFiles = [
    '.next/static',
    '.next/server',
    '.next/BUILD_ID'
  ];
  
  criticalFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      log(`❌ Critical build file missing: ${file}`, 'red');
      process.exit(1);
    }
  });
  
  log('✅ Build validation passed', 'green');
}

function generateDeploymentReport() {
  log('📊 Generating deployment report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: require('../package.json').version,
    features: {
      realtime: true,
      wishlist: true,
      activity_tracking: true,
      admin_dashboard: true
    },
    configuration: {
      realtime_heartbeat: process.env.REALTIME_HEARTBEAT_INTERVAL || '30000',
      activity_batch_size: process.env.ACTIVITY_BATCH_SIZE || '10',
      wishlist_max_items: process.env.WISHLIST_MAX_ITEMS || '100',
      caching_enabled: process.env.ENABLE_CACHING === 'true'
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'deployment-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  log('✅ Deployment report generated', 'green');
}

function main() {
  const args = process.argv.slice(2);
  const skipTests = args.includes('--skip-tests');
  const skipValidation = args.includes('--skip-validation');
  
  log('🚀 Starting deployment process...', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    if (!skipValidation) {
      validateEnvironment();
    }
    
    if (!skipTests) {
      runTests();
    }
    
    buildApplication();
    validateBuild();
    generateDeploymentReport();
    
    log('=====================================', 'green');
    log('🎉 Deployment preparation completed successfully!', 'green');
    log('', 'reset');
    log('Next steps:', 'bright');
    log('1. Review the deployment-report.json file', 'reset');
    log('2. Deploy to your hosting platform (Vercel, Netlify, etc.)', 'reset');
    log('3. Run post-deployment verification', 'reset');
    
  } catch (error) {
    log('❌ Deployment preparation failed', 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironment,
  runTests,
  buildApplication,
  validateBuild,
  generateDeploymentReport
};