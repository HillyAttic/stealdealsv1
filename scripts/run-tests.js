#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runCommand(command, description) {
  log(`\n🚀 ${description}`, 'cyan');
  log(`Running: ${command}`, 'blue');
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  log('🧪 Firebase Optimization Test Suite', 'bright');
  log('=====================================', 'bright');
  
  const testCommands = {
    unit: {
      command: 'npm run test:unit',
      description: 'Unit Tests'
    },
    integration: {
      command: 'npm run test:integration',
      description: 'Integration Tests'
    },
    performance: {
      command: 'npm run test:performance',
      description: 'Performance Tests'
    },
    e2e: {
      command: 'npm run test:e2e',
      description: 'End-to-End Tests'
    },
    stress: {
      command: 'npm run test:stress',
      description: 'Stress Tests'
    },
    all: {
      command: 'npm run test:all',
      description: 'All Tests'
    },
    coverage: {
      command: 'npm run test:coverage',
      description: 'Tests with Coverage'
    }
  };
  
  if (!testCommands[testType]) {
    log(`❌ Unknown test type: ${testType}`, 'red');
    log('Available test types:', 'yellow');
    Object.keys(testCommands).forEach(type => {
      log(`  - ${type}: ${testCommands[type].description}`, 'yellow');
    });
    process.exit(1);
  }
  
  const { command, description } = testCommands[testType];
  const success = runCommand(command, description);
  
  if (success) {
    log('\n📊 Generating test report...', 'cyan');
    runCommand('npm run test:report', 'Test Report Generation');
    
    log('\n🎉 Test execution completed!', 'green');
    log('📄 Check test-report.html for detailed results', 'blue');
  } else {
    log('\n💥 Test execution failed!', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}