"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import Script from 'next/script';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Refs to store chart instances
  const chartRefs = useRef<{[key: string]: any}>({});
  const [stats, setStats] = useState({
    preleased: 25,
    vacant: 10,
    franchise: 10,
    total: 45
  });

  // Cleanup function to destroy charts
  const cleanupCharts = () => {
    Object.values(chartRefs.current).forEach((chart: any) => {
      if (chart) {
        chart.destroy();
      }
    });
    // Reset chart references
    chartRefs.current = {};
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsLoading(false);
      initCharts();
    }

    // Cleanup charts on component unmount
    return () => {
      cleanupCharts();
    };
  }, [router]);

  // Initialize charts once the component is mounted
  const initCharts = () => {
    if (typeof window === 'undefined') return;
    
    // Clean up existing charts first
    cleanupCharts();
    
    // Import Chart.js dynamically on the client side
    import('chart.js').then(({ Chart, registerables }) => {
      // Register all chart types, scales, etc.
      Chart.register(...registerables);
      
      setTimeout(() => {
        try {
          // Category chart
          const ctx1 = document.getElementById('categoryChart') as HTMLCanvasElement;
          if (ctx1) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.categoryChart) {
              chartRefs.current.categoryChart.destroy();
            }
            
            chartRefs.current.categoryChart = new Chart(ctx1, {
              type: 'bar',
              data: {
                labels: ['Commercial', 'Office Space', 'Retail', 'Industrial', 'Hospitality'],
                datasets: [{
                  label: 'Pre-leased Properties by Category',
                  data: [12, 19, 8, 5, 2],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          }

          // Summary chart
          const ctx2 = document.getElementById('summaryChart') as HTMLCanvasElement;
          if (ctx2) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.summaryChart) {
              chartRefs.current.summaryChart.destroy();
            }
            
            chartRefs.current.summaryChart = new Chart(ctx2, {
              type: 'doughnut',
              data: {
                labels: ['Pre-leased', 'Vacant', 'Franchise'],
                datasets: [{
                  data: [stats.preleased, stats.vacant, stats.franchise],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 205, 86, 0.7)'
                  ],
                  borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
            });
          }

          // Property status chart
          const ctx3 = document.getElementById('statusChart') as HTMLCanvasElement;
          if (ctx3) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.statusChart) {
              chartRefs.current.statusChart.destroy();
            }
            
            chartRefs.current.statusChart = new Chart(ctx3, {
              type: 'pie',
              data: {
                labels: ['Available', 'Sold', 'Under Contract'],
                datasets: [{
                  data: [15, 5, 7],
                  backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                  ],
                  borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
            });
          }

          // Rental type chart
          const ctx4 = document.getElementById('rentalChart') as HTMLCanvasElement;
          if (ctx4) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.rentalChart) {
              chartRefs.current.rentalChart.destroy();
            }
            
            chartRefs.current.rentalChart = new Chart(ctx4, {
              type: 'pie',
              data: {
                labels: ['Monthly', 'Yearly', 'Long Term'],
                datasets: [{
                  data: [7, 14, 4],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 205, 86, 0.7)'
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
            });
          }

          // Channel chart
          const ctx5 = document.getElementById('channelChart') as HTMLCanvasElement;
          if (ctx5) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.channelChart) {
              chartRefs.current.channelChart.destroy();
            }
            
            chartRefs.current.channelChart = new Chart(ctx5, {
              type: 'pie',
              data: {
                labels: ['Direct', 'Broker', 'Website', 'Referral'],
                datasets: [{
                  data: [12, 8, 3, 2],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 205, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                  ],
                  borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
            });
          }
        } catch (err) {
          console.error('Error initializing charts:', err);
          setError('Failed to load charts. Please refresh the page.');
        }
      }, 500);
    }).catch(err => {
      console.error('Failed to load Chart.js:', err);
      setError('Failed to load charts library. Please refresh the page.');
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of properties and insights</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      ) : (
        <>
          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Category Pre-leased</h2>
                  <div className="dropdown">
                    {/* Dropdown could be implemented here */}
                  </div>
                </div>
                <div className="h-80">
                  <canvas id="categoryChart"></canvas>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Entry Summary</h2>
                  <div className="dropdown">
                    {/* Dropdown could be implemented here */}
                  </div>
                </div>
                <div className="h-56 mb-4">
                  <canvas id="summaryChart"></canvas>
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-700">Pre-leased</span>
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">{stats.preleased}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-700">Vacant</span>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{stats.vacant}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-700">Franchise</span>
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">{stats.franchise}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Entry</span>
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">{stats.total}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Property Status</h2>
                  <div className="dropdown">
                    {/* Dropdown could be implemented here */}
                  </div>
                </div>
                <div className="h-64">
                  <canvas id="statusChart"></canvas>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Rental Type</h2>
                  <div className="dropdown">
                    {/* Dropdown could be implemented here */}
                  </div>
                </div>
                <div className="h-64">
                  <canvas id="rentalChart"></canvas>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Channel</h2>
                  <div className="dropdown">
                    {/* Dropdown could be implemented here */}
                  </div>
                </div>
                <div className="h-64">
                  <canvas id="channelChart"></canvas>
                </div>
              </div>
                    </div>
        </div>
        </>
      )}
    </AdminLayout>
  );
} 