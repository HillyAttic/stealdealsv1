import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/user/activity/route';

// Mock Firebase and database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  child: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  equalTo: jest.fn(),
}));

jest.mock('@/lib/database/activity', () => ({
  logUserActivity: jest.fn(),
  getUserActivities: jest.fn(),
  getUserActivityStats: jest.fn(),
  getGlobalActivityStats: jest.fn(),
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  requireAuth: jest.fn((request, handler) => handler(request)),
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-1' })),
}));

describe('Activity API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/user/activity', () => {
    it('should return user activities successfully', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      
      const mockActivities = [
        {
          id: 'activity-1',
          userId: 'test-user-1',
          type: 'property_view',
          propertyId: 'property-1',
          timestamp: new Date(),
          metadata: { duration: 5000 },
          sessionId: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        },
        {
          id: 'activity-2',
          userId: 'test-user-1',
          type: 'search',
          timestamp: new Date(),
          metadata: { query: 'test search', filters: { type: 'apartment' } },
          sessionId: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      ];

      jest.mocked(getUserActivities).mockResolvedValue(mockActivities);

      const request = new NextRequest('http://localhost:3000/api/user/activity?limit=10', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0]).toMatchObject({
        id: 'activity-1',
        type: 'property_view',
        propertyId: 'property-1',
        metadata: { duration: 5000 }
      });
    });

    it('should return engagement metrics when type=engagement', async () => {
      const { getUserActivityStats } = await import('@/lib/database/activity');
      
      const mockEngagementData = {
        totalSessions: 10,
        averageSessionDuration: 300,
        pagesPerSession: 3.5,
        bounceRate: 0.2,
        topViewedProperties: [
          { propertyId: 'prop-1', viewCount: 15 },
          { propertyId: 'prop-2', viewCount: 10 }
        ]
      };

      jest.mocked(getUserActivityStats).mockResolvedValue(mockEngagementData);

      const request = new NextRequest('http://localhost:3000/api/user/activity?type=engagement', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        totalSessions: 10,
        averageSessionDuration: 300,
        pagesPerSession: 3.5,
        bounceRate: 0.2
      });
    });

    it('should handle empty activity history', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      jest.mocked(getUserActivities).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      jest.mocked(getUserActivities).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to get user activities');
    });

    it('should respect limit parameter', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      jest.mocked(getUserActivities).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/user/activity?limit=5', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      await GET(request);

      expect(getUserActivities).toHaveBeenCalledWith('test-user-1', 5);
    });

    it('should use default limit when not specified', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      jest.mocked(getUserActivities).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      await GET(request);

      expect(getUserActivities).toHaveBeenCalledWith('test-user-1', 50);
    });

    it('should validate limit parameter bounds', async () => {
      const { getUserActivities } = await import('@/lib/database/activity');
      jest.mocked(getUserActivities).mockResolvedValue([]);

      // Test upper bound
      const request1 = new NextRequest('http://localhost:3000/api/user/activity?limit=1000', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      await GET(request1);
      expect(getUserActivities).toHaveBeenCalledWith('test-user-1', 100); // Should cap at 100

      // Test lower bound
      const request2 = new NextRequest('http://localhost:3000/api/user/activity?limit=0', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });

      await GET(request2);
      expect(getUserActivities).toHaveBeenCalledWith('test-user-1', 1); // Should minimum 1
    });
  });

  describe('POST /api/user/activity', () => {
    it('should log property view activity successfully', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      
      const mockActivity = {
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'property_view',
        propertyId: 'property-1',
        timestamp: new Date(),
        metadata: { duration: 5000 },
        sessionId: 'session-1'
      };

      jest.mocked(logUserActivity).mockResolvedValue(mockActivity);

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'property_view',
          propertyId: 'property-1',
          metadata: { duration: 5000 },
          sessionId: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activity).toMatchObject({
        id: 'activity-1',
        type: 'property_view',
        propertyId: 'property-1'
      });
      expect(logUserActivity).toHaveBeenCalledWith(
        'test-user-1',
        'property_view',
        'property-1',
        expect.objectContaining({
          duration: 5000
        }),
        'session-1',
        '127.0.0.1',
        'test-agent'
      );
    });

    it('should log search activity successfully', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      
      const mockActivity = {
        id: 'activity-2',
        userId: 'test-user-1',
        type: 'search',
        timestamp: new Date(),
        metadata: { query: 'test search', filters: { type: 'apartment' } },
        sessionId: 'session-1'
      };

      jest.mocked(logUserActivity).mockResolvedValue(mockActivity);

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'search',
          metadata: { 
            query: 'test search',
            filters: { type: 'apartment' }
          },
          sessionId: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activity.type).toBe('search');
      expect(logUserActivity).toHaveBeenCalledWith(
        'test-user-1',
        'search',
        undefined,
        expect.objectContaining({
          query: 'test search',
          filters: { type: 'apartment' }
        }),
        'session-1',
        '127.0.0.1',
        'test-agent'
      );
    });

    it('should log wishlist activities successfully', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      
      const mockActivity = {
        id: 'activity-3',
        userId: 'test-user-1',
        type: 'wishlist_add',
        propertyId: 'property-1',
        timestamp: new Date(),
        sessionId: 'session-1'
      };

      jest.mocked(logUserActivity).mockResolvedValue(mockActivity);

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'wishlist_add',
          propertyId: 'property-1',
          sessionId: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activity.type).toBe('wishlist_add');
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          // Missing type field
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Activity type is required');
    });

    it('should handle invalid activity type', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'invalid_activity_type',
          propertyId: 'property-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid activity type');
    });

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request body');
    });

    it('should handle database errors', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      jest.mocked(logUserActivity).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'property_view',
          propertyId: 'property-1',
          sessionId: 'session-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to log activity');
    });

    it('should sanitize metadata input', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      jest.mocked(logUserActivity).mockResolvedValue({
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'search',
        timestamp: new Date()
      });

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1'
        },
        body: JSON.stringify({
          type: 'search',
          metadata: {
            query: '<script>alert("xss")</script>legitimate search',
            filters: { type: 'apartment' }
          },
          sessionId: 'session-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify that logUserActivity was called with sanitized data
      expect(logUserActivity).toHaveBeenCalledWith(
        'test-user-1',
        'search',
        undefined,
        expect.objectContaining({
          query: expect.not.stringContaining('<script>'),
          filters: { type: 'apartment' }
        }),
        'session-1',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should extract IP address from request headers', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      jest.mocked(logUserActivity).mockResolvedValue({
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'property_view',
        timestamp: new Date()
      });

      const request = new NextRequest('http://localhost:3000/api/user/activity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-mock-user-id': 'test-user-1',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test Browser'
        },
        body: JSON.stringify({
          type: 'property_view',
          propertyId: 'property-1',
          sessionId: 'session-1'
        })
      });

      await POST(request);

      expect(logUserActivity).toHaveBeenCalledWith(
        'test-user-1',
        'property_view',
        'property-1',
        expect.any(Object),
        'session-1',
        '192.168.1.1',
        'Mozilla/5.0 Test Browser'
      );
    });

    it('should handle concurrent activity logging', async () => {
      const { logUserActivity } = await import('@/lib/database/activity');
      jest.mocked(logUserActivity).mockResolvedValue({
        id: 'activity-1',
        userId: 'test-user-1',
        type: 'property_view',
        timestamp: new Date()
      });

      const requests = Array.from({ length: 5 }, (_, i) => 
        POST(new NextRequest('http://localhost:3000/api/user/activity', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': 'test-user-1'
          },
          body: JSON.stringify({
            type: 'property_view',
            propertyId: `property-${i}`,
            sessionId: 'session-1'
          })
        }))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(logUserActivity).toHaveBeenCalledTimes(5);
    });
  });

  describe('Activity Type Validation', () => {
    const validActivityTypes = [
      'property_view',
      'wishlist_add',
      'wishlist_remove',
      'search',
      'filter_apply',
      'contact_inquiry',
      'property_share'
    ];

    validActivityTypes.forEach(activityType => {
      it(`should accept valid activity type: ${activityType}`, async () => {
        const { logUserActivity } = await import('@/lib/database/activity');
        jest.mocked(logUserActivity).mockResolvedValue({
          id: 'activity-1',
          userId: 'test-user-1',
          type: activityType,
          timestamp: new Date()
        });

        const request = new NextRequest('http://localhost:3000/api/user/activity', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-mock-user-id': 'test-user-1'
          },
          body: JSON.stringify({
            type: activityType,
            propertyId: activityType.includes('property') ? 'property-1' : undefined,
            sessionId: 'session-1'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });
});