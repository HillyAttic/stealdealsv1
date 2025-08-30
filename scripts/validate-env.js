#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates all required and optional environment variables
 * for the User Activity & Wishlist System
 */

const fs = require('fs');
const path = require('path');

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

// Required environment variables
const REQUIRED_ENV_VARS = [
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    description: 'Clerk publishable key for authentication',
    validation: (value) => value && value.startsWith('pk_')
  },
  {
    name: 'CLERK_SECRET_KEY',
    description: 'Clerk secret key for server-side authentication',
    validation: (value) => value && value.startsWith('sk_')
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    description: 'Firebase API key',
    validation: (value) => value && value.length > 20
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase project ID',
    validation: (value) => value && value.length > 5
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
    description: 'Firebase Realtime Database URL',
    validation: (value) => value && value.includes('firebasedatabase.app')
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Application base URL',
    validation: (value) => value && (value.startsWith('http://') || value.startsWith('https://'))
  }
];

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = [
  {
    name: 'JWT_SECRET',
    description: 'JWT secret for token signing',
    default: 'development-secret-change-in-production',
    validation: (value) => value && value.length >= 32,
    warning: 'Should be at least 32 characters long'
  },
  {
    name: 'REALTIME_HEARTBEAT_INTERVAL',
    description: 'Real-time heartbeat interval in milliseconds',
    default: '30000',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'REALTIME_CONNECTION_TIMEOUT',
    description: 'Real-time connection timeout in milliseconds',
    default: '60000',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'REALTIME_MAX_CONNECTIONS',
    description: 'Maximum real-time connections',
    default: '1000',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'ACTIVITY_BATCH_SIZE',
    description: 'Activity logging batch size',
    default: '10',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'ACTIVITY_BATCH_TIMEOUT',
    description: 'Activity logging batch timeout in milliseconds',
    default: '5000',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'WISHLIST_MAX_ITEMS',
    description: 'Maximum items per wishlist',
    default: '100',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'CACHE_TTL',
    description: 'Cache time-to-live in seconds',
    default: '300',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  {
    name: 'DATABASE_POOL_SIZE',
    description: 'Database connection pool size',
    default: '10',
    validation: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  }
];

// Boolean environment variables
const BOOLEAN_ENV_VARS = [
  {
    name: 'REALTIME_ENABLE_LOGGING',
    description: 'Enable real-time logging',
    default: 'true'
  },
  {
    name: 'ACTIVITY_ENABLE_ANALYTICS',
    description: 'Enable activity analytics',
    default: 'true'
  },
  {
    name: 'WISHLIST_ENABLE_NOTIFICATIONS',
    description: 'Enable wishlist notifications',
    default: 'true'
  },
  {
    name: 'ENABLE_CACHING',
    description: 'Enable caching',
    default: 'true'
  }
];

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function validateRequired() {
  log('🔍 Validating required environment variables...', 'blue');
  
  const errors = [];
  const warnings = [];
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.name];
    
    if (!value) {
      errors.push(`❌ ${envVar.name}: Missing (${envVar.description})`);
    } else if (envVar.validation && !envVar.validation(value)) {
      errors.push(`❌ ${envVar.name}: Invalid format (${envVar.description})`);
    } else {
      log(`✅ ${envVar.name}: OK`, 'green');
    }
  });
  
  return { errors, warnings };
}

function validateOptional() {
  log('🔍 Validating optional environment variables...', 'blue');
  
  const warnings = [];
  const info = [];
  
  OPTIONAL_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.name];
    
    if (!value) {
      info.push(`ℹ️  ${envVar.name}: Using default (${envVar.default})`);
    } else if (envVar.validation && !envVar.validation(value)) {
      warnings.push(`⚠️  ${envVar.name}: ${envVar.warning || 'Invalid format'} (current: ${value})`);
    } else {
      log(`✅ ${envVar.name}: ${value}`, 'green');
    }
  });
  
  return { warnings, info };
}

function validateBoolean() {
  log('🔍 Validating boolean environment variables...', 'blue');
  
  const warnings = [];
  const info = [];
  
  BOOLEAN_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.name];
    
    if (!value) {
      info.push(`ℹ️  ${envVar.name}: Using default (${envVar.default})`);
    } else if (!['true', 'false'].includes(value.toLowerCase())) {
      warnings.push(`⚠️  ${envVar.name}: Should be 'true' or 'false' (current: ${value})`);
    } else {
      log(`✅ ${envVar.name}: ${value}`, 'green');
    }
  });
  
  return { warnings, info };
}

function validateEnvironmentSpecific() {
  log('🔍 Validating environment-specific configuration...', 'blue');
  
  const env = process.env.NODE_ENV || 'development';
  const warnings = [];
  
  if (env === 'production') {
    // Production-specific validations
    if (process.env.JWT_SECRET === 'development-secret-change-in-production') {
      warnings.push('⚠️  JWT_SECRET: Using development secret in production');
    }
    
    if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      warnings.push('⚠️  NEXT_PUBLIC_APP_URL: Using localhost URL in production');
    }
    
    if (process.env.REALTIME_ENABLE_LOGGING === 'true') {
      warnings.push('⚠️  REALTIME_ENABLE_LOGGING: Logging enabled in production (may impact performance)');
    }
  }
  
  log(`✅ Environment: ${env}`, 'green');
  
  return { warnings };
}

