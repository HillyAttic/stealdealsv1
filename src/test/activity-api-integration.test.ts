import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET as activityGET, POST as activityPOST } from '@/app/api/user/activity/route';

// Mock Firebase to avoid initialization issues
jest.mock('@/lib/firebase', () => ({
  getPropertyById: jest.fn().mockResolvedValue({
    id: 'prop-1',
    title: 'Test Property',
    location: 'Mumbai',
    price: 1000000,
    images: ['test.jpg'],
    category: 'apartment'
  })
}));

// Mock Clerk authentication
const mockUser = {
  id: 'test-user-123',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User'
};

jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn((request, handler) => handler({ user: mockUser })),
  optionalAuth: jest.fn((request, handler) => handler({ user: mockUser }))
}));

describe('Activity API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Activity Logging and Retrieval Flow', () => {
    it('should log and retrieve filter_apply activity', async () => {
      // 1. Log a filter_apply activity
      const filterActivity = {
        type: 'filter_apply',
        metadata: {
          filters: {
            priceRange: '500000-2000000',
            propertyType: 'apartment',
            location: 'mumbai'
          },
          resultsCount: 15
        },
        sessionId: 'test-session-1',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      };

      const postRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        body: JSON.stringify(filterActivity),
        headers: { 'Content-Type': 'application/json' }
      });

      const postResponse = await activityPOST(postRequest);
      const postData = await postResponse.json();

      expect(postResponse.status).toBe(200);
      expect(postData.success).toBe(true);
      expect(postData.activity.type).toBe('filter_apply');

      // 2. Retrieve activities and verify the logged activity is present
      const getRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&limit=10');
      const getResponse = await activityGET(getRequest);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.success).toBe(true);
      expect(getData.data.activities).toBeDefined();
      expect(getData.data.pagination).toBeDefined();
    });

    it('should log and retrieve property_share activity', async () => {
      // 1. Log a property_share activity
      const shareActivity = {
        type: 'property_share',
        propertyId: 'prop-test-1',
        metadata: {
          propertyTitle: 'Test Property',
          shareMethod: 'email',
          recipient: 'friend@example.com'
        },
        sessionId: 'test-session-1',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      };

      const postRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        body: JSON.stringify(shareActivity),
        headers: { 'Content-Type': 'application/json' }
      });

      const postResponse = await activityPOST(postRequest);
      const postData = await postResponse.json();

      expect(postResponse.status).toBe(200);
      expect(postData.success).toBe(true);
      expect(postData.activity.type).toBe('property_share');

      // 2. Retrieve activities filtered by type
      const getRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&type=property_share');
      const getResponse = await activityGET(getRequest);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.success).toBe(true);
      expect(getData.data.activities).toBeDefined();
    });

    it('should get user activity statistics', async () => {
      // First log some activities
      const activities = [
        {
          type: 'property_view',
          propertyId: 'prop-1',
          metadata: { propertyTitle: 'Test Property 1', duration: 120 },
          sessionId: 'test-session-1',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Test Browser'
        },
        {
          type: 'wishlist_add',
          propertyId: 'prop-1',
          metadata: { propertyTitle: 'Test Property 1' },
          sessionId: 'test-session-1',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Test Browser'
        }
      ];

      for (const activity of activities) {
        const postRequest = new NextRequest('http://localhost:3000/api/user/activity', {
          method: 'POST',
          body: JSON.stringify(activity),
          headers: { 'Content-Type': 'application/json' }
        });
        await activityPOST(postRequest);
      }

      // Get activity statistics
      const statsRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=stats');
      const statsResponse = await activityGET(statsRequest);
      const statsData = await statsResponse.json();

      expect(statsResponse.status).toBe(200);
      expect(statsData.success).toBe(true);
      expect(statsData.data.totalActivities).toBeGreaterThan(0);
      expect(statsData.data.totalViews).toBeDefined();
      expect(statsData.data.wishlistItems).toBeDefined();
      expect(statsData.data.recentActivities).toBeDefined();
      expect(statsData.data.topViewedProperties).toBeDefined();
    });

    it('should get activity aggregation data', async () => {
      const aggregationRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=aggregation&groupBy=day');
      const aggregationResponse = await activityGET(aggregationRequest);
      const aggregationData = await aggregationResponse.json();

      expect(aggregationResponse.status).toBe(200);
      expect(aggregationData.success).toBe(true);
      expect(aggregationData.data.totalActivities).toBeDefined();
      expect(aggregationData.data.activitiesByType).toBeDefined();
      expect(aggregationData.data.activitiesByDay).toBeDefined();
      expect(aggregationData.data.userEngagement).toBeDefined();
      expect(aggregationData.data.topProperties).toBeDefined();
    });

    it('should handle pagination correctly', async () => {
      // Test pagination with different page sizes
      const page1Request = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&page=1&limit=2');
      const page1Response = await activityGET(page1Request);
      const page1Data = await page1Response.json();

      expect(page1Response.status).toBe(200);
      expect(page1Data.success).toBe(true);
      expect(page1Data.data.pagination.page).toBe(1);
      expect(page1Data.data.pagination.limit).toBe(2);
      expect(page1Data.data.pagination.hasNext).toBeDefined();
      expect(page1Data.data.pagination.hasPrev).toBe(false);

      // Test second page if there are enough activities
      if (page1Data.data.pagination.hasNext) {
        const page2Request = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&page=2&limit=2');
        const page2Response = await activityGET(page2Request);
        const page2Data = await page2Response.json();

        expect(page2Response.status).toBe(200);
        expect(page2Data.success).toBe(true);
        expect(page2Data.data.pagination.page).toBe(2);
        expect(page2Data.data.pagination.hasPrev).toBe(true);
      }
    });

    it('should validate query parameters and return appropriate errors', async () => {
      // Test invalid page number
      const invalidPageRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&page=0');
      const invalidPageResponse = await activityGET(invalidPageRequest);
      const invalidPageData = await invalidPageResponse.json();

      expect(invalidPageResponse.status).toBe(400);
      expect(invalidPageData.success).toBe(false);
      expect(invalidPageData.error).toBe('Invalid query parameters');

      // Test invalid limit
      const invalidLimitRequest = new NextRequest('http://localhost:3000/api/user/activity?endpoint=paginated&limit=200');
      const invalidLimitResponse = await activityGET(invalidLimitRequest);
      const invalidLimitData = await invalidLimitResponse.json();

      expect(invalidLimitResponse.status).toBe(400);
      expect(invalidLimitData.success).toBe(false);
      expect(invalidLimitData.error).toBe('Invalid query parameters');
    });

    it('should handle date filtering', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const dateFilterRequest = new NextRequest(
        `http://localhost:3000/api/user/activity?endpoint=paginated&startDate=${yesterday.toISOString()}&endDate=${tomorrow.toISOString()}`
      );
      const dateFilterResponse = await activityGET(dateFilterRequest);
      const dateFilterData = await dateFilterResponse.json();

      expect(dateFilterResponse.status).toBe(200);
      expect(dateFilterData.success).toBe(true);
      expect(dateFilterData.data.activities).toBeDefined();
      expect(dateFilterData.data.pagination).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid activity data', async () => {
      const invalidActivity = {
        type: 'invalid_type',
        metadata: {},
        sessionId: 'test-session-1'
      };

      const postRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        body: JSON.stringify(invalidActivity),
        headers: { 'Content-Type': 'application/json' }
      });

      const postResponse = await activityPOST(postRequest);
      const postData = await postResponse.json();

      expect(postResponse.status).toBe(400);
      expect(postData.success).toBe(false);
      expect(postData.error).toBe('Validation failed');
    });

    it('should handle malformed JSON', async () => {
      const postRequest = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const postResponse = await activityPOST(postRequest);
      const postData = await postResponse.json();

      expect(postResponse.status).toBe(500);
      expect(postData.success).toBe(false);
    });
  });
});