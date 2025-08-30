"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaChartBar, FaStore, FaBuilding, FaHome } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';
import { migratedPreleasedRef, migratedVacantRef, migratedFranchiseRef, migratedPlotsRef } from '@/lib/firebase';
import { get } from 'firebase/database';
import { RealTimeUserStats } from '@/components/admin/RealTimeUserStats';

// Add global type declaration for the window extension
declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard charts...</p>
          </div>
        }
      >
        <AdminDashboardContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Refs to store chart instances
  const chartRefs = useRef<{[key: string]: any}>({});
  const [stats, setStats] = useState({
    preleased: 0,
    vacant: 0,
    franchise: 0,
    plots: 0,
    total: 0
  });
  const [categoryData, setCategoryData] = useState({
    labels: ['Commercial', 'Office Space', 'Retail', 'Industrial', 'Hospitality'],
    data: [0, 0, 0, 0, 0]
  });
  
  const [franchiseData, setFranchiseData] = useState({
    labels: ['Food', 'Retail', 'Education', 'Healthcare', 'Services', 'Other'],
    data: [0, 0, 0, 0, 0, 0]
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

  // Function to make authenticated API calls
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important to include cookies
        headers: {
          ...(options.headers || {}),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
          router.push('/admin/login');
          throw new Error('Session expired');
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };

  // Fetch data from Firebase migrated structure
  const fetchData = async () => {
    try {
      // Get preleased properties count from migrated structure
      const preleasedSnapshot = await get(migratedPreleasedRef);
      const preleasedCount = preleasedSnapshot.exists() ? 
        Object.keys(preleasedSnapshot.val()).length : 0;
      
      // Get vacant properties count from migrated structure
      const vacantSnapshot = await get(migratedVacantRef);
      const vacantCount = vacantSnapshot.exists() ? 
        Object.keys(vacantSnapshot.val()).length : 0;
      
      // Get franchise properties count from migrated structure
      const franchiseSnapshot = await get(migratedFranchiseRef);
      const franchiseCount = franchiseSnapshot.exists() ? 
        Object.keys(franchiseSnapshot.val()).length : 0;
      
      // Get plots count from migrated structure
      const plotsSnapshot = await get(migratedPlotsRef);
      const plotsCount = plotsSnapshot.exists() ? 
        Object.keys(plotsSnapshot.val()).length : 0;
      
      // Calculate total
      const totalCount = preleasedCount + vacantCount + franchiseCount + plotsCount;
      
      // Update stats
      setStats({
        preleased: preleasedCount,
        vacant: vacantCount,
        franchise: franchiseCount,
        plots: plotsCount,
        total: totalCount
      });
      
      // Process category data for preleased properties
      if (preleasedSnapshot.exists()) {
        const categories: Record<string, number> = {
          'Commercial': 0,
          'Office Space': 0,
          'Retail': 0,
          'Industrial': 0,
          'Hospitality': 0
        };
        
        preleasedSnapshot.forEach((childSnapshot) => {
          const property = childSnapshot.val();
          const category = property.category;
          
          if (category && category in categories) {
            categories[category]++;
          }
        });
        
        // Update category data
        setCategoryData({
          labels: Object.keys(categories),
          data: Object.values(categories)
        });
      }

      // Process franchise data by industry
      if (franchiseSnapshot.exists()) {
        const franchiseCategories: Record<string, number> = {
          'Food': 0,
          'Retail': 0,
          'Education': 0,
          'Healthcare': 0,
          'Services': 0,
          'Other': 0
        };
        
        franchiseSnapshot.forEach((childSnapshot) => {
          const franchise = childSnapshot.val();
          const industry = franchise.industry;
          
          if (industry) {
            if (industry in franchiseCategories) {
              franchiseCategories[industry]++;
            } else {
              franchiseCategories['Other']++;
            }
          }
        });
        
        // Update franchise data
        setFranchiseData({
          labels: Object.keys(franchiseCategories),
          data: Object.values(franchiseCategories)
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    }
  };

  // Initialize charts once the component is mounted
  const initCharts = () => {
    // Clean up existing charts first
    cleanupCharts();
    
    // Add a small delay to ensure DOM elements are ready
    setTimeout(() => {
      console.log('Initializing charts...');
      
      // Import Chart.js dynamically on the client side
      import('chart.js').then(({ Chart, registerables }) => {
        // Register all chart types, scales, etc.
        Chart.register(...registerables);
        
        // Get chart elements
        const categoryChartElement = document.getElementById('categoryChart');
        const summaryChartElement = document.getElementById('summaryChart');
        const franchiseChartElement = document.getElementById('franchiseChart');
        
        console.log('Chart elements found:', {
          categoryChart: !!categoryChartElement,
          summaryChart: !!summaryChartElement,
          franchiseChart: !!franchiseChartElement
        });
        
        // Ensure we have data to display
        console.log('Chart data:', {
          categoryData,
          stats,
          franchiseData
        });
        
        try {
          // Category chart
          if (categoryChartElement) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.categoryChart) {
              chartRefs.current.categoryChart.destroy();
            }
            
            chartRefs.current.categoryChart = new Chart(categoryChartElement as HTMLCanvasElement, {
              type: 'bar',
              data: {
                labels: categoryData.labels,
                datasets: [{
                  label: 'Pre-leased Properties by Category',
                  data: categoryData.data,
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
            console.log('Category chart initialized');
          } else {
            console.error('Category chart element not found in DOM');
          }

          // Summary chart
          if (summaryChartElement) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.summaryChart) {
              chartRefs.current.summaryChart.destroy();
            }
            
            chartRefs.current.summaryChart = new Chart(summaryChartElement as HTMLCanvasElement, {
              type: 'doughnut',
              data: {
                labels: ['Pre-leased', 'Vacant', 'Franchise'],
                datasets: [{
                  data: [stats.preleased, stats.vacant, stats.franchise],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)', 
                    'rgba(255, 99, 132, 0.7)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
            console.log('Summary chart initialized');
          } else {
            console.error('Summary chart element not found in DOM');
          }

          // Franchise Industry Chart
          if (franchiseChartElement) {
            // Ensure any previous chart instance is destroyed
            if (chartRefs.current.franchiseChart) {
              chartRefs.current.franchiseChart.destroy();
            }
            
            chartRefs.current.franchiseChart = new Chart(franchiseChartElement as HTMLCanvasElement, {
              type: 'pie',
              data: {
                labels: franchiseData.labels,
                datasets: [{
                  label: 'Franchises by Industry',
                  data: franchiseData.data,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
            console.log('Franchise chart initialized');
          } else {
            console.error('Franchise chart element not found in DOM');
          }
        } catch (error) {
          console.error('Error initializing charts:', error);
        }
      }).catch(error => {
        console.error('Failed to load Chart.js:', error);
      });
    }, 1000); // Increased timeout to 1000ms to ensure DOM is ready
  };

  // Clean Bitdefender attributes and initialize charts on mount
  useEffect(() => {
    // Clean any Bitdefender attributes if the global cleaner function exists
    if (window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        await fetchWithAuth('/api/auth/check');
        // If we get here, we're authenticated
        console.log('Dashboard: Authentication verified');
        
        // Fetch data from Firebase
        await fetchData();
        console.log('Dashboard data fetched');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard authentication error:', error);
        // Error will be handled by fetchWithAuth (redirect to login)
      }
    };
    
    checkAuth();
    
    // Cleanup charts on component unmount
    return () => {
      cleanupCharts();
    };
  }, [router]);

  // Initialize charts after data is loaded and component is rendered
  useEffect(() => {
    if (!isLoading) {
      console.log('Data loaded, initializing charts');
      initCharts();
    }
  }, [isLoading]);

  return (
    <div className="px-4">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of property listings and statistics</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-900 rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Pre-leased Properties</p>
                  <h2 className="text-3xl font-bold mt-1">{stats.preleased}</h2>
                </div>
                <FaBuilding className="text-3xl opacity-80" />
              </div>
              <div className="mt-6 text-sm font-medium">
                <span className="opacity-80">{stats.total > 0 ? ((stats.preleased / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Vacant Properties</p>
                  <h2 className="text-3xl font-bold mt-1">{stats.vacant}</h2>
                </div>
                <FaHome className="text-3xl opacity-80" />
              </div>
              <div className="mt-6 text-sm font-medium">
                <span className="opacity-80">{stats.total > 0 ? ((stats.vacant / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Franchise Opportunities</p>
                  <h2 className="text-3xl font-bold mt-1">{stats.franchise}</h2>
                </div>
                <FaStore className="text-3xl opacity-80" />
              </div>
              <div className="mt-6 text-sm font-medium">
                <span className="opacity-80">{stats.total > 0 ? ((stats.franchise / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Total Properties</p>
                  <h2 className="text-3xl font-bold mt-1">{stats.total}</h2>
                </div>
                <FaChartBar className="text-3xl opacity-80" />
              </div>
              <div className="mt-6 text-sm font-medium">
                <span className="opacity-80">All property types</span>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-6">Pre-leased Properties by Category</h2>
              <div className="h-64 relative">
                <canvas id="categoryChart"></canvas>
                {categoryData.data.every(value => value === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No category data available
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-6">Property Distribution</h2>
              <div className="h-64 relative">
                <canvas id="summaryChart"></canvas>
                {stats.total === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No property data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Franchise Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-6">Franchise Opportunities by Industry</h2>
            <div className="h-64 relative">
              <canvas id="franchiseChart"></canvas>
              {franchiseData.data.every(value => value === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No franchise data available
                </div>
              )}
            </div>
          </div>
          
          {/* Real-time User Analytics Section */}
          <RealTimeUserStats />
          
          {/* Error message if any */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-8">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
} 