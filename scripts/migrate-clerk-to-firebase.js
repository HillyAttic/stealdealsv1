const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Files/directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  'test',
  '__tests__',
  '.test.',
  '.spec.',
];

// Import replacements
const REPLACEMENTS = [
  // Clerk imports to AuthContext imports
  {
    pattern: /import\s+{\s*([^}]*useAuth[^}]*)\s*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "import { useAuth } from '@/contexts/AuthContext';"
  },
  {
    pattern: /import\s+{\s*([^}]*useUser[^}]*)\s*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "import { useUser } from '@/contexts/AuthContext';"
  },
  {
    pattern: /import\s+{\s*([^}]*useAuth[^}]*useUser[^}]*)\s*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "import { useAuth, useUser } from '@/contexts/AuthContext';"
  },
  {
    pattern: /import\s+{\s*([^}]*useUser[^}]*useAuth[^}]*)\s*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "import { useAuth, useUser } from '@/contexts/AuthContext';"
  },
  {
    pattern: /import\s+{\s*SignedIn[^}]*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "// Clerk components removed - use useAuth() hook instead"
  },
  {
    pattern: /import\s+{\s*SignedOut[^}]*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "// Clerk components removed - use useAuth() hook instead"
  },
  {
    pattern: /import\s+{\s*SignInButton[^}]*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "// Clerk components removed - use Link to /sign-in instead"
  },
  {
    pattern: /import\s+{\s*UserButton[^}]*}\s+from\s+['"]@clerk\/nextjs['"];?/g,
    replacement: "// Clerk components removed - use custom user menu instead"
  },
  {
    pattern: /import\s+{\s*auth[^}]*}\s+from\s+['"]@clerk\/nextjs\/server['"];?/g,
    replacement: "import { auth } from '@/lib/auth/server-auth';"
  },
  {
    pattern: /import\s+{\s*currentUser[^}]*}\s+from\s+['"]@clerk\/nextjs\/server['"];?/g,
    replacement: "import { currentUser } from '@/lib/auth/server-auth';"
  },
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(fullPath)) continue;
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { pattern, replacement } of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

console.log('Starting Clerk to Firebase Auth migration...\n');

const files = getAllFiles(srcDir);
let updatedCount = 0;
let totalClerkFiles = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@clerk/nextjs')) {
    totalClerkFiles++;
    const updated = migrateFile(file);
    if (updated) {
      updatedCount++;
      console.log(`✓ Updated: ${path.relative(srcDir, file)}`);
    } else {
      console.log(`⚠ Needs manual review: ${path.relative(srcDir, file)}`);
    }
  }
}

console.log(`\nMigration complete!`);
console.log(`Total files with Clerk imports: ${totalClerkFiles}`);
console.log(`Files automatically updated: ${updatedCount}`);
console.log(`Files needing manual review: ${totalClerkFiles - updatedCount}`);
