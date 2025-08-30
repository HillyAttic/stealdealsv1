import { describe, it, expect } from '@jest/globals';;
import { activitySchema, activityQuerySchema } from '@/lib/validations/auth';
import { ActivityType, ActivityStats, ActivityAggregation, PaginatedActivities } from '@/types/auth';

describe('Enhanced Activity API - Schema and Type Validation', () => {
  describe('Activity Schema Validation', () => {
    it('should validate new activity types', () => {
      const filterApplyActivity = {
        type: 'filter_apply',
        metadata: {
          filters: {
            priceRange: '500000-2000000',
            propertyType: 'apartment',
            location: 'mumbai'
          },
          resultsCount: 15
        },
        sessionId: 'test-session-1'
      };

      const result = activitySchema.safeParse(filterApplyActivity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('filter_apply');
      }
    });

    it('should validate property_share activity type', () => {
      const propertyShareActivity = {
        type: 'property_share',
        propertyId: 'prop-test-1',
        metadata: {
          propertyTitle: 'Test Property',
          shareMethod: 'email',
          recipient: 'friend@example.com'
        },
        sessionId: 'test-session-1'
      };

      const result = activitySchema.safeParse(propertyShareActivity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('property_share');
      }
    });

    it('should validate all supported activity types', () => {
      const supportedTypes: ActivityType[] = [
        'property_view',
        'wishlist_add', 
        'wishlist_remove',
        'search',
        'filter_apply',
        'contact_inquiry',
        'property_share'
      ];

      supportedTypes.forEach(type => {
        const activity = {
          type,
          metadata: {},
          sessionId: 'test-session'
        };

        const result = activitySchema.safeParse(activity);
        expect(result.success).toBe(true);
      });
    });

    it('should make ipAddress and userAgent optional', () => {
      const activityWithoutOptionalFields = {
        type: 'property_view',
        propertyId: 'prop-test-1',
        metadata: {
          propertyTitle: 'Test Property',
          duration: 120
        },
        sessionId: 'test-session-1'
      };

      const result = activitySchema.safeParse(activityWithoutOptionalFields);
      expect(result.success).toBe(true);
    });

    it('should reject invalid activity types', () => {
      const invalidActivity = {
        type: 'invalid_type',
        metadata: {},
        sessionId: 'test-session-1'
      };

      const result = activitySchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });

  describe('Activity Query Schema Validation', () => {
    it('should validate pagination parameters', () => {
      const validQuery = {
        page: 1,
        limit: 25,
        type: 'property_view'
      };

      const result = activityQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(25);
        expect(result.data.type).toBe('property_view');
      }
    });

    it('should apply default values', () => {
      const emptyQuery = {};

      const result = activityQuerySchema.safeParse(emptyQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should validate date filters', () => {
      const queryWithDates = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z'
      };

      const result = activityQuerySchema.safeParse(queryWithDates);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pagination values', () => {
      const invalidQuery = {
        page: 0,
        limit: 200
      };

      const result = activityQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Definitions', () => {
    it('should define ActivityStats interface correctly', () => {
      const mockStats: ActivityStats = {
        totalViews: 100,
        wishlistItems: 25,
        totalActivities: 150,
        recentActivities: [],
        topViewedProperties: [
          {
            propertyId: 'prop-1',
            viewCount: 50,
            property: {
              title: 'Test Property',
              location: 'Mumbai',
              price: 1000000,
              imageUrl: 'test.jpg',
              type: 'apartment'
            }
          }
        ]
      };

      expect(mockStats.totalViews).toBe(100);
      expect(mockStats.topViewedProperties).toHaveLength(1);
      expect(mockStats.topViewedProperties[0].property.title).toBe('Test Property');
    });

    it('should define ActivityAggregation interface correctly', () => {
      const mockAggregation: ActivityAggregation = {
        totalActivities: 500,
        activitiesByType: {
          property_view: 200,
          wishlist_add: 50,
          wishlist_remove: 10,
          search: 100,
          filter_apply: 80,
          contact_inquiry: 30,
          property_share: 30
        },
        activitiesByDay: [
          {
            date: '2024-01-01',
            count: 25,
            types: {
              property_view: 15,
              wishlist_add: 5,
              wishlist_remove: 1,
              search: 3,
              filter_apply: 1,
              contact_inquiry: 0,
              property_share: 0
            }
          }
        ],
        activitiesByHour: [
          { hour: 9, count: 20 },
          { hour: 10, count: 35 }
        ],
        topProperties: [
          {
            propertyId: 'prop-1',
            viewCount: 100,
            title: 'Popular Property'
          }
        ],
        userEngagement: {
          averageSessionDuration: 300,
          averageActivitiesPerSession: 5.2,
          returnUserRate: 65.5
        }
      };

      expect(mockAggregation.totalActivities).toBe(500);
      expect(mockAggregation.activitiesByType.property_view).toBe(200);
      expect(mockAggregation.userEngagement.returnUserRate).toBe(65.5);
    });

    it('should define PaginatedActivities interface correctly', () => {
      const mockPaginated: PaginatedActivities = {
        activities: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 100,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        }
      };

      expect(mockPaginated.pagination.page).toBe(1);
      expect(mockPaginated.pagination.hasNext).toBe(true);
      expect(mockPaginated.pagination.hasPrev).toBe(false);
    });
  });

  describe('Enhanced Metadata Support', () => {
    it('should support detailed filter_apply metadata', () => {
      const filterActivity = {
        type: 'filter_apply' as ActivityType,
        metadata: {
          filters: {
            priceRange: '500000-2000000',
            propertyType: 'apartment',
            location: 'mumbai',
            bedrooms: '2-3',
            amenities: ['parking', 'gym', 'pool']
          },
          resultsCount: 25,
          appliedAt: new Date().toISOString(),
          previousFilters: {
            priceRange: '300000-1500000'
          }
        },
        sessionId: 'test-session'
      };

      const result = activitySchema.safeParse(filterActivity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.filters.amenities).toEqual(['parking', 'gym', 'pool']);
        expect(result.data.metadata.resultsCount).toBe(25);
      }
    });

    it('should support detailed property_share metadata', () => {
      const shareActivity = {
        type: 'property_share' as ActivityType,
        propertyId: 'prop-123',
        metadata: {
          propertyTitle: 'Luxury Apartment',
          shareMethod: 'whatsapp',
          recipient: '+91-9876543210',
          customMessage: 'Check out this amazing property!',
          sharedAt: new Date().toISOString(),
          shareSource: 'property_detail_page'
        },
        sessionId: 'test-session'
      };

      const result = activitySchema.safeParse(shareActivity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.shareMethod).toBe('whatsapp');
        expect(result.data.metadata.customMessage).toBe('Check out this amazing property!');
      }
    });

    it('should support enhanced property_view metadata', () => {
      const viewActivity = {
        type: 'property_view' as ActivityType,
        propertyId: 'prop-456',
        metadata: {
          propertyTitle: 'Modern Villa',
          duration: 180,
          source: 'search',
          referrer: 'google',
          scrollDepth: 85,
          imagesViewed: 5,
          contactInfoViewed: true,
          mapViewed: true,
          similarPropertiesClicked: 2
        },
        sessionId: 'test-session'
      };

      const result = activitySchema.safeParse(viewActivity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.scrollDepth).toBe(85);
        expect(result.data.metadata.contactInfoViewed).toBe(true);
        expect(result.data.metadata.similarPropertiesClicked).toBe(2);
      }
    });
  });
});