"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { FaChartBar, FaStore, FaBuilding, FaHome } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';
import { migratedPreleasedRef, migratedVacantRef, migratedFranchiseRef, migratedPlotsRef } from '@/lib/firebase';
import { dbPool } from '@/lib/database/connection-pool';

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

  // Fetch data from Firebase migrated structure using optimized parallel reads
  const fetchData = async () => {
    try {
      console.log('[AdminDashboard] 🚀 Fetching data using optimized parallel reads');
      
      // Use parallel reads with connection pooling to reduce connection usage
      const snapshots = await dbPool.parallelReads([
        'migratedProperties/preleased',
        'migratedProperties/vacant', 
        'migratedProperties/franchise',
        'migratedProperties/plots'
      ]);

      const preleasedSnapshot = snapshots['migratedProperties/preleased'];
      const vacantSnapshot = snapshots['migratedProperties/vacant'];
      const franchiseSnapshot = snapshots['migratedProperties/franchise'];
      const plotsSnapshot = snapshots['migratedProperties/plots'];

      const preleasedCount = preleasedSnapshot.exists() ? 
        Object.keys(preleasedSnapshot.val()).length : 0;
      const vacantCount = vacantSnapshot.exists() ? 
        Object.keys(vacantSnapshot.val()).length : 0;
      const franchiseCount = franchiseSnapshot.exists() ? 
        Object.keys(franchiseSnapshot.val()).length : 0;
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
      
      // Process category data for vacant properties (UPDATED - using specific categories)
      if (vacantSnapshot.exists()) {
        const categories: Record<string, number> = {
          'Industrial': 0,
          'High-Street': 0,
          'Mall': 0,
          'Corporate': 0,
          'Other': 0
        };
        
        vacantSnapshot.forEach((childSnapshot) => {
          const property = childSnapshot.val();
          // Access category from vacantDetails or fallback to property.category
          const category = property.vacantDetails?.category || property.category || 'Other';
          
          console.log(`[Dashboard] Processing vacant property: ${childSnapshot.key}, category: ${category}`);
          
          // Map categories to the specific ones you want
          if (category.toLowerCase().includes('industrial')) {
            categories['Industrial']++;
          } else if (category.toLowerCase().includes('high-street') || category.toLowerCase().includes('high street') || category.toLowerCase().includes('street')) {
            categories['High-Street']++;
          } else if (category.toLowerCase().includes('mall') || category.toLowerCase().includes('shopping')) {
            categories['Mall']++;
          } else if (category.toLowerCase().includes('corporate') || category.toLowerCase().includes('office') || category.toLowerCase().includes('business')) {
            categories['Corporate']++;
          } else {
            categories['Other']++;
          }
        });
        
        // Filter out categories with 0 count for cleaner chart
        const filteredCategories = Object.entries(categories)
          .filter(([_, count]) => count > 0)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, number>);
        
        console.log('[Dashboard] Vacant categories processed:', filteredCategories);
        
        // Update category data with filtered results
        setCategoryData({
          labels: Object.keys(filteredCategories),
          data: Object.values(filteredCategories)
        });
      } else {
        console.log('[Dashboard] No vacant properties found');
        // Set empty data if no vacant properties
        setCategoryData({
          labels: [],
          data: []
        });
      }

      // Process franchise data by industry (FIXED - access franchiseDetails.industry)
      if (franchiseSnapshot.exists()) {
        const franchiseCategories: Record<string, number> = {
          'Education': 0,
          'F&B': 0,
          'Fashion': 0,
          'Pharmaceutical': 0,
          'Retail': 0,
          'Sports, Fitness & Entertainments': 0
        };
        
        franchiseSnapshot.forEach((childSnapshot) => {
          const franchise = childSnapshot.val();
          // Access industry from franchiseDetails or fallback to franchise.industry
          const industry = franchise.franchiseDetails?.industry || franchise.industry || '';
          
          console.log(`[Dashboard] Processing franchise: ${childSnapshot.key}, industry: "${industry}"`);
          
          // Use exact matching for accurate categorization
          switch (industry) {
            case 'Education':
              franchiseCategories['Education']++;
              break;
            case 'F&B':
              franchiseCategories['F&B']++;
              break;
            case 'Fashion':
              franchiseCategories['Fashion']++;
              break;
            case 'Pharmaceutical':
              franchiseCategories['Pharmaceutical']++;
              break;
            case 'Retail':
              franchiseCategories['Retail']++;
              break;
            case 'Sports, Fitness & Entertainments':
              franchiseCategories['Sports, Fitness & Entertainments']++;
              break;
            default:
              // Log unknown industries but don't count them
              if (industry) {
                console.log(`[Dashboard] Unknown industry "${industry}" - not categorized`);
              }
              break;
          }
        });
        
        console.log('[Dashboard] Franchise categories processed (showing all categories):', franchiseCategories);
        
        // Show ALL categories, even those with 0 count
        setFranchiseData({
          labels: Object.keys(franchiseCategories),
          data: Object.values(franchiseCategories)
        });
      } else {
        console.log('[Dashboard] No franchise data found');
        // Set empty data with all categories
        setFranchiseData({
          labels: ['Education', 'F&B', 'Fashion', 'Pharmaceutical', 'Retail', 'Sports, Fitness & Entertainments'],
          data: [0, 0, 0, 0, 0, 0]
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
    
    console.log('Initializing charts...');
    
    // Import Chart.js dynamically on the client side
    import('chart.js').then(({ Chart, registerables }) => {
      // Register all chart types, scales, etc.
      Chart.register(...registerables);
      
      // Get chart elements
      const categoryChartElement = document.getElementById('categoryChart') as HTMLCanvasElement;
      const summaryChartElement = document.getElementById('summaryChart') as HTMLCanvasElement;
      const franchiseChartElement = document.getElementById('franchiseChart') as HTMLCanvasElement;
      
      console.log('Chart elements found:', {
        categoryChart: !!categoryChartElement,
        summaryChart: !!summaryChartElement,
        franchiseChart: !!franchiseChartElement
      });
        
      // Use setTimeout to ensure DOM is fully ready
      setTimeout(() => {
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
              type: 'doughnut', // Changed from 'bar' to 'doughnut' for better visualization
              data: {
                labels: categoryData.labels,
                datasets: [{
                  label: 'Vacant Properties by Category',
                  data: categoryData.data,
                  backgroundColor: [
                    'rgba(120, 53, 15, 0.8)',    // Brown - Industrial
                    'rgba(59, 130, 246, 0.8)',   // Blue - High-Street
                    'rgba(16, 185, 129, 0.8)',   // Green - Mall
                    'rgba(139, 92, 246, 0.8)',   // Purple - Corporate
                    'rgba(107, 114, 128, 0.8)'   // Gray - Other
                  ],
                  borderColor: [
                    'rgba(120, 53, 15, 1)',      // Brown - Industrial
                    'rgba(59, 130, 246, 1)',     // Blue - High-Street
                    'rgba(16, 185, 129, 1)',     // Green - Mall
                    'rgba(139, 92, 246, 1)',     // Purple - Corporate
                    'rgba(107, 114, 128, 1)'     // Gray - Other
                  ],
                  borderWidth: 2,
                  hoverOffset: 10
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                layout: {
                  padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 11
                      },
                      boxWidth: 12,
                      boxHeight: 12
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} properties (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true
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
                labels: ['Pre-leased', 'Vacant', 'Franchise', 'Plots'],
                datasets: [{
                  data: [stats.preleased, stats.vacant, stats.franchise, stats.plots],
                  backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',   // Blue - Pre-leased
                    'rgba(75, 192, 192, 0.8)',   // Teal - Vacant
                    'rgba(255, 99, 132, 0.8)',   // Red - Franchise
                    'rgba(153, 102, 255, 0.8)'   // Purple - Plots
                  ],
                  borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)'
                  ],
                  borderWidth: 2,
                  hoverOffset: 10
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                layout: {
                  padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 11
                      },
                      boxWidth: 12,
                      boxHeight: 12
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        return `${label}: ${value} properties (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true
                }
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
              type: 'bar', // Using bar chart for better comparison of franchise categories
              data: {
                labels: franchiseData.labels,
                datasets: [{
                  label: 'Franchises by Industry',
                  data: franchiseData.data,
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',   // Blue - Education
                    'rgba(239, 68, 68, 0.8)',    // Red - F&B
                    'rgba(236, 72, 153, 0.8)',   // Pink - Fashion
                    'rgba(16, 185, 129, 0.8)',   // Green - Pharmaceutical
                    'rgba(245, 158, 11, 0.8)',   // Amber - Retail
                    'rgba(139, 92, 246, 0.8)',   // Purple - Sports, Fitness & Entertainments
                    'rgba(107, 114, 128, 0.8)'   // Gray - Other
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',     // Blue - Education
                    'rgba(239, 68, 68, 1)',      // Red - F&B
                    'rgba(236, 72, 153, 1)',     // Pink - Fashion
                    'rgba(16, 185, 129, 1)',     // Green - Pharmaceutical
                    'rgba(245, 158, 11, 1)',     // Amber - Retail
                    'rgba(139, 92, 246, 1)',     // Purple - Sports, Fitness & Entertainments
                    'rgba(107, 114, 128, 1)'     // Gray - Other
                  ],
                  borderWidth: 2,
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false // Hide legend for cleaner look
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed.y;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} franchises (${percentage}%)`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      callback: function(value) {
                        return Number.isInteger(value) ? value : '';
                      }
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeOutQuart'
                }
              }
            });
            console.log('Franchise chart initialized');
          } else {
            console.error('Franchise chart element not found in DOM');
          }
        } catch (error) {
          console.error('Error initializing charts:', error);
        }
      }, 1000); // Increased timeout to 1000ms to ensure DOM is ready
    }).catch(error => {
      console.error('Failed to load Chart.js:', error);
    });
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
      // Use a longer timeout to ensure DOM elements are fully rendered
      const timer = setTimeout(() => {
        initCharts();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className="px-2 sm:px-4">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Overview of property listings</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-3 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm opacity-80">Pre-leased</p>
                  <h2 className="text-xl sm:text-3xl font-bold mt-1">{stats.preleased}</h2>
                </div>
                <FaBuilding className="text-xl sm:text-3xl opacity-80" />
              </div>
              <div className="mt-3 sm:mt-6 text-xs sm:text-sm font-medium">
                <span className="opacity-80 hidden sm:inline">{stats.total > 0 ? ((stats.preleased / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-3 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm opacity-80">Vacant</p>
                  <h2 className="text-xl sm:text-3xl font-bold mt-1">{stats.vacant}</h2>
                </div>
                <FaHome className="text-xl sm:text-3xl opacity-80" />
              </div>
              <div className="mt-3 sm:mt-6 text-xs sm:text-sm font-medium">
                <span className="opacity-80 hidden sm:inline">{stats.total > 0 ? ((stats.vacant / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-3 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm opacity-80">Franchise</p>
                  <h2 className="text-xl sm:text-3xl font-bold mt-1">{stats.franchise}</h2>
                </div>
                <FaStore className="text-xl sm:text-3xl opacity-80" />
              </div>
              <div className="mt-3 sm:mt-6 text-xs sm:text-sm font-medium">
                <span className="opacity-80 hidden sm:inline">{stats.total > 0 ? ((stats.franchise / stats.total) * 100).toFixed(1) : "0"}% of total</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white p-3 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm opacity-80">Total</p>
                  <h2 className="text-xl sm:text-3xl font-bold mt-1">{stats.total}</h2>
                </div>
                <FaChartBar className="text-xl sm:text-3xl opacity-80" />
              </div>
              <div className="mt-3 sm:mt-6 text-xs sm:text-sm font-medium">
                <span className="opacity-80 hidden sm:inline">All property types</span>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-sm sm:text-lg font-semibold mb-4 sm:mb-6">Vacant by Category</h2>
              <div className="h-48 sm:h-64 relative flex items-center justify-center">
                <div className="w-full h-full max-w-md mx-auto">
                  <canvas id="categoryChart"></canvas>
                </div>
                {categoryData.data.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-sm font-medium">No vacant properties found</div>
                    <div className="text-xs text-gray-400 mt-1">Add vacant properties to see category breakdown</div>
                  </div>
                ) : categoryData.data.every(value => value === 0) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-4xl mb-2">📈</div>
                    <div className="text-sm font-medium">No category data available</div>
                    <div className="text-xs text-gray-400 mt-1">Properties need category information</div>
                  </div>
                )}
              </div>
              
              {/* Category Summary */}
              {categoryData.data.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {categoryData.labels.map((label, index) => (
                      <div key={label} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              'rgba(120, 53, 15, 0.8)',    // Brown - Industrial
                              'rgba(59, 130, 246, 0.8)',   // Blue - High-Street
                              'rgba(16, 185, 129, 0.8)',   // Green - Mall
                              'rgba(139, 92, 246, 0.8)',   // Purple - Corporate
                              'rgba(107, 114, 128, 0.8)'   // Gray - Other
                            ][index % 5]
                          }}
                        ></div>
                        <span className="text-gray-700 font-medium">{label}</span>
                        <span className="text-gray-500">({categoryData.data[index]})</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Total: {categoryData.data.reduce((a, b) => a + b, 0)} vacant properties
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-sm sm:text-lg font-semibold mb-4 sm:mb-6">Property Distribution</h2>
              <div className="h-48 sm:h-64 relative flex items-center justify-center">
                <div className="w-full h-full max-w-md mx-auto">
                  <canvas id="summaryChart"></canvas>
                </div>
                {stats.total === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-sm font-medium">No property data available</div>
                    <div className="text-xs text-gray-400 mt-1">Add properties to see distribution</div>
                  </div>
                )}
              </div>
              
              {/* Property Distribution Summary */}
              {stats.total > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(54, 162, 235, 0.8)' }}></div>
                      <span className="text-gray-700 font-medium">Pre-leased</span>
                      <span className="text-gray-500">({stats.preleased})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(75, 192, 192, 0.8)' }}></div>
                      <span className="text-gray-700 font-medium">Vacant</span>
                      <span className="text-gray-500">({stats.vacant})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 99, 132, 0.8)' }}></div>
                      <span className="text-gray-700 font-medium">Franchise</span>
                      <span className="text-gray-500">({stats.franchise})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(153, 102, 255, 0.8)' }}></div>
                      <span className="text-gray-700 font-medium">Plots</span>
                      <span className="text-gray-500">({stats.plots})</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Total: {stats.total} properties across all categories
                  </div>
                  
                  {/* Percentage Breakdown */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {stats.total > 0 ? ((stats.preleased / stats.total) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-600">Pre-leased</div>
                    </div>
                    <div className="text-center p-2 bg-teal-50 rounded">
                      <div className="text-lg font-bold text-teal-600">
                        {stats.total > 0 ? ((stats.vacant / stats.total) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-600">Vacant</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-lg font-bold text-red-600">
                        {stats.total > 0 ? ((stats.franchise / stats.total) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-600">Franchise</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.total > 0 ? ((stats.plots / stats.total) * 100).toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-600">Plots</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Franchise Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
            <h2 className="text-sm sm:text-lg font-semibold mb-4 sm:mb-6">Franchise by Industry</h2>
            <div className="h-48 sm:h-64 relative">
              <canvas id="franchiseChart"></canvas>
              {franchiseData.data.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <div className="text-4xl mb-2">🏪</div>
                  <div className="text-sm font-medium">No franchise opportunities found</div>
                  <div className="text-xs text-gray-400 mt-1">Add franchises to see industry breakdown</div>
                </div>
              ) : franchiseData.data.every(value => value === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm font-medium">No industry data available</div>
                  <div className="text-xs text-gray-400 mt-1">Franchises need industry information</div>
                </div>
              )}
            </div>
            
            {/* Industry Summary */}
            {franchiseData.labels.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {franchiseData.labels.map((label, index) => {
                    const count = franchiseData.data[index];
                    const total = franchiseData.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={label} className={`flex items-center justify-between p-3 rounded-lg ${count > 0 ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',   // Blue - Education
                                'rgba(239, 68, 68, 0.8)',    // Red - F&B
                                'rgba(236, 72, 153, 0.8)',   // Pink - Fashion
                                'rgba(16, 185, 129, 0.8)',   // Green - Pharmaceutical
                                'rgba(245, 158, 11, 0.8)',   // Amber - Retail
                                'rgba(139, 92, 246, 0.8)',   // Purple - Sports, Fitness & Entertainments
                              ][index % 6]
                            }}
                          ></div>
                          <span className={`font-medium ${count > 0 ? 'text-gray-700' : 'text-gray-500'}`}>{label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span>
                          <span className="text-xs text-gray-500">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
                    <span>🏢</span>
                    <span>Total: {franchiseData.data.reduce((a, b) => a + b, 0)} franchise opportunities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          
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