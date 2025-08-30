/**
 * Connection Status Indicator
 * Shows users the current status of Firebase connections and system health
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getFirebaseOptimizationManager, OptimizationManagerStats } from '@/FirebaseOptimizationManager';
import { DegradationLevel } from '@/config/firebase-optimization';

interface ConnectionStatusIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatusIndicator({ 
  position = 'bottom-right',
  showDetails = false,
  className = ''
}: ConnectionStatusIndicatorProps) {
  const [stats, setStats] = useState<OptimizationManagerStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const manager = getFirebaseOptimizationManager();
    
    // Update stats periodically
    const updateStats = () => {
      try {
        const currentStats = manager.getStats();
        setStats(currentStats);
        
        // Show indicator if there are issues or if expanded
        const hasIssues = currentStats.degradation.level !== 'normal' || 
                         currentStats.connections.utilization > 80;
        setIsVisible(hasIssues || isExpanded || showDetails);
      } catch (error) {
        console.error('Error getting optimization stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [showDetails, isExpanded]);

  if (!stats || !isVisible) {
    return null;
  }

  const getStatusColor = (level: DegradationLevel): string => {
    switch (level) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'soft': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (level: DegradationLevel): string => {
    switch (level) {
      case 'normal': return '🟢';
      case 'soft': return '🟡';
      case 'warning': return '🟠';
      case 'critical': return '🔴';
      case 'offline': return '⚫';
      default: return '🔵';
    }
  };

  const getStatusText = (level: DegradationLevel): string => {
    switch (level) {
      case 'normal': return 'Normal';
      case 'soft': return 'Light Load';
      case 'warning': return 'Heavy Load';
      case 'critical': return 'Overloaded';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`
      fixed ${positionClasses[position]} z-50 
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      {/* Main Status Indicator */}
      <div
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer
          border transition-all duration-200
          ${getStatusColor(stats.degradation.level)}
          ${isExpanded ? 'rounded-b-none' : 'hover:shadow-xl'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium">
          {getStatusIcon(stats.degradation.level)}
        </span>
        <span className="text-xs font-medium">
          {getStatusText(stats.degradation.level)}
        </span>
        <span className="text-xs">
          {stats.connections.total}/100
        </span>
        {!showDetails && (
          <span className="text-xs transform transition-transform duration-200">
            {isExpanded ? '▲' : '▼'}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {(isExpanded || showDetails) && (
        <div className="
          bg-white border border-gray-200 rounded-lg shadow-lg mt-1
          w-72 p-4 text-sm
        ">
          {/* Connection Stats */}
          <div className="mb-3">
            <h4 className="font-semibold text-gray-800 mb-2">Connections</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{stats.connections.total}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium">{stats.connections.utilization.toFixed(1)}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-500
                    ${stats.connections.utilization > 90 ? 'bg-red-500' :
                      stats.connections.utilization > 80 ? 'bg-orange-500' :
                      stats.connections.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}
                  `}
                  style={{ width: `${Math.min(100, stats.connections.utilization)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="mb-3">
            <h5 className="font-medium text-gray-700 mb-1">By Priority</h5>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-red-600">Critical:</span>
                <span>{stats.connections.byPriority.critical}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">High:</span>
                <span>{stats.connections.byPriority.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Medium:</span>
                <span>{stats.connections.byPriority.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low:</span>
                <span>{stats.connections.byPriority.low}</span>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="mb-3">
            <h5 className="font-medium text-gray-700 mb-1">Cache</h5>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Hit Rate:</span>
              <span className={`font-medium ${
                stats.cache.hitRate > 0.8 ? 'text-green-600' :
                stats.cache.hitRate > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(stats.cache.hitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">
                {(stats.cache.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Degradation Info */}
          {stats.degradation.level !== 'normal' && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-1">System Status</h5>
              <div className={`
                text-xs p-2 rounded
                ${getStatusColor(stats.degradation.level)}
              `}>
                {stats.degradation.level === 'critical' && 
                  'System overloaded - essential features only'}
                {stats.degradation.level === 'warning' && 
                  'Heavy load - reduced real-time updates'}
                {stats.degradation.level === 'soft' && 
                  'Elevated load - some features may be slower'}
              </div>
              {stats.degradation.queueSize > 0 && (
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-600">Queue:</span>
                  <span className="font-medium">{stats.degradation.queueSize} requests</span>
                </div>
              )}
            </div>
          )}

          {/* Multi-tab Info */}
          {stats.multiTab.tabCount > 1 && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-1">Multi-tab</h5>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Tabs:</span>
                <span className="font-medium">{stats.multiTab.tabCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Leader:</span>
                <span className={`font-medium ${stats.multiTab.isLeader ? 'text-blue-600' : 'text-gray-500'}`}>
                  {stats.multiTab.isLeader ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                const manager = getFirebaseOptimizationManager();
                manager.optimize();
              }}
              className="
                flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 
                rounded hover:bg-blue-200 transition-colors
              "
            >
              Optimize
            </button>
            {!showDetails && (
              <button
                onClick={() => setIsExpanded(false)}
                className="
                  flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 
                  rounded hover:bg-gray-200 transition-colors
                "
              >
                Hide
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}