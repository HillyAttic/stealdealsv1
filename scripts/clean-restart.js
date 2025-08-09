const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clean Development Server Restart');
console.log('====================================');

// Kill any existing Next.js processes
console.log('1. Stopping existing Next.js processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
  } else {
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
  }
} catch (error) {
  // Process might not be running, that's ok
}

// Clear Next.js cache
console.log('2. Clearing Next.js cache...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('   ✅ .next directory cleared');
}

// Clear node_modules/.cache if exists
console.log('3. Clearing module cache...');
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('   ✅ Module cache cleared');
}

// Clear coverage if exists
const coverageDir = path.join(process.cwd(), 'coverage');
if (fs.existsSync(coverageDir)) {
  fs.rmSync(coverageDir, { recursive: true, force: true });
  console.log('   ✅ Coverage reports cleared');
}

console.log('4. Starting fresh development server...');
console.log('');
console.log('🚀 Run: npm run dev');
console.log('');
console.log('✨ The server should now start without worker errors!');