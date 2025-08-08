'use client';

import { useEffect, useRef } from 'react';
import { UserAnalytics } from '@/types/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsChartsProps {
  analytics: UserAnalytics;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  // Prepare activity timeline data
  const activityData = {
    labels: analytics.activityByDay.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Property Views',
        data: analytics.activityByDay.map(day => day.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Searches',
        data: analytics.activityByDay.map(day => day.searches),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Wishlist Actions',
        data: analytics.activityByDay.map(day => day.wishlistActions),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Prepare property types data
  const propertyTypesData = {
    labels: analytics.favoritePropertyTypes.slice(0, 5).map(type => type.type),
    datasets: [
      {
        data: analytics.favoritePropertyTypes.slice(0, 5).map(type => type.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Prepare locations data
  const locationsData = {
    labels: analytics.preferredLocations.slice(0, 8).map(loc => loc.location),
    datasets: [
      {
        label: 'Views',
        data: analytics.preferredLocations.slice(0, 8).map(loc => loc.count),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Activity Timeline */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Daily Activity (Last 30 Days)</h4>
        <div className="h-64">
          <Line data={activityData} options={chartOptions} />
        </div>
      </div>

      {/* Property Types and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Types */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Favorite Property Types</h4>
          {analytics.favoritePropertyTypes.length > 0 ? (
            <div className="h-64">
              <Doughnut data={propertyTypesData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div>No property type data yet</div>
                <div className="text-sm">Start viewing properties to see your preferences</div>
              </div>
            </div>
          )}
        </div>

        {/* Preferred Locations */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Preferred Locations</h4>
          {analytics.preferredLocations.length > 0 ? (
            <div className="h-64">
              <Bar data={locationsData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📍</div>
                <div>No location data yet</div>
                <div className="text-sm">Start viewing properties to see your preferences</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}