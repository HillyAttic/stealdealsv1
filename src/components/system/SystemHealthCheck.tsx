'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface HealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

interface SystemHealthCheckProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SystemHealthCheck({ 
  showDetails = false, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: SystemHealthCheckProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const checks: HealthStatus[] = [];

    try {
      // Check API Health
      try {
        const healthResponse = await fetch('/api/health');
        checks.push({
          component: 'API Health',
          status: healthResponse.ok ? 'healthy' : 'error',
          message: healthResponse.ok ? 'API is responding' : 'API is not responding',
          lastChecked: new Date()
        });
      } catch (error) {
        checks.push({
          component: 'API Health',
          status: 'error',
          message: 'Failed to connect to API',
          lastChecked: new Date()
        });
      }

      // Check Authentication
      checks.push({
        component: 'Authentication',
        status: isLoaded ? (isSignedIn ? 'healthy' : 'warning') : 'warning',
        message: isLoaded 
          ? (isSignedIn ? 'User authenticated' : 'User not signed in')
          : 'Authentication loading',
        lastChecked: new Date()
      });

      // Check Real-time Connection
      try {
        const realtimeResponse = await fetch('/api/realtime?channel=health', {
          method: 'HEAD'
        });
        checks.push({
          component: 'Real-time Service',
          status: realtimeResponse.ok ? 'healthy' : 'warning',
          message: realtimeResponse.ok 
            ? 'Real-time service available' 
            : 'Real-time service may be unavailable',
          lastChecked: new Date()
        });
      } catch (error) {
        checks.push({
          component: 'Real-time Service',
          status: 'error',
          message: 'Real-time service unavailable',
          lastChecked: new Date()
        });
      }

      // Check Wishlist API (if authenticated)
      if (isSignedIn) {
        try {
          const wishlistResponse = await fetch('/api/user/wishlist');
          checks.push({
            component: 'Wishlist Service',
            status: wishlistResponse.ok ? 'healthy' : 'warning',
            message: wishlistResponse.ok 
              ? 'Wishlist service operational' 
              : 'Wishlist service may have issues',
            lastChecked: new Date()
          });
        } catch (error) {
          checks.push({
            component: 'Wishlist Service',
            status: 'error',
            message: 'Wishlist service unavailable',
            lastChecked: new Date()
          });
        }

        // Check Activity API
        try {
          const activityResponse = await fetch('/api/user/activity');
          checks.push({
            component: 'Activity Service',
            status: activityResponse.ok ? 'healthy' : 'warning',
            message: activityResponse.ok 
              ? 'Activity service operational' 
              : 'Activity service may have issues',
            lastChecked: new Date()
          });
        } catch (error) {
          checks.push({
            component: 'Activity Service',
            status: 'error',
            message: 'Activity service unavailable',
            lastChecked: new Date()
          });
        }
      }

      // Check Environment Configuration
      const hasRequiredEnv = !!(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_APP_URL
      );

      checks.push({
        component: 'Configuration',
        status: hasRequiredEnv ? 'healthy' : 'error',
        message: hasRequiredEnv 
          ? 'Required configuration present' 
          : 'Missing required configuration',
        lastChecked: new Date()
      });

      setHealthStatus(checks);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      checks.push({
        component: 'System Health Check',
        status: 'error',
        message: 'Health check system failed',
        lastChecked: new Date()
      });
      setHealthStatus(checks);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(checkSystemHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, isLoaded, isSignedIn]);

  const getOverallStatus = (): 'healthy' | 'warning' | 'error' => {
    if (healthStatus.length === 0) return 'warning';
    
    const hasError = healthStatus.some(status => status.status === 'error');
    const hasWarning = healthStatus.some(status => status.status === 'warning');
    
    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const overallStatus = getOverallStatus();

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span>{getStatusIcon(overallStatus)}</span>
        <span className={getStatusColor(overallStatus)}>
          System {overallStatus}
        </span>
        {isChecking && <span className="text-gray-500">Checking...</span>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">System Health</h3>
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getStatusColor(overallStatus)}`}>
            {getStatusIcon(overallStatus)} {overallStatus.toUpperCase()}
          </span>
          <button
            onClick={checkSystemHealth}
            disabled={isChecking}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {healthStatus.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-3">
              <span>{getStatusIcon(status.status)}</span>
              <div>
                <div className="font-medium">{status.component}</div>
                <div className={`text-sm ${getStatusColor(status.status)}`}>
                  {status.message}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {status.lastChecked.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {lastUpdate && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleString()}
          {autoRefresh && ` • Auto-refresh every ${refreshInterval / 1000}s`}
        </div>
      )}
    </div>
  );
}

export default SystemHealthCheck;