function generateReport(results) {
  const allErrors = results.required.errors;
  const allWarnings = [
    ...results.required.warnings,
    ...results.optional.warnings,
    ...results.boolean.warnings,
    ...results.envSpecific.warnings
  ];
  const allInfo = [
    ...results.optional.info,
    ...results.boolean.info
  ];
  
  log('', 'reset');
  log('📊 Environment Validation Report', 'cyan');
  log('=====================================', 'cyan');
  
  // Summary
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'bright');
  log(`Errors: ${allErrors.length}`, allErrors.length === 0 ? 'green' : 'red');
  log(`Warnings: ${allWarnings.length}`, allWarnings.length === 0 ? 'green' : 'yellow');
  log(`Info: ${allInfo.length}`, 'blue');
  
  // Errors
  if (allErrors.length > 0) {
    log('', 'reset');
    log('❌ Errors (must be fixed):', 'red');
    allErrors.forEach(error => log(error, 'red'));
  }
  
  // Warnings
  if (allWarnings.length > 0) {
    log('', 'reset');
    log('⚠️  Warnings (should be reviewed):', 'yellow');
    allWarnings.forEach(warning => log(warning, 'yellow'));
  }
  
  // Info
  if (allInfo.length > 0) {
    log('', 'reset');
    log('ℹ️  Information (using defaults):', 'blue');
    allInfo.forEach(info => log(info, 'blue'));
  }
  
  // Configuration summary
  log('', 'reset');
  log('🔧 Current Configuration:', 'bright');
  log(`Real-time heartbeat: ${process.env.REALTIME_HEARTBEAT_INTERVAL || '30000'}ms`, 'reset');
  log(`Activity batch size: ${process.env.ACTIVITY_BATCH_SIZE || '10'}`, 'reset');
  log(`Wishlist max items: ${process.env.WISHLIST_MAX_ITEMS || '100'}`, 'reset');
  log(`Caching enabled: ${process.env.ENABLE_CACHING || 'true'}`, 'reset');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    validation: {
      errors: allErrors.length,
      warnings: allWarnings.length,
      info: allInfo.length
    },
    results: {
      errors: allErrors,
      warnings: allWarnings,
      info: allInfo
    },
    configuration: {
      realtime: {
        heartbeatInterval: process.env.REALTIME_HEARTBEAT_INTERVAL || '30000',
        connectionTimeout: process.env.REALTIME_CONNECTION_TIMEOUT || '60000',
        maxConnections: process.env.REALTIME_MAX_CONNECTIONS || '1000',
        enableLogging: process.env.REALTIME_ENABLE_LOGGING || 'true'
      },
      activity: {
        batchSize: process.env.ACTIVITY_BATCH_SIZE || '10',
        batchTimeout: process.env.ACTIVITY_BATCH_TIMEOUT || '5000',
        enableAnalytics: process.env.ACTIVITY_ENABLE_ANALYTICS || 'true'
      },
      wishlist: {
        maxItems: process.env.WISHLIST_MAX_ITEMS || '100',
        enableNotifications: process.env.WISHLIST_ENABLE_NOTIFICATIONS || 'true'
      },
      performance: {
        enableCaching: process.env.ENABLE_CACHING || 'true',
        cacheTtl: process.env.CACHE_TTL || '300',
        databasePoolSize: process.env.DATABASE_POOL_SIZE || '10'
      }
    }
  };
  
  fs.writeFileSync('env-validation-report.json', JSON.stringify(report, null, 2));
  log('', 'reset');
  log('📄 Report saved to env-validation-report.json', 'blue');
  
  return allErrors.length === 0;
}

function main() {
  log('🚀 Environment Validation for User Activity & Wishlist System', 'cyan');
  log('===========================================================', 'cyan');
  
  // Load environment files if they exist
  const envFiles = ['.env.local', '.env.production', '.env'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`📁 Loading ${file}...`, 'blue');
      const envVars = loadEnvironmentFile(file);
      Object.assign(process.env, envVars);
    }
  });
  
  const results = {
    required: validateRequired(),
    optional: validateOptional(),
    boolean: validateBoolean(),
    envSpecific: validateEnvironmentSpecific()
  };
  
  const isValid = generateReport(results);
  
  if (isValid) {
    log('', 'reset');
    log('🎉 Environment validation passed!', 'green');
    log('Your configuration is ready for deployment.', 'green');
    process.exit(0);
  } else {
    log('', 'reset');
    log('❌ Environment validation failed!', 'red');
    log('Please fix the errors above before deploying.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateRequired,
  validateOptional,
  validateBoolean,
  validateEnvironmentSpecific,
  generateReport
};