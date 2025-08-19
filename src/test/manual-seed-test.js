// Manual test to seed activity data and verify functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

async function testDashboardFunctionality() {
  console.log('🚀 Starting Manual Dashboard Tests...');
  
  try {
    // Test 1: Seed activity data
    console.log('📊 Testing activity data seeding...');
    const seedResponse = await fetch(`${BASE_URL}/api/user/activity/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true })
    });
    
    if (seedResponse.ok) {
      const seedData = await seedResponse.json();
      console.log('✅ Activity data seeded:', seedData);
    } else {
      console.log('❌ Activity seeding failed:', seedResponse.status);
    }
    
    // Wait for data to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Check dashboard metrics with separated verticals
    console.log('📈 Testing dashboard metrics API...');
    const metricsResponse = await fetch(`${BASE_URL}/api/dashboard/metrics`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (metricsResponse.ok) {
      const metricsData = await metricsResponse.json();
      console.log('✅ Dashboard metrics retrieved');
      
      if (metricsData.success && metricsData.data) {
        const { system, user } = metricsData.data;
        
        console.log('📊 System Metrics:');
        console.log(`   Vacant Properties: ${system.vacantProperties}`);
        console.log(`   Pre-leased Properties: ${system.preleasedProperties}`);
        console.log(`   Franchises: ${system.totalFranchises}`);
        
        console.log('👤 User Metrics:');
        console.log(`   Total Views: ${user.totalViews}`);
        console.log(`   Unique Properties: ${user.uniqueProperties}`);
        console.log(`   Wishlist Count: ${user.wishlistCount}`);
        console.log(`   Conversion Rate: ${user.conversionRate.toFixed(2)}%`);
        
        // Check if we have real activity data
        const hasRealActivity = user.totalViews > 0 || 
          user.activityTrends.some(day => day.views > 0 || day.searches > 0);
          
        if (hasRealActivity) {
          console.log('✅ Real activity data detected!');
        } else {
          console.log('⚠️  No real activity data found');
        }
      }
    } else {
      console.log('❌ Metrics API failed:', metricsResponse.status);
    }
    
    // Test 3: Test wishlist functionality
    console.log('💝 Testing wishlist functionality...');
    const wishlistResponse = await fetch(`${BASE_URL}/api/user/wishlist`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (wishlistResponse.ok) {
      const wishlistData = await wishlistResponse.json();
      console.log('✅ Wishlist data retrieved');
      console.log(`   Wishlist items: ${wishlistData.properties?.length || 0}`);
    } else {
      console.log('❌ Wishlist API failed:', wishlistResponse.status);
    }
    
    // Test 4: Test user analytics
    console.log('📊 Testing user analytics API...');
    const analyticsResponse = await fetch(`${BASE_URL}/api/user/analytics`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success && analyticsData.analytics) {
        console.log('✅ User analytics retrieved');
        console.log(`   Total Views: ${analyticsData.analytics.totalViews}`);
        console.log(`   Activity Days with Data: ${analyticsData.analytics.activityByDay.filter(d => d.views > 0 || d.searches > 0).length}`);
      }
    } else {
      console.log('❌ Analytics API failed:', analyticsResponse.status);
    }
    
    console.log('\n🎉 Manual testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDashboardFunctionality();