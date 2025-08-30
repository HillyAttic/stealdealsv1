/**
 * Wishlist Performance Debug Utility
 * 
 * Run this in the browser console on the wishlist page
 * to monitor for infinite loops and performance issues.
 */

// Performance monitoring state
const PerformanceMonitor = {
  apiCalls: [],
  renders: 0,
  lastWishlistItems: null,
  lastGatedContentSaves: 0,
  startTime: Date.now(),

  // Track API calls
  trackApiCall: function(url, method = 'GET') {
    this.apiCalls.push({
      url,
      method,
      timestamp: Date.now(),
      timeSinceStart: Date.now() - this.startTime
    });
    
    // Check for potential infinite loops
    const recentCalls = this.apiCalls.filter(call => 
      call.timestamp > Date.now() - 10000 && // Last 10 seconds
      call.url === url
    );
    
    if (recentCalls.length > 10) {
      console.warn(`🚨 POTENTIAL INFINITE LOOP DETECTED: ${recentCalls.length} calls to ${url} in the last 10 seconds`);
      console.table(recentCalls);
    }
  },

  // Monitor localStorage activity
  monitorLocalStorage: function() {
    const originalSetItem = localStorage.setItem;
    let gatedContentSaves = 0;
    
    localStorage.setItem = function(key, value) {
      if (key.includes('stealdeals-unlocked')) {
        gatedContentSaves++;
        if (gatedContentSaves > PerformanceMonitor.lastGatedContentSaves + 50) {
          console.warn(`🚨 EXCESSIVE GATED CONTENT SAVES: ${gatedContentSaves} saves detected`);
          PerformanceMonitor.lastGatedContentSaves = gatedContentSaves;
        }
      }
      return originalSetItem.call(this, key, value);
    };
  },

  // Monitor fetch calls
  monitorFetch: function() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      if (typeof url === 'string' && url.includes('/api/user/wishlist')) {
        PerformanceMonitor.trackApiCall(url, options.method || 'GET');
      }
      
      return originalFetch.apply(this, args);
    };
  },

  // Get performance report
  getReport: function() {
    const now = Date.now();
    const duration = (now - this.startTime) / 1000;
    
    const wishlistApiCalls = this.apiCalls.filter(call => 
      call.url.includes('/api/user/wishlist')
    );
    
    return {
      totalDuration: `${duration.toFixed(1)}s`,
      totalApiCalls: this.apiCalls.length,
      wishlistApiCalls: wishlistApiCalls.length,
      avgApiCallsPerSecond: (this.apiCalls.length / duration).toFixed(2),
      recentApiCalls: this.apiCalls.filter(call => call.timestamp > now - 30000).length,
      suspiciousActivity: {
        rapidApiCalls: wishlistApiCalls.filter((call, index, arr) => {
          if (index === 0) return false;
          return call.timestamp - arr[index - 1].timestamp < 100; // Calls within 100ms
        }).length,
        apiCallsLastMinute: wishlistApiCalls.filter(call => call.timestamp > now - 60000).length
      }
    };
  },

  // Start monitoring
  start: function() {
    console.log('🔍 Starting Wishlist Performance Monitoring...');
    this.monitorFetch();
    this.monitorLocalStorage();
    
    // Set up periodic reporting
    this.reportInterval = setInterval(() => {
      const report = this.getReport();
      if (report.suspiciousActivity.apiCallsLastMinute > 20) {
        console.warn('🚨 PERFORMANCE ISSUE DETECTED:', report);
      }
    }, 10000); // Check every 10 seconds
    
    return 'Monitoring started. Call PerformanceMonitor.getReport() for status.';
  },

  // Stop monitoring
  stop: function() {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    console.log('✅ Performance monitoring stopped');
    return this.getReport();
  }
};

// Auto-start monitoring
PerformanceMonitor.start();

// Make it globally available
window.PerformanceMonitor = PerformanceMonitor;

console.log(`
📊 WISHLIST PERFORMANCE MONITOR ACTIVE

Usage:
- PerformanceMonitor.getReport() - Get current performance metrics
- PerformanceMonitor.stop() - Stop monitoring and get final report

The monitor will automatically warn you if:
- More than 10 API calls to the same endpoint in 10 seconds
- More than 20 wishlist API calls in 1 minute
- Excessive localStorage saves for gated content

Navigate to the wishlist page and monitor the console for warnings.
`);