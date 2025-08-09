/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: false
      }
    },
    maxWorkers: 1,
    minWorkers: 1
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Disable PostCSS for tests
  css: {
    modules: {
      classNameStrategy: 'non-scoped'
    }
  },
  esbuild: {
    target: 'node18'
  }
})