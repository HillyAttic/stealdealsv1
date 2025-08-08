import { logActivity } from './activity';

/**
 * Seed analytics data for testing purposes
 */
export async function seedAnalyticsData(userId: string): Promise<void> {
  try {
    console.log('Seeding analytics data for user:', userId);
    
    // Sample property IDs (these would be real property IDs in production)
    const sampleProperties = [
      { id: '1', title: 'Modern Office Space in Connaught Place', category: 'Office', location: 'Connaught Place, Delhi' },
      { id: '2', title: 'Retail Shop in Khan Market', category: 'Retail', location: 'Khan Market, Delhi' },
      { id: '3', title: 'Warehouse in Gurgaon', category: 'Warehouse', location: 'Gurgaon, Haryana' },
      { id: '4', title: 'Restaurant Space in Karol Bagh', category: 'Restaurant', location: 'Karol Bagh, Delhi' },
      { id: '5', title: 'Co-working Space in Noida', category: 'Office', location: 'Noida, UP' },
      { id: '6', title: 'Showroom in Lajpat Nagar', category: 'Retail', location: 'Lajpat Nagar, Delhi' },
      { id: '7', title: 'Industrial Unit in Faridabad', category: 'Industrial', location: 'Faridabad, Haryana' },
      { id: '8', title: 'Cafe Space in CP', category: 'Restaurant', location: 'Connaught Place, Delhi' }
    ];
    
    const sessionId = 'test-session-' + Date.now();
    const now = new Date();
    
    // Generate activities over the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random number of activities per day (0-5)
      const activitiesPerDay = Math.floor(Math.random() * 6);
      
      for (let j = 0; j < activitiesPerDay; j++) {
        const randomProperty = sampleProperties[Math.floor(Math.random() * sampleProperties.length)];
        const activityTime = new Date(date);
        activityTime.setHours(Math.floor(Math.random() * 24));
        activityTime.setMinutes(Math.floor(Math.random() * 60));
        
        // Override the timestamp in the activity function
        const originalLogActivity = logActivity;
        
        // Property view activity
        if (Math.random() > 0.3) {
          await originalLogActivity(
            userId,
            'property_view',
            randomProperty.id,
            {
              duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
              source: ['search', 'direct', 'wishlist'][Math.floor(Math.random() * 3)],
              propertyTitle: randomProperty.title,
              propertyCategory: randomProperty.category,
              propertyLocation: randomProperty.location
            },
            sessionId + '-' + i,
            '192.168.1.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          );
        }
        
        // Search activity
        if (Math.random() > 0.7) {
          await originalLogActivity(
            userId,
            'search',
            undefined,
            {
              query: ['office space', 'retail shop', 'warehouse', 'restaurant'][Math.floor(Math.random() * 4)],
              filters: {
                location: randomProperty.location.split(',')[0],
                category: randomProperty.category,
                priceRange: { min: 10000, max: 100000 }
              },
              resultsCount: Math.floor(Math.random() * 50) + 10
            },
            sessionId + '-' + i,
            '192.168.1.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          );
        }
        
        // Wishlist activity
        if (Math.random() > 0.8) {
          await originalLogActivity(
            userId,
            Math.random() > 0.5 ? 'wishlist_add' : 'wishlist_remove',
            randomProperty.id,
            {
              propertyTitle: randomProperty.title,
              propertyCategory: randomProperty.category,
              propertyLocation: randomProperty.location
            },
            sessionId + '-' + i,
            '192.168.1.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          );
        }
        
        // Contact inquiry activity
        if (Math.random() > 0.9) {
          await originalLogActivity(
            userId,
            'contact_inquiry',
            randomProperty.id,
            {
              inquiryType: 'phone',
              propertyTitle: randomProperty.title,
              propertyCategory: randomProperty.category,
              propertyLocation: randomProperty.location
            },
            sessionId + '-' + i,
            '192.168.1.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          );
        }
      }
    }
    
    console.log('Analytics data seeded successfully for user:', userId);
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    throw error;
  }
}