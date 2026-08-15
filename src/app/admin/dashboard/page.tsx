"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import {
  TbBuildingSkyscraper, TbHome, TbBuildingStore, TbChartBar,
  TbTrendingUp, TbClipboardCheck, TbBuilding, TbShoppingBag, TbMapPin,
} from 'react-icons/tb';
import ClientOnly from '@/components/ClientOnly';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminCard, SkeletonLoader } from '@/components/admin/ui';

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
  const segmentData = data?.segmentData || { labels: [], data: [] };
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

        const categoryEl = document.getElementById('segmentChart') as HTMLCanvasElement;
        const summaryEl = document.getElementById('summaryChart') as HTMLCanvasElement;
        const franchiseEl = document.getElementById('franchiseChart') as HTMLCanvasElement;

        // Shared tooltip config
        const tooltipConfig = {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleFont: { family: 'Jost', weight: 'bold' as const, size: 13 },
          bodyFont: { family: 'Jost', size: 12 },
          padding: { top: 10, bottom: 10, left: 14, right: 14 },
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 6,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
        };

        // Shared legend config
        const legendConfig = {
          display: false,
        };

        if (categoryEl && segmentData.data.some(v => v > 0)) {
          chartRefs.current.segmentChart = new Chart(categoryEl, {
            type: 'doughnut',
            data: {
              labels: segmentData.labels,
              datasets: [{
                data: segmentData.data,
                backgroundColor: [
                  'rgba(37, 99, 235, 0.9)',
                  'rgba(6, 182, 212, 0.9)',
                  'rgba(139, 92, 246, 0.9)',
                  'rgba(245, 158, 11, 0.9)',
                  'rgba(239, 68, 68, 0.9)',
                  'rgba(16, 185, 129, 0.9)',
                  'rgba(236, 72, 153, 0.9)',
                  'rgba(234, 179, 8, 0.9)',
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 12,
                hoverBorderWidth: 0,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1,
              cutout: '62%',
              layout: { padding: 12 },
              plugins: {
                legend: legendConfig,
                tooltip: {
                  ...tooltipConfig,
                  callbacks: {
                    label: function(ctx) {
                      const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                      const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                      return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                    },
                  },
                },
              },
              animation: { animateRotate: true, animateScale: true, duration: 900 },
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
                  'rgba(37, 99, 235, 0.9)',
                  'rgba(16, 185, 129, 0.9)',
                  'rgba(245, 158, 11, 0.9)',
                  'rgba(139, 92, 246, 0.9)',
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 12,
                hoverBorderWidth: 0,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1,
              cutout: '62%',
              layout: { padding: 12 },
              plugins: {
                legend: legendConfig,
                tooltip: {
                  ...tooltipConfig,
                  callbacks: {
                    label: function(ctx) {
                      const pct = stats.total > 0 ? ((ctx.parsed / stats.total) * 100).toFixed(1) : '0';
                      return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                    },
                  },
                },
              },
              animation: { animateRotate: true, animateScale: true, duration: 900 },
            },
          });
        }

        if (franchiseEl && franchiseData.data.some(v => v > 0)) {
          // Create gradient fills for bar chart
          const fCtx = franchiseEl.getContext('2d');
          const barColors = ['#2563eb', '#ef4444', '#ec4899', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981'];
          const bgColors = barColors.map((color) => {
            const gradient = fCtx.createLinearGradient(0, 0, 0, 280);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '66');
            return gradient;
          });

          // Value label plugin
          const valueLabelPlugin = {
            id: 'valueLabels',
            afterDatasetsDraw(chart: any) {
              const { ctx } = chart;
              const meta = chart.getDatasetMeta(0);
              meta.data.forEach((bar: any, i: number) => {
                const value = chart.data.datasets[0].data[i];
                if (value > 0) {
                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  ctx.font = '600 12px Jost, sans-serif';
                  ctx.fillStyle = '#334155';
                  ctx.fillText(String(value), bar.x, bar.y - 8);
                  ctx.restore();
                }
              });
            },
          };

          chartRefs.current.franchiseChart = new Chart(franchiseEl, {
            type: 'bar',
            data: {
              labels: franchiseData.labels,
              datasets: [{
                label: 'Franchises by Industry',
                data: franchiseData.data,
                backgroundColor: bgColors,
                borderWidth: 0,
                borderRadius: 10,
                borderSkipped: false,
                barPercentage: 0.55,
                categoryPercentage: 0.75,
              }],
            },
            plugins: [valueLabelPlugin],
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 30, bottom: 0, left: 0, right: 0 } },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...tooltipConfig,
                  callbacks: {
                    title: (items: any) => items[0]?.label || '',
                    label: (ctx: any) => ` ${ctx.parsed.y} franchises`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 20,
                    font: { family: 'Jost', size: 11 },
                    color: '#94a3b8',
                    padding: 8,
                  },
                  border: { display: false },
                  grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false },
                },
                x: {
                  ticks: {
                    font: { family: 'Jost', size: 11 },
                    color: '#64748b',
                    padding: 8,
                  },
                  border: { display: false },
                  grid: { display: false },
                },
              },
              animation: { duration: 1000, easing: 'easeOutQuart' },
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

  const hasSegmentData = segmentData.data?.some((v: number) => v > 0);
  const hasFranchiseData = franchiseData.data?.some((v: number) => v > 0);

  // Stat card configs with inline gradient styles and icons
  const statCards = [
    {
      label: 'Pre-Leased',
      value: stats.preleased,
      icon: <TbBuildingSkyscraper className="text-xl" />,
      style: { background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)' },
      iconBg: 'rgba(255,255,255,0.2)',
      subtitle: stats.total > 0 ? `${((stats.preleased / stats.total) * 100).toFixed(1)}% of total` : 'No data',
    },
    {
      label: 'Vacant',
      value: stats.vacant,
      icon: <TbHome className="text-xl" />,
      style: { background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)' },
      iconBg: 'rgba(255,255,255,0.2)',
      subtitle: stats.total > 0 ? `${((stats.vacant / stats.total) * 100).toFixed(1)}% of total` : 'No data',
    },
    {
      label: 'Franchise',
      value: stats.franchise,
      icon: <TbBuildingStore className="text-xl" />,
      style: { background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #fb7185 100%)' },
      iconBg: 'rgba(255,255,255,0.2)',
      subtitle: stats.total > 0 ? `${((stats.franchise / stats.total) * 100).toFixed(1)}% of total` : 'No data',
    },
    {
      label: 'Total Properties',
      value: stats.total,
      icon: <TbChartBar className="text-xl" />,
      style: { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)' },
      iconBg: 'rgba(255,255,255,0.2)',
      subtitle: 'All property types',
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of property listings and analytics</p>
      </div>

      {/* Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={card.style}
          >
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  {card.label}
                </p>
                <div className="w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center ring-4 ring-white/20" style={{ background: card.iconBg }}>
                  {card.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
              <p className="text-xs text-white/70 mt-1.5">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Segment chart */}
        <div className="group relative rounded-3xl transition-all duration-300 bg-white border-2 border-purple-100/50 shadow-lg shadow-purple-100/20 hover:shadow-2xl hover:shadow-purple-200/30 hover:border-purple-200 p-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/30 via-pink-50/20 to-transparent rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-50/40 to-transparent rounded-full blur-2xl -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <TbBuildingStore className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Franchise by Segment
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">Distribution by business segment</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-64 w-full max-w-[256px] mx-auto flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-white to-pink-50/20 rounded-2xl border border-purple-100/50 backdrop-blur-sm mb-6">
              {hasSegmentData ? (
                <canvas id="segmentChart" />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <TbBuildingStore className="text-4xl text-gray-300" />
                  </div>
                  <p className="text-base font-semibold text-gray-600">No segment data available</p>
                  <p className="text-sm mt-2 text-gray-500">Add franchises with segment info</p>
                </div>
              )}
            </div>
            
            {hasSegmentData && (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {segmentData.labels.map((label: string, i: number) => {
                  const colors = [
                    { bg: 'from-blue-500 to-blue-600', text: 'text-blue-700', lightBg: 'bg-blue-50', ringColor: 'ring-blue-200/60', shadowColor: 'shadow-blue-500/10' },
                    { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-700', lightBg: 'bg-cyan-50', ringColor: 'ring-cyan-200/60', shadowColor: 'shadow-cyan-500/10' },
                    { bg: 'from-purple-500 to-purple-600', text: 'text-purple-700', lightBg: 'bg-purple-50', ringColor: 'ring-purple-200/60', shadowColor: 'shadow-purple-500/10' },
                    { bg: 'from-amber-500 to-amber-600', text: 'text-amber-700', lightBg: 'bg-amber-50', ringColor: 'ring-amber-200/60', shadowColor: 'shadow-amber-500/10' },
                    { bg: 'from-rose-500 to-rose-600', text: 'text-rose-700', lightBg: 'bg-rose-50', ringColor: 'ring-rose-200/60', shadowColor: 'shadow-rose-500/10' },
                    { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-700', lightBg: 'bg-emerald-50', ringColor: 'ring-emerald-200/60', shadowColor: 'shadow-emerald-500/10' },
                    { bg: 'from-pink-500 to-pink-600', text: 'text-pink-700', lightBg: 'bg-pink-50', ringColor: 'ring-pink-200/60', shadowColor: 'shadow-pink-500/10' },
                    { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-700', lightBg: 'bg-yellow-50', ringColor: 'ring-yellow-200/60', shadowColor: 'shadow-yellow-500/10' },
                  ];
                  const colorSet = colors[i % 8];
                  
                  return (
                    <div 
                      key={label} 
                      className={`flex items-center justify-between px-4 py-3 rounded-xl ${colorSet.lightBg} ring-1 ${colorSet.ringColor} hover:scale-[1.02] hover:shadow-md ${colorSet.shadowColor} transition-all duration-200 cursor-default group/item`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colorSet.bg} shadow-lg flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200`} />
                        <span className={`text-sm font-semibold ${colorSet.text} truncate`}>{label}</span>
                      </div>
                      <div className={`ml-3 px-3 py-1 rounded-lg bg-white/80 shadow-sm flex-shrink-0`}>
                        <span className={`text-sm font-bold ${colorSet.text}`}>
                          {segmentData.data[i]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary chart */}
        <div className="group relative rounded-3xl transition-all duration-300 bg-white border-2 border-emerald-100/50 shadow-lg shadow-emerald-100/20 hover:shadow-2xl hover:shadow-emerald-200/30 hover:border-emerald-200 p-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/30 via-teal-50/20 to-transparent rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-50/40 to-transparent rounded-full blur-2xl -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <TbTrendingUp className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Property Distribution
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">Overview of all property types</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-64 w-full max-w-[256px] mx-auto flex items-center justify-center bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 rounded-2xl border border-emerald-100/50 backdrop-blur-sm mb-6">
              {stats.total > 0 ? (
                <canvas id="summaryChart" />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <TbTrendingUp className="text-4xl text-gray-300" />
                  </div>
                  <p className="text-base font-semibold text-gray-600">No property data</p>
                  <p className="text-sm mt-2 text-gray-500">Add properties to see distribution</p>
                </div>
              )}
            </div>
            
            {stats.total > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    label: 'Pre-leased', 
                    value: stats.preleased, 
                    gradient: 'from-blue-500 via-blue-600 to-indigo-600', 
                    icon: TbClipboardCheck, 
                    shadow: 'shadow-blue-500/20' 
                  },
                  { 
                    label: 'Vacant', 
                    value: stats.vacant, 
                    gradient: 'from-emerald-500 via-emerald-600 to-teal-600', 
                    icon: TbBuilding, 
                    shadow: 'shadow-emerald-500/20' 
                  },
                  { 
                    label: 'Franchise', 
                    value: stats.franchise, 
                    gradient: 'from-amber-500 via-amber-600 to-orange-600', 
                    icon: TbShoppingBag, 
                    shadow: 'shadow-amber-500/20' 
                  },
                  { 
                    label: 'Plots', 
                    value: stats.plots, 
                    gradient: 'from-violet-500 via-violet-600 to-purple-600', 
                    icon: TbMapPin, 
                    shadow: 'shadow-violet-500/20' 
                  },
                ].map(item => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={item.label} 
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-5 hover:scale-[1.03] transition-all duration-300 cursor-default group/card shadow-lg ${item.shadow} hover:shadow-xl`}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <IconComponent className="text-white text-2xl" />
                          </div>
                          <div className="text-sm font-bold text-white/90 bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {item.value}
                          </div>
                        </div>
                        <div className="text-4xl font-black text-white mb-2 tracking-tight">
                          {stats.total > 0 ? `${((item.value / stats.total) * 100).toFixed(1)}%` : '0%'}
                        </div>
                        <div className="text-sm font-bold text-white/90 uppercase tracking-wider">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/75 mt-1.5 font-medium">
                          {item.value} {item.value === 1 ? 'property' : 'properties'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Franchise chart */}
      <div className="group relative rounded-3xl transition-all duration-300 bg-white border-2 border-indigo-100/50 shadow-lg shadow-indigo-100/20 hover:shadow-2xl hover:shadow-indigo-200/30 hover:border-indigo-200 p-8 mb-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/30 via-purple-50/20 to-transparent rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-50/40 to-transparent rounded-full blur-2xl -z-0" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <TbBuildingStore className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Franchise by Industry
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5 font-medium">Industry-wise franchise distribution</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-80 relative bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 rounded-2xl border border-indigo-100/50 backdrop-blur-sm p-6">
            {hasFranchiseData ? (
              <canvas id="franchiseChart" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <TbBuildingStore className="text-4xl text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-600">No franchise data</p>
                <p className="text-sm mt-2 text-gray-500">Add franchises to see industry breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error.message || 'Failed to load dashboard data'}
        </div>
      )}
    </div>
  );
}
