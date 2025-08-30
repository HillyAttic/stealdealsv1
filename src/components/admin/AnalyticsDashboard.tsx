'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Heart, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Clock,
  BarChart3
} from 'lucide-react';

interface AnalyticsDashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalWishlistItems: number;
    totalActivities: number;
    errorRate: number;
    performanceScore: number;
  };
  engagement: {
    totalEvents: number;
    activeUsers: number;
    averageEngagement: number;
    conversionRate: number;
    topFeatures: Array<{ feature: string; usage: number }>;
  };
  events: {
    wishlist: Array<{ event: string; count: number; percentage: number }>;
    activity: Array<{ event: string; count: number; percentage: number }>;
    search: Array<{ event: string; count: number; percentage: number }>;
    navigation: Array<{ event: string; count: number; percentage: number }>;
  };
  realTime: {
    connections: {
      total: number;
      active: number;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      averageDuration: number;
      errorRate: number;
    };
    systemHealth: {
      timestamp: string;
      memoryUsage: {
        used: number;
        total: number;
        percentage: number;
      };
      activeConnections: number;
      errorRate: number;
      averageResponseTime: number;
      throughput: number;
    } | null;
    activeConnections: number;
  };
  performance: {
    connectionStats: any;
    metrics: {
      responseTime: Array<{ value: number; timestamp: string }>;
      apiRequests: Array<{ value: number; timestamp: string }>;
      apiErrors: Array<{ value: number; timestamp: string }>;
      memoryUsage: Array<{ value: number; timestamp: string }>;
    };
    systemHealth: any;
  };
  errors: {
    stats: {
      total: number;
      byLevel: Record<string, number>;
      byComponent: Record<string, number>;
      errorRate: number;
      resolved: number;
      unresolved: number;
    };
    recentErrors: Array<{
      id: string;
      level: string;
      message: string;
      timestamp: string;
      component?: string;
      resolved: boolean;
    }>;
    alerts: Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      timestamp: string;
      acknowledged: boolean;
    }>;
  };
  timeframe: {
    start: string;
    end: string;
    period: string;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedTimeframe: string = timeframe) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics?timeframe=${selectedTimeframe}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge_alert',
          parameters: { alertId }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh data to show updated alert status
        await fetchAnalytics();
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_error',
          parameters: { errorId }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh data to show updated error status
        await fetchAnalytics();
      }
    } catch (err) {
      console.error('Error resolving error:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading analytics dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            System monitoring and user engagement insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.overview.activeUsers)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalWishlistItems)}</div>
            <p className="text-xs text-muted-foreground">
              Total saved properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalActivities)}</div>
            <p className="text-xs text-muted-foreground">
              User interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.performanceScore}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.overview.errorRate)} error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors & Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Key engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Events</span>
                  <span className="font-semibold">{formatNumber(data.engagement.totalEvents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-semibold">{formatNumber(data.engagement.activeUsers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Engagement</span>
                  <span className="font-semibold">{data.engagement.averageEngagement.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-semibold">{formatPercentage(data.engagement.conversionRate)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Connections</CardTitle>
                <CardDescription>Live connection statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Connections</span>
                  <span className="font-semibold">{data.realTime.connections.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Connections</span>
                  <span className="font-semibold">{data.realTime.connections.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Duration</span>
                  <span className="font-semibold">
                    {Math.round(data.realTime.connections.averageDuration / 1000)}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="font-semibold">{formatPercentage(data.realTime.connections.errorRate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Features */}
          <Card>
            <CardHeader>
              <CardTitle>Top Features</CardTitle>
              <CardDescription>Most used features by engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.engagement.topFeatures.slice(0, 5).map((feature, index) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <span className="text-sm">{feature.feature}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (feature.usage / data.engagement.topFeatures[0]?.usage || 1) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {formatNumber(feature.usage)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Wishlist Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.events.wishlist.slice(0, 5).map((event) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <span className="text-sm">{event.event.replace('wishlist_', '')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(event.percentage)}
                        </span>
                        <span className="font-semibold">{event.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.events.activity.slice(0, 5).map((event) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <span className="text-sm">{event.event.replace('activity_', '')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(event.percentage)}
                        </span>
                        <span className="font-semibold">{event.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Search Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.events.search.slice(0, 5).map((event) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <span className="text-sm">{event.event.replace('search_', '')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(event.percentage)}
                        </span>
                        <span className="font-semibold">{event.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Navigation Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.events.navigation.slice(0, 5).map((event) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <span className="text-sm">{event.event}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(event.percentage)}
                        </span>
                        <span className="font-semibold">{event.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Health */}
            {data.realTime.systemHealth && (
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-semibold">
                      {formatPercentage(data.realTime.systemHealth.memoryUsage.percentage)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-semibold">{data.realTime.systemHealth.activeConnections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-semibold">{data.realTime.systemHealth.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Throughput</span>
                    <span className="font-semibold">{data.realTime.systemHealth.throughput}/min</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connection Types */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Types</CardTitle>
                <CardDescription>Breakdown by connection type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.realTime.connections.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Error Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Error Statistics</CardTitle>
                <CardDescription>Last hour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Errors</span>
                  <span className="font-semibold">{data.errors.stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolved</span>
                  <span className="font-semibold text-green-600">{data.errors.stats.resolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unresolved</span>
                  <span className="font-semibold text-red-600">{data.errors.stats.unresolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="font-semibold">{formatPercentage(data.errors.stats.errorRate)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Error by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.errors.stats.byLevel).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <Badge variant={getStatusColor(level) as any} className="capitalize">
                        {level}
                      </Badge>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Error by Component */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.errors.stats.byComponent).map(([component, count]) => (
                    <div key={component} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{component}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Unresolved errors requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.errors.recentErrors.slice(0, 10).map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={getStatusColor(error.level) as any}>
                          {error.level}
                        </Badge>
                        {error.component && (
                          <Badge variant="outline">{error.component}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{error.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {error.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveError(error.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health Alerts */}
          {data.errors.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>System Health Alerts</CardTitle>
                <CardDescription>Active system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.errors.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getStatusColor(alert.severity) as any}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.acknowledged ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}