const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing test imports from Vitest to Jest...');

const testFiles = glob.sync('src/**/*.test.{ts,tsx}');

let fixedCount = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Replace vitest imports with Jest
  content = content.replace(
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]vitest['"]/g,
    (match, imports) => {
      const jestImports = imports
        .split(',')
        .map(i => i.trim())
        .filter(i => ['describe', 'it', 'expect', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'].includes(i))
        .join(', ');
        
      const viImports = imports.includes('vi') ? "\nconst vi = jest;" : '';
      
      return `import { ${jestImports} } from '@jest/globals';${viImports}`;
    }
  );
  
  // Replace vi. with jest.
  content = content.replace(/\bvi\./g, 'jest.');
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`🎉 Fixed ${fixedCount} test files out of ${testFiles.length} total`);