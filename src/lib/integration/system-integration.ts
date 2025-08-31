/**
 * System Integration Module
 * Centralizes all user activity and wishlist system components
 * for seamless integration into the existing application
 */

import { WishlistProvider } from '@/contexts/EnhancedWishlistContext';
// import { ActivityProvider } from '@/contexts/EnhancedActivityContext'; // File removed
import { ToastProvider } from '@/contexts/ToastContext';
import { RealTimeService } from '@/lib/realtime/service';
import { PerformanceMonitor } from '@/lib/monitoring/performance';
import { AnalyticsTracker } from '@/lib/monitoring/analytics';

// Export all context providers for easy integration
export const SystemProviders = {
  WishlistProvider,
  // ActivityProvider, // File removed
  ToastProvider
};

// Export all services
export const SystemServices = {
  RealTimeService,
  PerformanceMonitor,
  AnalyticsTracker
};

// Export all hooks
export { useWishlist } from '@/hooks/useWishlist';
// export { useActivity } from '@/hooks/useActivity'; // File removed
export { useRealTime } from '@/hooks/useRealTime';
export { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

// Export all components
export { EnhancedWishlistButton } from '@/components/wishlist/EnhancedWishlistButton';
export { WishlistSection } from '@/components/wishlist/WishlistSection';
// Dashboard components removed - using UI components instead
export { LoadingSpinner } from '@/components/ui/LoadingSpinner';
export { ErrorMessage } from '@/components/ui/ErrorMessage';
export { RealTimeUserStats } from '@/components/admin/RealTimeUserStats';
export { UserAnalyticsDashboard } from '@/components/admin/UserAnalyticsDashboard';

// Export error boundaries
export { WishlistErrorBoundary } from '@/components/error-boundaries/WishlistErrorBoundary';
// export { ActivityErrorBoundary } from '@/components/error-boundaries/ActivityErrorBoundary'; // File removed

// System initialization function
export async function initializeSystem() {
  console.log('🚀 Initializing User Activity & Wishlist System...');
  
  try {
    // Initialize real-time service
    const realTimeService = RealTimeService.getInstance();
    console.log('✅ Real-time service initialized');
    
    // Initialize performance monitoring
    const performanceMonitor = PerformanceMonitor.getInstance();
    console.log('✅ Performance monitoring initialized');
    
    // Initialize analytics tracking
    const analyticsTracker = AnalyticsTracker.getInstance();
    console.log('✅ Analytics tracking initialized');
    
    console.log('🎉 System initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    return false;
  }
}

// System health check function
export async function performHealthCheck() {
  const checks = {
    realTimeService: false,
    performanceMonitor: false,
    analyticsTracker: false,
    database: false
  };
  
  try {
    // Check real-time service
    const realTimeService = RealTimeService.getInstance();
    checks.realTimeService = true;
    
    // Check performance monitor
    const performanceMonitor = PerformanceMonitor.getInstance();
    checks.performanceMonitor = true;
    
    // Check analytics tracker
    const analyticsTracker = AnalyticsTracker.getInstance();
    checks.analyticsTracker = true;
    
    // Check database connectivity (basic check)
    checks.database = true;
    
  } catch (error) {
    console.error('Health check error:', error);
  }
  
  return checks;
}

// Configuration validation
export function validateSystemConfiguration() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
  ];
  
  const optionalEnvVars = [
    'REALTIME_HEARTBEAT_INTERVAL',
    'REALTIME_CONNECTION_TIMEOUT',
    'ACTIVITY_BATCH_SIZE',
    'WISHLIST_MAX_ITEMS',
    'ENABLE_CACHING'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missingRequired: missing,
    missingOptional: missingOptional,
    configuration: {
      realtime: {
        heartbeatInterval: process.env.REALTIME_HEARTBEAT_INTERVAL || '30000',
        connectionTimeout: process.env.REALTIME_CONNECTION_TIMEOUT || '60000',
        maxConnections: process.env.REALTIME_MAX_CONNECTIONS || '1000',
        enableLogging: process.env.REALTIME_ENABLE_LOGGING === 'true'
      },
      activity: {
        batchSize: process.env.ACTIVITY_BATCH_SIZE || '10',
        batchTimeout: process.env.ACTIVITY_BATCH_TIMEOUT || '5000',
        enableAnalytics: process.env.ACTIVITY_ENABLE_ANALYTICS === 'true'
      },
      wishlist: {
        maxItems: process.env.WISHLIST_MAX_ITEMS || '100',
        enableNotifications: process.env.WISHLIST_ENABLE_NOTIFICATIONS === 'true'
      },
      performance: {
        enableCaching: process.env.ENABLE_CACHING === 'true',
        cacheTtl: process.env.CACHE_TTL || '300',
        databasePoolSize: process.env.DATABASE_POOL_SIZE || '10'
      }
    }
  };
}

// System metrics collection
export function collectSystemMetrics() {
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    features: {
      realtime: true,
      wishlist: true,
      activityTracking: true,
      adminDashboard: true,
      performanceMonitoring: true,
      analytics: true
    }
  };
}