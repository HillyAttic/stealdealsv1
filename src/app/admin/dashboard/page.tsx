"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  TbBuildingSkyscraper, TbHome, TbBuildingStore, TbChartBar,
  TbTrendingUp, TbClipboardCheck, TbBuilding, TbShoppingBag, TbMapPin,
} from 'react-icons/tb';
import ClientOnly from '@/components/ClientOnly';
import { useAdminData } from '@/hooks/useAdminData';
import { SkeletonLoader } from '@/components/admin/ui';
import './cobalt.css';

declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

const SHELL = 'cobalt-page';

// One source for the doughnut, the legend dots and the bar ramp.
const SEGMENT_COLORS = [
  '--color-accent-deep', '--color-accent-2', '--color-accent', '--color-glyph-3',
  '--color-glyph-4', '--color-graphite-muted', '--color-ink-2', '--color-muted',
];

export default function AdminDashboard() {
  return (
    <>
      <ClientOnly
        fallback={<SkeletonLoader type="stats" className="mb-6" />}
      >
        <AdminDashboardContent />
      </ClientOnly>
    </>
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

      const root = document.querySelector<HTMLElement>('[data-theme="cobalt"]');
      const rootStyle = getComputedStyle(root ?? document.documentElement);
      const tok = (name: string) => rootStyle.getPropertyValue(name).trim();
      const colors = SEGMENT_COLORS.map(tok);
      const paper = tok('--color-paper');
      const ink = tok('--color-ink');
      const ink2 = tok('--color-ink-2');
      const graphiteInk = tok('--color-graphite-ink');
      const graphiteMuted = tok('--color-graphite-muted');
      const graphiteGrid = tok('--color-graphite-2');
      const fontDisplay = tok('--font-display');
      const fontBody = tok('--font-body');
      const fontMono = tok('--font-outlier');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const tooltipBase = {
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        boxPadding: 6,
        borderWidth: 1,
        titleFont: { family: fontDisplay, weight: 600, size: 13 },
        bodyFont: { family: fontBody, size: 12 },
      };
      const lightTooltip = {
        ...tooltipBase,
        backgroundColor: tok('--color-graphite-2'),
        titleColor: paper,
        bodyColor: paper,
        borderColor: tok('--color-rule-2'),
      };
      const darkTooltip = {
        ...tooltipBase,
        backgroundColor: paper,
        titleColor: ink,
        bodyColor: ink2,
        borderColor: tok('--color-rule-2'),
      };

      const doughnutOptions = (tooltip: any, label: (ctx: any) => string) => ({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '64%',
        layout: { padding: 8 },
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltip, callbacks: { label } },
        },
        animation: reduced ? false : { animateRotate: true, animateScale: true, duration: 700 },
      });

      setTimeout(() => {
        if (destroyed) return;

        const categoryEl = document.getElementById('segmentChart') as HTMLCanvasElement;
        const summaryEl = document.getElementById('summaryChart') as HTMLCanvasElement;
        const franchiseEl = document.getElementById('franchiseChart') as HTMLCanvasElement;

        if (categoryEl && segmentData.data.some(v => v > 0)) {
          chartRefs.current.segmentChart = new Chart(categoryEl, {
            type: 'doughnut',
            data: {
              labels: segmentData.labels,
              datasets: [{
                data: segmentData.data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: paper,
                hoverOffset: 6,
                hoverBorderWidth: 2,
              }],
            },
            options: doughnutOptions(lightTooltip, (ctx) => {
              const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }),
          });
        }

        if (summaryEl && stats.total > 0) {
          chartRefs.current.summaryChart = new Chart(summaryEl, {
            type: 'doughnut',
            data: {
              labels: ['Pre-leased', 'Vacant', 'Franchise', 'Plots'],
              datasets: [{
                data: [stats.preleased, stats.vacant, stats.franchise, stats.plots],
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: paper,
                hoverOffset: 6,
                hoverBorderWidth: 2,
              }],
            },
            options: doughnutOptions(lightTooltip, (ctx) => {
              const pct = stats.total > 0 ? ((ctx.parsed / stats.total) * 100).toFixed(1) : '0';
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }),
          });
        }

        if (franchiseEl && franchiseData.data.some(v => v > 0)) {
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
                  ctx.font = `500 12px ${fontMono}`;
                  ctx.fillStyle = graphiteInk;
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
                backgroundColor: tok('--color-accent-2'),
                hoverBackgroundColor: tok('--color-accent'),
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.62,
                categoryPercentage: 0.8,
              }],
            },
            plugins: [valueLabelPlugin],
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 32, bottom: 8, left: 8, right: 8 } },
              plugins: {
                legend: { display: false },
                tooltip: {
                  ...darkTooltip,
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
                    font: { family: fontMono, size: 12 },
                    color: graphiteMuted,
                    padding: 8,
                  },
                  border: { display: false },
                  grid: { color: graphiteGrid, drawTicks: false },
                },
                x: {
                  ticks: {
                    font: { family: fontBody, size: 12 },
                    color: graphiteMuted,
                    padding: 8,
                  },
                  border: { display: false },
                  grid: { display: false },
                },
              },
              animation: reduced ? false : { duration: 600, easing: 'easeOutQuart' },
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
      <div data-theme="cobalt" className={SHELL}>
        <div className="page-head">
          <div>
            <div className="admin-skeleton h-7 w-48 mb-2" />
            <div className="admin-skeleton h-4 w-64" />
          </div>
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

  // Stat card configs — figures are the data's own, never decorated with invented trends
  const statCards = [
    {
      label: 'Pre-Leased',
      value: stats.preleased,
      icon: <TbBuildingSkyscraper size={16} aria-hidden="true" />,
      share: stats.total > 0 ? (stats.preleased / stats.total) * 100 : null,
    },
    {
      label: 'Vacant',
      value: stats.vacant,
      icon: <TbHome size={16} aria-hidden="true" />,
      share: stats.total > 0 ? (stats.vacant / stats.total) * 100 : null,
    },
    {
      label: 'Franchise',
      value: stats.franchise,
      icon: <TbBuildingStore size={16} aria-hidden="true" />,
      share: stats.total > 0 ? (stats.franchise / stats.total) * 100 : null,
    },
    {
      label: 'Total Properties',
      value: stats.total,
      icon: <TbChartBar size={16} aria-hidden="true" />,
      share: null,
    },
  ];

  const summaryItems = [
    { label: 'Pre-leased', value: stats.preleased, icon: TbClipboardCheck },
    { label: 'Vacant', value: stats.vacant, icon: TbBuilding },
    { label: 'Franchise', value: stats.franchise, icon: TbShoppingBag },
    { label: 'Plots', value: stats.plots, icon: TbMapPin },
  ];

  return (
    <div data-theme="cobalt" className={SHELL}>
      <header className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of property listings and analytics</p>
        </div>
      </header>

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map((card) => (
          <div key={card.label} className="panel stat">
            <p className="stat-label">
              {card.icon}
              {card.label}
            </p>
            <p className="stat-value">{card.value}</p>
            <p className="stat-foot">
              {card.share === null
                ? 'All property types'
                : `${card.share.toFixed(1)}% of total`}
            </p>
            {card.share !== null && (
              <div className="stat-meter" aria-hidden="true">
                <span style={{ width: `${card.share}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="chart-pair">
        {/* Segment chart */}
        <section className="panel">
          <header className="panel-head">
            <TbBuildingStore className="panel-icon" size={18} aria-hidden="true" />
            <div>
              <h2 className="panel-title">Franchise by Segment</h2>
              <p className="panel-sub">Distribution by business segment</p>
            </div>
          </header>

          <div className="chart-figure">
            {hasSegmentData ? (
              <canvas id="segmentChart" role="img" aria-label="Franchise count by business segment" />
            ) : (
              <div className="empty">
                <TbBuildingStore size={24} aria-hidden="true" />
                <p className="empty-title">No segment data available</p>
                <p className="empty-hint">Add franchises with segment info</p>
              </div>
            )}
          </div>

          {hasSegmentData && (
            <ul className="legend">
              {segmentData.labels.map((label: string, i: number) => (
                <li key={label} className="legend-row">
                  <span
                    className="legend-dot"
                    aria-hidden="true"
                    style={{ background: `var(${SEGMENT_COLORS[i % SEGMENT_COLORS.length]})` }}
                  />
                  <span className="legend-label">{label}</span>
                  <span className="legend-value">{segmentData.data[i]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Summary chart */}
        <section className="panel">
          <header className="panel-head">
            <TbTrendingUp className="panel-icon" size={18} aria-hidden="true" />
            <div>
              <h2 className="panel-title">Property Distribution</h2>
              <p className="panel-sub">Overview of all property types</p>
            </div>
          </header>

          <div className="chart-figure">
            {stats.total > 0 ? (
              <canvas id="summaryChart" role="img" aria-label="Property count by type" />
            ) : (
              <div className="empty">
                <TbTrendingUp size={24} aria-hidden="true" />
                <p className="empty-title">No property data</p>
                <p className="empty-hint">Add properties to see distribution</p>
              </div>
            )}
          </div>

          {stats.total > 0 && (
            <div className="summary-grid">
              {summaryItems.map((item) => {
                const IconComponent = item.icon;
                const pct = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                return (
                  <div key={item.label} className="summary-cell">
                    <p className="summary-top">
                      <IconComponent size={16} aria-hidden="true" />
                      {item.label}
                    </p>
                    <p className="summary-value">{pct.toFixed(1)}%</p>
                    <p className="summary-foot">
                      {item.value} {item.value === 1 ? 'property' : 'properties'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Franchise chart — the page's one graphite band */}
      <section className="panel panel--graphite">
        <header className="panel-head">
          <TbBuildingStore className="panel-icon" size={18} aria-hidden="true" />
          <div>
            <h2 className="panel-title">Franchise by Industry</h2>
            <p className="panel-sub">Industry-wise franchise distribution</p>
          </div>
        </header>

        <div className="chart-figure chart-figure--bar">
          {hasFranchiseData ? (
            <canvas id="franchiseChart" role="img" aria-label="Franchise count by industry" />
          ) : (
            <div className="empty">
              <TbBuildingStore size={24} aria-hidden="true" />
              <p className="empty-title">No franchise data</p>
              <p className="empty-hint">Add franchises to see industry breakdown</p>
            </div>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="cobalt-error">
          {error.message || 'Failed to load dashboard data'}
        </div>
      )}
    </div>
  );
}
