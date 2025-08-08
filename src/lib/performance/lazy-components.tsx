'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';

// Lazy load dashboard components
export const LazyWishlistSection = lazy(() => 
  import('@/components/wishlist/WishlistSection').then(module => ({ 
    default: module.WishlistSection 
  }))
);

export const LazyActivityHistory = lazy(() => 
  import('@/components/dashboard/ActivityHistory')
);

export const LazyUserAnalytics = lazy(() => 
  import('@/components/dashboard/UserAnalytics').then(module => ({ 
    default: module.UserAnalytics 
  }))
);

export const LazyAnalyticsCharts = lazy(() => 
  import('@/components/dashboard/AnalyticsCharts').then(module => ({ 
    default: module.AnalyticsCharts 
  }))
);

export const LazyProfileManagement = lazy(() => 
  import('@/components/profile/ProfileManagement').then(module => ({ 
    default: module.ProfileManagement 
  }))
);

// Admin components
export const LazyUserManagement = lazy(() => 
  import('@/components/admin/UserManagement').then(module => ({ 
    default: module.UserManagement 
  }))
);

export const LazyUserAnalyticsDashboard = lazy(() => 
  import('@/components/admin/UserAnalyticsDashboard').then(module => ({ 
    default: module.UserAnalyticsDashboard 
  }))
);

// Higher-order component for lazy loading with custom loading state
interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function LazyWrapper({ fallback, children }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner message="Loading component..." />}>
      {children}
    </Suspense>
  );
}

// HOC for creating lazy components with error boundaries
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  loadingMessage?: string
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper fallback={<LoadingSpinner message={loadingMessage} />}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

// Preload function for critical components
export function preloadDashboardComponents() {
  if (typeof window !== 'undefined') {
    // Preload critical components after initial render
    setTimeout(() => {
      import('@/components/wishlist/WishlistSection');
      import('@/components/dashboard/ActivityHistory');
    }, 100);
    
    // Preload analytics components after a delay
    setTimeout(() => {
      import('@/components/dashboard/UserAnalytics');
      import('@/components/dashboard/AnalyticsCharts');
    }, 1000);
  }
}