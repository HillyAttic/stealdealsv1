/**
 * Degraded Mode Banner
 * Shows users when the system is in degraded mode with helpful messaging
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getFirebaseOptimizationManager } from '@/FirebaseOptimizationManager';
import { DegradationStatus, DegradationLevel } from '@/degradation/DegradedModeHandler';

interface DegradedModeBannerProps {
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

export function DegradedModeBanner({
  position = 'top',
  dismissible = true,
  showRecommendations = true,
  className = ''
}: DegradedModeBannerProps) {
  const [status, setStatus] = useState<DegradationStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const manager = getFirebaseOptimizationManager();
    let statusCheckInterval: NodeJS.Timer | undefined;

    // Set up degradation status monitoring
    const checkStatus = () => {
      try {
        const stats = manager.getStats();
        if (stats.degradation.level !== 'normal') {
          // Mock status for now - would come from DegradedModeHandler
          const mockStatus: DegradationStatus = {
            level: stats.degradation.level,
            message: getDegradationMessage(stats.degradation.level),
            features: getAffectedFeatures(stats.degradation.level),
            estimatedRecovery: new Date(Date.now() + 60000), // 1 minute from now
            recommendations: getRecommendations(stats.degradation.level),
            userVisible: stats.degradation.level !== 'soft'
          };
          setStatus(mockStatus);
        } else {
          setStatus(null);
          setIsDismissed(false); // Reset dismissal when back to normal
        }
      } catch (error) {
        console.error('Error checking degradation status:', error);
      }
    };

    checkStatus();
    statusCheckInterval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, []);

  // Auto-dismiss after recovery
  useEffect(() => {
    if (status?.level === 'normal' && isDismissed) {
      setIsDismissed(false);
    }
  }, [status?.level, isDismissed]);

  if (!status || !status.userVisible || isDismissed) {
    return null;
  }

  const getBannerStyle = (level: DegradationLevel): string => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'warning':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'soft':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getIcon = (level: DegradationLevel): string => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'soft':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  const formatEstimatedRecovery = (recovery: Date | null): string => {
    if (!recovery) return 'unknown';
    
    const minutes = Math.ceil((recovery.getTime() - Date.now()) / 60000);
    if (minutes <= 0) return 'soon';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  const positionClasses = position === 'top' 
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

  return (
    <div className={`
      fixed ${positionClasses} z-40 
      transform transition-transform duration-300 ease-in-out
      ${className}
    `}>
      <div className={`
        border-l-4 p-4 shadow-lg
        ${getBannerStyle(status.level)}
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-lg">{getIcon(status.level)}</span>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                System Performance Notice
              </h3>
              <p className="text-sm mb-2">
                {status.message}
              </p>

              {/* Affected Features */}
              {status.features.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium mb-1">Affected features:</p>
                  <ul className="text-xs space-y-1">
                    {status.features.slice(0, isExpanded ? undefined : 2).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="flex-shrink-0">
                          {feature.impact === 'disabled' && '❌'}
                          {feature.impact === 'delayed' && '⏰'}
                          {feature.impact === 'cached' && '💾'}
                          {feature.impact === 'polling' && '🔄'}
                        </span>
                        <span className="font-medium">{feature.name}:</span>
                        <span>{feature.description}</span>
                      </li>
                    ))}
                    {!isExpanded && status.features.length > 2 && (
                      <li>
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="text-xs underline hover:no-underline"
                        >
                          Show {status.features.length - 2} more...
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Recovery Estimate */}
              {status.estimatedRecovery && (
                <p className="text-xs mb-2">
                  <span className="font-medium">Estimated recovery:</span>{' '}
                  {formatEstimatedRecovery(status.estimatedRecovery)}
                </p>
              )}

              {/* Recommendations */}
              {showRecommendations && status.recommendations.length > 0 && (
                <div className="mt-2">
                  {!isExpanded ? (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-xs underline hover:no-underline font-medium"
                    >
                      View recommendations →
                    </button>
                  ) : (
                    <div>
                      <p className="text-xs font-medium mb-1">Recommendations:</p>
                      <ul className="text-xs space-y-1">
                        {status.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="flex-shrink-0 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs underline hover:no-underline mt-2"
                >
                  Show less
                </button>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="
                flex-shrink-0 ml-4 text-lg leading-none 
                hover:opacity-70 transition-opacity
                focus:outline-none focus:ring-2 focus:ring-offset-2
              "
              aria-label="Dismiss notification"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-3">
          <button
            onClick={() => {
              const manager = getFirebaseOptimizationManager();
              manager.optimize();
            }}
            className="
              px-3 py-1 text-xs font-medium rounded
              bg-white bg-opacity-20 hover:bg-opacity-30
              transition-colors duration-200
            "
          >
            Try Optimization
          </button>

          {status.level === 'critical' && (
            <button
              onClick={() => window.location.reload()}
              className="
                px-3 py-1 text-xs font-medium rounded
                bg-white bg-opacity-20 hover:bg-opacity-30
                transition-colors duration-200
              "
            >
              Refresh Page
            </button>
          )}
        </div>

        {/* Progress Bar for Recovery */}
        {status.estimatedRecovery && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Recovery Progress</span>
              <span>
                {formatEstimatedRecovery(status.estimatedRecovery)} remaining
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div
                className="bg-white bg-opacity-50 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (Date.now() - (status.estimatedRecovery.getTime() - 300000)) / 300000 * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions (would be moved to the DegradedModeHandler in practice)
function getDegradationMessage(level: DegradationLevel): string {
  switch (level) {
    case 'critical':
      return 'System is experiencing heavy load. Only essential features are available.';
    case 'warning':
      return 'System performance is reduced. Some features may be slower than usual.';
    case 'soft':
      return 'System is under elevated load. Minor delays may occur.';
    default:
      return 'System status unknown.';
  }
}

function getAffectedFeatures(level: DegradationLevel) {
  switch (level) {
    case 'critical':
      return [
        {
          name: 'Real-time Updates',
          impact: 'disabled' as const,
          description: 'Live data updates temporarily disabled'
        },
        {
          name: 'Analytics',
          impact: 'disabled' as const,
          description: 'Performance analytics unavailable'
        },
        {
          name: 'Core Features',
          impact: 'polling' as const,
          description: 'Essential features use periodic updates'
        }
      ];
    case 'warning':
      return [
        {
          name: 'Real-time Updates',
          impact: 'polling' as const,
          description: 'Reduced update frequency'
        },
        {
          name: 'Search',
          impact: 'delayed' as const,
          description: 'Search results may be slower'
        }
      ];
    case 'soft':
      return [
        {
          name: 'Background Features',
          impact: 'delayed' as const,
          description: 'Non-essential features may load slowly'
        }
      ];
    default:
      return [];
  }
}

function getRecommendations(level: DegradationLevel): string[] {
  switch (level) {
    case 'critical':
      return [
        'Try refreshing the page if issues persist',
        'Close other browser tabs using this site',
        'Essential features will continue to work',
        'System should recover automatically'
      ];
    case 'warning':
      return [
        'Some features may be slower than usual',
        'Consider refreshing if performance is poor',
        'Real-time updates are reduced to improve performance'
      ];
    case 'soft':
      return [
        'System performance may be slightly reduced',
        'Background features may load more slowly'
      ];
    default:
      return [];
  }
}