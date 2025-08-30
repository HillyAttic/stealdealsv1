'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealTime, RealTimeEvent } from '@/hooks/useRealTime';
import { FaCircle, FaUser, FaEye, FaHeart, FaClock, FaWifi } from 'react-icons/fa';
import { MdSignalWifiOff } from 'react-icons/md';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  onlineUsers: number;
  totalActivities: number;
  totalWishlistItems: number;
}

interface ActivityFeedItem {
  id: string;
  type: 'user_activity' | 'wishlist_update' | 'user_registration';
  message: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
}

export function RealTimeUserStats() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    onlineUsers: 0,
    totalActivities: 0,
    totalWishlistItems: 0
  });
  
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  
  // Real-time connection
  const realTime = useRealTime({ 
    channel: 'admin',
    autoReconnect: true,
    maxReconnectAttempts: 5
  });

  // Fetch initial stats
  const fetchInitialStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/realtime-stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setActivityFeed(data.recentActivity || []);
          setLastUpdateTime(new Date());
        }
      }
    } catch (error) {
      console.warn('Failed to fetch initial real-time stats:', error);
    }
  }, []);

  // Handle real-time events
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    console.log('[RealTimeUserStats] 📨 Real-time event received:', event);
    
    if (event.type === 'admin_update' || event.type === 'global_update') {
      const { data } = event;
      
      if (data.type === 'user_stats_update') {
        // Update global user statistics
        setStats(prevStats => ({
          ...prevStats,
          ...data.data
        }));
      } else if (data.type === 'activity_update') {
        // Add new activity to feed
        const newActivity: ActivityFeedItem = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'user_activity',
          message: `User ${data.data.userId} performed ${data.data.activityType}${data.data.propertyId ? ` on property ${data.data.propertyId}` : ''}`,
          timestamp: new Date(),
          userId: data.data.userId
        };
        
        setActivityFeed(prevFeed => [newActivity, ...prevFeed.slice(0, 9)]); // Keep last 10 items
        
        // Update activity count
        setStats(prevStats => ({
          ...prevStats,
          totalActivities: prevStats.totalActivities + 1
        }));
      } else if (data.type === 'wishlist_update') {
        // Add wishlist activity to feed
        const newActivity: ActivityFeedItem = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'wishlist_update',
          message: `User ${data.data.userId} ${data.data.action === 'add' ? 'added property to' : 'removed property from'} wishlist`,
          timestamp: new Date(),
          userId: data.data.userId
        };
        
        setActivityFeed(prevFeed => [newActivity, ...prevFeed.slice(0, 9)]);
        
        // Update wishlist count
        setStats(prevStats => ({
          ...prevStats,
          totalWishlistItems: data.data.action === 'add' 
            ? prevStats.totalWishlistItems + 1 
            : Math.max(0, prevStats.totalWishlistItems - 1)
        }));
      }
      
      setLastUpdateTime(new Date());
    }
  }, []);

  // Subscribe to real-time events
  useEffect(() => {
    if (realTime.isConnected) {
      const unsubscribe = realTime.subscribe(handleRealTimeEvent);
      return unsubscribe;
    }
  }, [realTime.isConnected, handleRealTimeEvent]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialStats();
  }, [fetchInitialStats]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Live User Management Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm">
            {realTime.isConnected ? (
              <>
                <FaWifi className="text-green-500" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <MdSignalWifiOff className="text-red-500" />
                <span className="text-red-600">Disconnected</span>
              </>
            )}
          </div>
          {lastUpdateTime && (
            <div className="text-xs text-gray-500">
              Last update: {lastUpdateTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <FaUser className="text-blue-500 mr-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          </div>
          <div className="text-sm text-blue-700">Total Users</div>
          <div className="text-xs text-blue-500 mt-1">All registered</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <FaEye className="text-green-500 mr-2" />
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </div>
          <div className="text-sm text-green-700">Active Users</div>
          <div className="text-xs text-green-500 mt-1">Last 24 hours</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <FaClock className="text-purple-500 mr-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.newUsersThisMonth}</div>
          </div>
          <div className="text-sm text-purple-700">New This Month</div>
          <div className="text-xs text-purple-500 mt-1">Recent signups</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-center mb-2">
            <FaCircle className="text-orange-500 mr-2 animate-pulse" />
            <div className="text-2xl font-bold text-orange-600">{stats.onlineUsers}</div>
          </div>
          <div className="text-sm text-orange-700">Online Now</div>
          <div className="text-xs text-orange-500 mt-1">Currently active</div>
        </div>
      </div>
      
      {/* Real-time Activity Feed */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-900">Live Activity Feed</h3>
          {realTime.isConnected && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <FaCircle className="animate-pulse" />
              <span>Real-time</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {activityFeed.length > 0 ? (
            activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user_activity' ? 'bg-blue-500' :
                  activity.type === 'wishlist_update' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}></div>
                <span className="flex-1">{activity.message}</span>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-xs text-gray-400">
                {realTime.isConnected 
                  ? 'Real-time updates will appear here' 
                  : 'Connect to see real-time updates'
                }
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection Status */}
      {realTime.connectionError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">
            Connection Error: {realTime.connectionError}
          </div>
          <button
            onClick={realTime.reconnect}
            className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
          >
            Try to reconnect
          </button>
        </div>
      )}
    </div>
  );
}