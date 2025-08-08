'use client';

import { UserAnalytics } from '@/types/auth';

interface AnalyticsMetricsProps {
  analytics: UserAnalytics;
}

export function AnalyticsMetrics({ analytics }: AnalyticsMetricsProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    } else {
      return `${Math.round(seconds / 3600)}h`;
    }
  };

  const metrics = [
    {
      label: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      icon: '👁️',
      color: 'blue'
    },
    {
      label: 'Unique Properties',
      value: analytics.uniqueProperties.toLocaleString(),
      icon: '🏠',
      color: 'green'
    },
    {
      label: 'Avg. Session',
      value: formatDuration(analytics.averageSessionDuration),
      icon: '⏱️',
      color: 'purple'
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.conversionMetrics.conversionRate.toFixed(1)}%`,
      icon: '📈',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getColorClasses(metric.color)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{metric.icon}</span>
            <div className="text-right">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm opacity-75">{metric.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}