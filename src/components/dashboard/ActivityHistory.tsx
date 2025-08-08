'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyView, SearchQuery, EngagementData } from '@/types/auth';
import { formatDistanceToNow } from 'date-fns';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface ActivityHistoryProps {
  className?: string;
}

interface ActivityData {
  viewHistory: PropertyView[];
  searchHistory: SearchQuery[];
  engagementMetrics: EngagementData;
}

export default function ActivityHistory({ className = '' }: ActivityHistoryProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'views' | 'searches' | 'engagement'>('views');
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      
      // For now, show mock data since the API endpoints might not be fully implemented
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setActivityData({
        viewHistory: [
          {
            propertyId: 'prop-1',
            propertyTitle: 'Prime Commercial Space in Delhi',
            viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            duration: 45000, // 45 seconds
            source: 'search'
          },
          {
            propertyId: 'prop-2', 
            propertyTitle: 'Retail Shop in Laxmi Nagar',
            viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            duration: 120000, // 2 minutes
            source: 'wishlist'
          }
        ],
        searchHistory: [
          {
            id: 'search-1',
            query: 'commercial space Delhi',
            resultsCount: 25,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            filters: { location: 'Delhi', type: 'Commercial' }
          },
          {
            id: 'search-2',
            query: 'retail shop',
            resultsCount: 18,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            filters: { type: 'Retail' }
          }
        ],
        engagementMetrics: {
          totalSessions: 12,
          averageSessionDuration: 180, // 3 minutes
          pagesPerSession: 4.2,
          bounceRate: 25.5
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatSource = (source: string): string => {
    const sourceMap: Record<string, string> = {
      'search': 'Search Results',
      'wishlist': 'Wishlist',
      'direct': 'Direct Link',
      'recommendation': 'Recommendation',
      'internal': 'Internal Navigation',
      'google': 'Google',
      'facebook': 'Facebook',
      'external': 'External Site'
    };
    return sourceMap[source] || source;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchActivityData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity History</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('views')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'views'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Property Views ({activityData?.viewHistory.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'searches'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Searches ({activityData?.searchHistory.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'engagement'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Engagement
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Property Views Tab */}
        {activeTab === 'views' && (
          <div className="space-y-4">
            {activityData?.viewHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👁️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No property views yet</h3>
                <p className="text-gray-600 mb-4">
                  Start browsing properties to see your viewing history here
                </p>
                <Link 
                  href="/vacant"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              activityData?.viewHistory.map((view, index) => (
                <div key={`${view.propertyId}-${index}`} className="group p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {view.propertyTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true })}
                        </span>
                        {view.duration && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {formatDuration(view.duration / 1000)}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {formatSource(view.source)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/vacant/${view.propertyId}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        View Again
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search History Tab */}
        {activeTab === 'searches' && (
          <div className="space-y-4">
            {activityData?.searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
                <p className="text-gray-600 mb-4">
                  Your search history will appear here
                </p>
                <Link 
                  href="/vacant"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Searching
                </Link>
              </div>
            ) : (
              activityData?.searchHistory.map((search, index) => (
                <div key={`${search.id}-${index}`} className="group p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {search.query || 'Browse All Properties'}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {search.resultsCount} results
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
                      </div>
                      {Object.keys(search.filters).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(search.filters).map(([key, value]) => (
                            value && (
                              <span key={key} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {key}: {String(value)}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/vacant?search=${encodeURIComponent(search.query || '')}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Search Again
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Engagement Metrics Tab */}
        {activeTab === 'engagement' && activityData?.engagementMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {activityData.engagementMetrics.totalSessions}
                  </p>
                </div>
                <div className="text-blue-400">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatDuration(activityData.engagementMetrics.averageSessionDuration)}
                  </p>
                </div>
                <div className="text-green-400">⏱️</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Pages per Session</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {activityData.engagementMetrics.pagesPerSession.toFixed(1)}
                  </p>
                </div>
                <div className="text-purple-400">📄</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {activityData.engagementMetrics.bounceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-orange-400">📈</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}