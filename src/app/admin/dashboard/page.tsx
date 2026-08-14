"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import { FaChartBar, FaStore, FaBuilding, FaHome } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminStat, AdminCard, SkeletonLoader } from '@/components/admin/ui';

declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={<SkeletonLoader type="stats" className="mb-6" />}
      >
        <AdminDashboardContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const chartRefs = useRef<{[key: string]: any}>({});

  // Fetch dashboard stats — no redundant auth check (AdminLayout handles it)
  const { data, isLoading, error } = useAdminData('/api/admin/dashboard-stats', {
    onError: (err) => {
      if (err.message === 'Session expired') {
        router.push('/admin/login');
      }
    },
  });

  const stats = data?.stats || { preleased: 0, vacant: 0, franchise: 0, plots: 0, total: 0 };
  const categoryData = data?.categoryData || { labels: [], data: [] };
  const franchiseData = data?.franchiseData || { labels: [], data: [] };

  // Chart initialization
  useEffect(() => {
    if (isLoading || !data) return;

    let destroyed = false;

    const initCharts = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (destroyed) return;

      // Cleanup existing
      Object.values(chartRefs.current).forEach((chart: any) => chart?.destroy());
      chartRefs.current = {};

      setTimeout(() => {
        if (destroyed) return;

        const categoryEl = document.getElementById('categoryChart') as HTMLCanvasElement;
        const summaryEl = document.getElementById('summaryChart') as HTMLCanvasElement;
        const franchiseEl = document.getElementById('franchiseChart') as HTMLCanvasElement;

        const brandColors = {
          primary: '#154D71',
          secondary: '#1C6EA4',
          accent: '#33A1E0',
          highlight: '#FFF9AF',
        };

        if (categoryEl && categoryData.data.some(v => v > 0)) {
          chartRefs.current.categoryChart = new Chart(categoryEl, {
            type: 'doughnut',
            data: {
              labels: categoryData.labels,
              datasets: [{
                data: categoryData.data,
                backgroundColor: [
                  'rgba(21, 77, 113, 0.85)',
                  'rgba(28, 110, 164, 0.85)',
                  'rgba(51, 161, 224, 0.85)',
                  'rgba(139, 92, 246, 0.85)',
                  'rgba(107, 114, 128, 0.85)',
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1.5,
              cutout: '60%',
              plugins: {
                legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, font: { size: 11, family: 'Jost' } } },
                tooltip: {
                  backgroundColor: 'rgba(21, 77, 113, 0.95)',
                  titleFont: { family: 'Jost' },
                  bodyFont: { family: 'Jost' },
                  padding: 10,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(ctx) {
                      const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                      const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                      return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                    },
                  },
                },
              },
              animation: { animateRotate: true, animateScale: true, duration: 800 },
            },
          });
        }

        if (summaryEl && stats.total > 0) {
          chartRefs.current.summaryChart = new Chart(summaryEl, {
            type: 'doughnut',
            data: {
              labels: ['Pre-leased', 'Vacant', 'Franchise', 'Plots'],
              datasets: [{
                data: [stats.preleased, stats.vacant, stats.franchise, stats.plots],
                backgroundColor: [
                  'rgba(21, 77, 113, 0.85)',
                  'rgba(51, 161, 224, 0.85)',
                  'rgba(255, 249, 175, 0.85)',
                  'rgba(28, 110, 164, 0.85)',
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1.5,
              cutout: '60%',
              plugins: {
                legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, font: { size: 11, family: 'Jost' } } },
                tooltip: {
                  backgroundColor: 'rgba(21, 77, 113, 0.95)',
                  titleFont: { family: 'Jost' },
                  bodyFont: { family: 'Jost' },
                  padding: 10,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(ctx) {
                      const pct = stats.total > 0 ? ((ctx.parsed / stats.total) * 100).toFixed(1) : '0';
                      return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                    },
                  },
                },
              },
              animation: { animateRotate: true, animateScale: true, duration: 800 },
            },
          });
        }

        if (franchiseEl && franchiseData.data.some(v => v > 0)) {
          chartRefs.current.franchiseChart = new Chart(franchiseEl, {
            type: 'bar',
            data: {
              labels: franchiseData.labels,
              datasets: [{
                label: 'Franchises by Industry',
                data: franchiseData.data,
                backgroundColor: [
                  'rgba(21, 77, 113, 0.85)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(51, 161, 224, 0.85)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(107, 114, 128, 0.8)',
                ],
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(21, 77, 113, 0.95)',
                  titleFont: { family: 'Jost' },
                  bodyFont: { family: 'Jost' },
                  padding: 10,
                  cornerRadius: 8,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, font: { family: 'Jost', size: 11 } },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
                x: {
                  ticks: { maxRotation: 45, font: { family: 'Jost', size: 11 } },
                  grid: { display: false },
                },
              },
              animation: { duration: 800, easing: 'easeOutQuart' },
            },
          });
        }
      }, 50);
    };

    initCharts();

    return () => {
      destroyed = true;
      Object.values(chartRefs.current).forEach((chart: any) => chart?.destroy());
      chartRefs.current = {};
    };
  }, [isLoading, data]);

  // Bitdefender cleanup
  useEffect(() => {
    if (window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <div className="admin-skeleton h-7 w-48 mb-2" />
          <div className="admin-skeleton h-4 w-64" />
        </div>
        <SkeletonLoader type="stats" className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonLoader type="chart" />
          <SkeletonLoader type="chart" />
        </div>
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  const hasCategoryData = categoryData.data?.some((v: number) => v > 0);
  const hasFranchiseData = franchiseData.data?.some((v: number) => v > 0);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of property listings and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStat
          label="Pre-Leased"
          value={stats.preleased}
          icon={<FaBuilding className="text-lg" />}
          color="primary"
          subtitle={stats.total > 0 ? `${((stats.preleased / stats.total) * 100).toFixed(1)}% of total` : 'No data'}
        />
        <AdminStat
          label="Vacant"
          value={stats.vacant}
          icon={<FaHome className="text-lg" />}
          color="accent"
          subtitle={stats.total > 0 ? `${((stats.vacant / stats.total) * 100).toFixed(1)}% of total` : 'No data'}
        />
        <AdminStat
          label="Franchise"
          value={stats.franchise}
          icon={<FaStore className="text-lg" />}
          color="warning"
          subtitle={stats.total > 0 ? `${((stats.franchise / stats.total) * 100).toFixed(1)}% of total` : 'No data'}
        />
        <AdminStat
          label="Total Properties"
          value={stats.total}
          icon={<FaChartBar className="text-lg" />}
          color="secondary"
          subtitle="All property types"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category chart */}
        <AdminCard>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Vacant by Category</h2>
          <div className="h-52 flex items-center justify-center">
            {hasCategoryData ? (
              <canvas id="categoryChart" />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm font-medium">No category data available</p>
                <p className="text-xs mt-1">Add vacant properties with category info</p>
              </div>
            )}
          </div>
          {hasCategoryData && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-3 text-xs">
                {categoryData.labels.map((label: string, i: number) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: [
                          'rgba(21, 77, 113, 0.85)',
                          'rgba(28, 110, 164, 0.85)',
                          'rgba(51, 161, 224, 0.85)',
                          'rgba(139, 92, 246, 0.85)',
                          'rgba(107, 114, 128, 0.85)',
                        ][i % 5],
                      }}
                    />
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">({categoryData.data[i]})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AdminCard>

        {/* Summary chart */}
        <AdminCard>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Property Distribution</h2>
          <div className="h-52 flex items-center justify-center">
            {stats.total > 0 ? (
              <canvas id="summaryChart" />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm font-medium">No property data</p>
                <p className="text-xs mt-1">Add properties to see distribution</p>
              </div>
            )}
          </div>
          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Pre-leased', value: stats.preleased, color: 'bg-primary-50 text-primary-600' },
                  { label: 'Vacant', value: stats.vacant, color: 'bg-accent-50 text-accent-600' },
                  { label: 'Franchise', value: stats.franchise, color: 'bg-amber-50 text-amber-600' },
                  { label: 'Plots', value: stats.plots, color: 'bg-secondary-50 text-secondary-600' },
                ].map(item => (
                  <div key={item.label} className={`text-center py-2 px-3 rounded-lg ${item.color}`}>
                    <div className="text-lg font-bold">{((item.value / stats.total) * 100).toFixed(1)}%</div>
                    <div className="text-xs opacity-70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Franchise chart */}
      <AdminCard className="mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Franchise by Industry</h2>
        <div className="h-64 relative">
          {hasFranchiseData ? (
            <canvas id="franchiseChart" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-2">🏪</div>
              <p className="text-sm font-medium">No franchise data</p>
              <p className="text-xs mt-1">Add franchises to see industry breakdown</p>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error.message || 'Failed to load dashboard data'}
        </div>
      )}
    </div>
  );
}
