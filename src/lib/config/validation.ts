// Environment configuration validation utility
// Ensures all required configuration is available in production

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  environment: 'development' | 'production' | 'test';
}

interface RequiredConfig {
  name: string;
  value: string | undefined;
  required: boolean;
  environments: ('development' | 'production' | 'test')[];
}

/**
 * Validates environment configuration for the application
 */
export function validateEnvironmentConfig(): ConfigValidationResult {
  const environment = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const errors: string[] = [];
  const warnings: string[] = [];

  // Define required configuration
  const configs: RequiredConfig[] = [
    // Clerk Configuration
    {
      name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'CLERK_SECRET_KEY',
      value: process.env.CLERK_SECRET_KEY,
      required: typeof window === 'undefined', // Only required on server-side
      environments: ['development', 'production']
    },

    // Firebase Configuration
    {
      name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
      value: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      required: true,
      environments: ['development', 'production']
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      required: true,
      environments: ['development', 'production']
    },

    // Application Configuration
    {
      name: 'NEXT_PUBLIC_APP_URL',
      value: process.env.NEXT_PUBLIC_APP_URL,
      required: true,
      environments: ['production']
    }
  ];

  // Validate each configuration
  configs.forEach(config => {
    if (!config.environments.includes(environment)) {
      return; // Skip validation for non-applicable environments
    }

    if (config.required && (!config.value || config.value.trim() === '')) {
      errors.push(`Missing required environment variable: ${config.name}`);
    } else if (config.value && config.value.trim() === '') {
      warnings.push(`Environment variable ${config.name} is empty`);
    }
  });

  // Validate Clerk key consistency
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkPublishableKey) {
    if (environment === 'production' && !clerkPublishableKey.includes('pk_live_')) {
      warnings.push('Using non-production Clerk publishable key in production environment');
    }
    if (environment === 'development' && !clerkPublishableKey.includes('pk_test_') && !clerkPublishableKey.includes('pk_live_')) {
      warnings.push('Clerk publishable key format may be incorrect for development');
    }
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (clerkSecretKey) {
    if (environment === 'production' && !clerkSecretKey.includes('sk_live_')) {
      errors.push('Using non-production Clerk secret key in production environment - this is a security risk');
    }
    if (environment === 'development' && !clerkSecretKey.includes('sk_test_') && !clerkSecretKey.includes('sk_live_')) {
      warnings.push('Clerk secret key format may be incorrect for development');
    }
  }

  // Validate Firebase database URL format
  const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (databaseUrl && !databaseUrl.startsWith('https://') && !databaseUrl.endsWith('.firebasedatabase.app')) {
    warnings.push('Firebase database URL format may be incorrect');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    environment
  };
}

/**
 * Logs configuration validation results
 */
export function logConfigValidation(): void {
  const validation = validateEnvironmentConfig();
  
  console.log(`[Config Validation] 🔍 Environment: ${validation.environment}`);
  
  if (validation.isValid) {
    console.log(`[Config Validation] ✅ Configuration is valid`);
  } else {
    console.error(`[Config Validation] ❌ Configuration validation failed`);
    validation.errors.forEach(error => {
      console.error(`[Config Validation] ❌ ERROR: ${error}`);
    });
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.warn(`[Config Validation] ⚠️ WARNING: ${warning}`);
    });
  }

  return;
}

/**
 * Validates configuration and throws error if invalid in production
 */
export function validateConfigOrThrow(): void {
  const validation = validateEnvironmentConfig();
  
  // Always log validation results
  logConfigValidation();
  
  // In production, throw error if configuration is invalid
  if (validation.environment === 'production' && !validation.isValid) {
    throw new Error(`Production configuration validation failed: ${validation.errors.join(', ')}`);
  }
}

/**
 * Get configuration health status for debugging
 */
export function getConfigHealth(): {
  status: 'healthy' | 'warning' | 'error';
  details: ConfigValidationResult;
} {
  const validation = validateEnvironmentConfig();
  
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  
  if (validation.errors.length > 0) {
    status = 'error';
  } else if (validation.warnings.length > 0) {
    status = 'warning';
  }
  
  return {
    status,
    details: validation
  };
}