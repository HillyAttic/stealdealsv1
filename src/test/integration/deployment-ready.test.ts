/**
 * Deployment Readiness Test Suite
 * Verifies that the system is ready for deployment
 */

import { describe, it, expect } from '@jest/globals';;
import fs from 'fs';
import path from 'path';

describe('Deployment Readiness', () => {
  describe('Required Files', () => {
    it('should have all deployment files', () => {
      const requiredFiles = [
        'package.json',
        'next.config.ts',
        'vercel.json',
        '.env.example',
        '.env.production',
        'DEPLOYMENT.md',
        'scripts/deploy.js',
        'scripts/post-deploy-verify.js'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath), `Missing required file: ${file}`).toBe(true);
      });
    });

    it('should have deployment scripts in package.json', () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts.deploy).toBeDefined();
      expect(packageJson.scripts['deploy:skip-tests']).toBeDefined();
      expect(packageJson.scripts['deploy:verify']).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should have proper Next.js configuration', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
    });

    it('should have Vercel configuration', () => {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      expect(vercelConfig.functions).toBeDefined();
      expect(vercelConfig.headers).toBeDefined();
      expect(vercelConfig.functions['src/app/api/realtime/route.ts']).toBeDefined();
    });

    it('should have environment configuration', () => {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      const envExample = fs.readFileSync(envExamplePath, 'utf8');
      
      // Check for required environment variables
      expect(envExample).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      expect(envExample).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      expect(envExample).toContain('REALTIME_HEARTBEAT_INTERVAL');
      expect(envExample).toContain('ACTIVITY_BATCH_SIZE');
      expect(envExample).toContain('WISHLIST_MAX_ITEMS');
    });
  });

  describe('System Components', () => {
    it('should have middleware configured', () => {
      const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
      const middleware = fs.readFileSync(middlewarePath, 'utf8');
      
      expect(middleware).toContain('isRealTimeRoute');
      expect(middleware).toContain('/api/realtime');
      expect(middleware).toContain('Access-Control-Allow-Origin');
    });

    it('should have providers configured', () => {
      const providersPath = path.join(process.cwd(), 'src/app/providers.tsx');
      const providers = fs.readFileSync(providersPath, 'utf8');
      
      expect(providers).toContain('EnhancedWishlistProvider');
      expect(providers).toContain('EnhancedActivityProvider');
      expect(providers).toContain('ToastProvider');
    });

    it('should have system health check component', () => {
      const healthCheckPath = path.join(process.cwd(), 'src/components/system/SystemHealthCheck.tsx');
      expect(fs.existsSync(healthCheckPath)).toBe(true);
    });
  });

  describe('API Structure', () => {
    it('should have required API endpoints', () => {
      const apiPaths = [
        'src/app/api/health/route.ts',
        'src/app/api/realtime/route.ts',
        'src/app/api/user/wishlist',
        'src/app/api/user/activity',
        'src/app/api/admin/users'
      ];

      apiPaths.forEach(apiPath => {
        const fullPath = path.join(process.cwd(), apiPath);
        const exists = fs.existsSync(fullPath) || fs.existsSync(fullPath + '/route.ts');
        expect(exists, `Missing API endpoint: ${apiPath}`).toBe(true);
      });
    });
  });

  describe('Build Configuration', () => {
    it('should have TypeScript configuration', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('should have Tailwind configuration', () => {
      const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
      expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    });

    it('should have test configuration', () => {
      const vitestConfigPath = path.join(process.cwd(), 'vitest.config.ts');
      expect(fs.existsSync(vitestConfigPath)).toBe(true);
    });
  });

  describe('Documentation', () => {
    it('should have deployment documentation', () => {
      const deploymentDocPath = path.join(process.cwd(), 'DEPLOYMENT.md');
      const deploymentDoc = fs.readFileSync(deploymentDocPath, 'utf8');
      
      expect(deploymentDoc).toContain('Prerequisites');
      expect(deploymentDoc).toContain('Environment Configuration');
      expect(deploymentDoc).toContain('Deployment Process');
      expect(deploymentDoc).toContain('Post-Deployment Verification');
    });

    it('should have README documentation', () => {
      const readmePath = path.join(process.cwd(), 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });
  });
});

describe('Environment Validation', () => {
  it('should validate environment variable structure', () => {
    // Test default values for optional configuration
    const realtimeHeartbeat = process.env.REALTIME_HEARTBEAT_INTERVAL || '30000';
    const activityBatchSize = process.env.ACTIVITY_BATCH_SIZE || '10';
    const wishlistMaxItems = process.env.WISHLIST_MAX_ITEMS || '100';

    expect(parseInt(realtimeHeartbeat)).toBeGreaterThan(0);
    expect(parseInt(activityBatchSize)).toBeGreaterThan(0);
    expect(parseInt(wishlistMaxItems)).toBeGreaterThan(0);
  });

  it('should have proper environment variable types', () => {
    // Check that environment variables are strings (as expected)
    const envVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_APP_URL'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value !== undefined) {
        expect(typeof value).toBe('string');
      }
    });
  });
});

describe('Performance Configuration', () => {
  it('should have performance optimizations configured', () => {
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    expect(nextConfig).toContain('experimental');
    expect(nextConfig).toContain('optimizeCss');
    expect(nextConfig).toContain('images');
  });

  it('should have caching configuration', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    expect(envExample).toContain('ENABLE_CACHING');
    expect(envExample).toContain('CACHE_TTL');
  });
});