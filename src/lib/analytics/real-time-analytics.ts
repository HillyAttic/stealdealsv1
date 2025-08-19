import { getAllProperties, getAllFranchises, getVacantProperties, getPreleasedProperties } from '@/lib/firebase';
import { getUserAnalyticsFromFirebase, logUserActivity } from '@/lib/database/user-activity';
import { getUserWishlist } from '@/lib/database/wishlist';
import { UserAnalytics, PropertyView, SearchQuery } from '@/types/auth';

export interface RealTimeMetrics {
  vacantProperties: number;
  preleasedProperties: number;
  totalFranchises: number;
  totalUsers: number;
  recentActivity: any[];
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  locationStats: Array<{ location: string; count: number; percentage: number }>;
  priceRangeStats: Array<{ range: string; count: number; percentage: number }>;
  monthlyGrowth: Array<{ month: string; properties: number; users: number }>;
  propertyBreakdown: {
    vacant: { count: number; percentage: number };
    preleased: { count: number; percentage: number };
    franchises: { count: number; percentage: number };
  };
}

export interface UserDashboardMetrics {
  totalViews: number;
  uniqueProperties: number;
  wishlistCount: number;
  averageSessionDuration: number;
  favoriteCategories: Array<{ category: string; count: number; percentage: number }>;
  recentActivity: any[];
  conversionRate: number;
  activityTrends: Array<{ date: string; views: number; searches: number; actions: number }>;
}

export class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  async getSystemMetrics(): Promise<RealTimeMetrics> {
    const cacheKey = 'system-metrics';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Get properties separated by type
      const vacantProperties = await getVacantProperties();
      const preleasedProperties = await getPreleasedProperties();
      const franchises = await getAllFranchises();
      
      // Combine all properties for overall analytics
      const allProperties = [...vacantProperties, ...preleasedProperties];
      const totalCount = vacantProperties.length + preleasedProperties.length + franchises.length;

      // Analyze categories from all properties
      const categoryCount = new Map<string, number>();
      allProperties.forEach(property => {
        const category = property.category || 'Other';
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });

      const topCategories = Array.from(categoryCount.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: allProperties.length > 0 ? (count / allProperties.length) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Analyze locations from all properties
      const locationCount = new Map<string, number>();
      allProperties.forEach(property => {
        const location = property.location || 'Unknown';
        locationCount.set(location, (locationCount.get(location) || 0) + 1);
      });

      const locationStats = Array.from(locationCount.entries())
        .map(([location, count]) => ({
          location,
          count,
          percentage: allProperties.length > 0 ? (count / allProperties.length) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Analyze price ranges
      const priceRanges = [
        { range: 'Under ₹50L', min: 0, max: 5000000 },
        { range: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
        { range: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
        { range: '₹2Cr - ₹5Cr', min: 20000000, max: 50000000 },
        { range: 'Above ₹5Cr', min: 50000000, max: Infinity }
      ];

      const priceRangeStats = priceRanges.map(({ range, min, max }) => {
        const count = allProperties.filter(property => {
          const price = property.price || property.askingPrice || 0;
          return price >= min && price < max;
        }).length;

        return {
          range,
          count,
          percentage: allProperties.length > 0 ? (count / allProperties.length) * 100 : 0
        };
      });

      // Generate monthly growth data (mock data for now)
      const monthlyGrowth = this.generateMonthlyGrowthData(totalCount);

      // Property breakdown
      const propertyBreakdown = {
        vacant: { 
          count: vacantProperties.length, 
          percentage: totalCount > 0 ? (vacantProperties.length / totalCount) * 100 : 0 
        },
        preleased: { 
          count: preleasedProperties.length, 
          percentage: totalCount > 0 ? (preleasedProperties.length / totalCount) * 100 : 0 
        },
        franchises: { 
          count: franchises.length, 
          percentage: totalCount > 0 ? (franchises.length / totalCount) * 100 : 0 
        }
      };

      const metrics: RealTimeMetrics = {
        vacantProperties: vacantProperties.length,
        preleasedProperties: preleasedProperties.length,
        totalFranchises: franchises.length,
        totalUsers: 150, // Mock data - replace with real user count
        recentActivity: [], // Will be filled by user activity
        topCategories,
        locationStats,
        priceRangeStats,
        monthlyGrowth,
        propertyBreakdown
      };

      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }

  async getUserDashboardMetrics(userId: string): Promise<UserDashboardMetrics> {
    const cacheKey = `user-metrics-${userId}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Get user analytics from Firebase
      const analytics = await getUserAnalyticsFromFirebase(userId);
      
      // Get wishlist
      const wishlist = await getUserWishlist(userId);

      // Get favorite categories from analytics
      const favoriteCategories = analytics.favoritePropertyTypes.slice(0, 5).map(type => ({
        category: type.type,
        count: type.count,
        percentage: type.percentage
      }));

      // Format activity trends
      const activityTrends = analytics.activityByDay.map(day => ({
        date: day.date,
        views: day.views,
        searches: day.searches,
        actions: day.wishlistActions
      }));

      const metrics: UserDashboardMetrics = {
        totalViews: analytics.totalViews,
        uniqueProperties: analytics.uniqueProperties,
        wishlistCount: wishlist.length,
        averageSessionDuration: analytics.averageSessionDuration,
        favoriteCategories,
        recentActivity: [], // Will be populated from activity trends
        conversionRate: analytics.conversionMetrics.conversionRate,
        activityTrends
      };

      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching user dashboard metrics:', error);
      throw error;
    }
  }

  async trackUserInteraction(
    userId: string,
    type: 'property_view' | 'search' | 'wishlist_add' | 'wishlist_remove' | 'contact_inquiry',
    propertyId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await logUserActivity(userId, type, propertyId, metadata);
      
      // Invalidate user cache
      const cacheKey = `user-metrics-${userId}`;
      this.cache.delete(cacheKey);
      
      console.log(`Tracked ${type} for user ${userId}${propertyId ? ` on property ${propertyId}` : ''}`);
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  private generateMonthlyGrowthData(currentTotal: number): Array<{ month: string; properties: number; users: number }> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const growthFactor = 0.8 + (Math.random() * 0.4); // Random growth between 80% and 120%
      const properties = Math.floor(currentTotal * growthFactor * (0.6 + i * 0.04));
      const users = Math.floor(properties * 0.3); // Assume 30% of properties have active users
      
      data.push({
        month: months[monthIndex],
        properties,
        users
      });
    }
    
    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const analytics = RealTimeAnalyticsService.getInstance();