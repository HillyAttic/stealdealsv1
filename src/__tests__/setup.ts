/**
 * Jest Test Setup
 * Configures the testing environment for the application
 */

// Setup DOM environment for tests
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useParams() {
    return {};
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js config
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless VERBOSE is set
  log: process.env.VERBOSE ? console.log : jest.fn(),
  debug: process.env.VERBOSE ? console.debug : jest.fn(),
  info: process.env.VERBOSE ? console.info : jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Setup fetch mock for tests
global.fetch = jest.fn();

// Setup environment variables for tests
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://test-db.firebaseio.com';

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});