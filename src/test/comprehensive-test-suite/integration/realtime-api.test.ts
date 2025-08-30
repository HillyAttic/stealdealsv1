import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
const vi = jest;;
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/realtime/route';
import { POST } from '@/app/api/realtime/broadcast/route';

// Mock RealTimeService
const mockRealTimeService = {
  getInstance: jest.fn(),
  subscribeToUserUpdates: jest.fn(),
  subscribeToGlobalUpdates: jest.fn(),
  broadcastWishlistUpdate: jest.fn(),
  broadcastActivityUpdate: jest.fn(),
  broadcastUserStatsUpdate: jest.fn(),
  broadcastGlobalStatsUpdate: jest.fn(),
};

jest.mock('@/lib/realtime/service', () => ({
  RealTimeService: mockRealTimeService
}));

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  optionalAuth: jest.fn((request, handler) => handler(request)),
}));

describe('Real-time API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRealTimeService.getInstance.mockReturnValue(mockRealTimeService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/realtime (SSE Endpoint)', () => {
    it('should establish SSE connection for global channel', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=global');
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalled();
    });

    it('should establish SSE connection for user channel', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToUserUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=user', {
        headers: { 'x-mock-user-id': 'test-user-1' }
      });
      
      // Mock request with user
      const requestWithUser = { ...request, user: { id: 'test-user-1' } };
      
      const response = await GET(requestWithUser as any);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(mockRealTimeService.subscribeToUserUpdates).toHaveBeenCalledWith(
        'test-user-1',
        expect.any(Function)
      );
    });

    it('should establish SSE connection for admin channel', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=admin');
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalled();
    });

    it('should default to global channel when no channel specified', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime');
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalled();
    });

    it('should handle subscription errors gracefully', async () => {
      mockRealTimeService.subscribeToGlobalUpdates.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=global');
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should handle CORS preflight requests', async () => {
      // This would be tested with OPTIONS method, but we need to check the implementation
      // The current implementation doesn't have OPTIONS handler, so we test the headers
      const request = new NextRequest('http://localhost:3000/api/realtime');
      
      const response = await GET(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Cache-Control');
    });

    // Note: Testing the actual SSE stream content would require more complex setup
    // as we'd need to read from the ReadableStream, which is challenging in unit tests
  });

  describe('POST /api/realtime/broadcast', () => {
    it('should broadcast wishlist update successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wishlist_update',
          userId: 'test-user-1',
          data: {
            action: 'add',
            propertyId: 'property-1',
            wishlistCount: 5
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Event broadcasted successfully');
      expect(mockRealTimeService.broadcastWishlistUpdate).toHaveBeenCalledWith(
        'test-user-1',
        'add',
        'property-1',
        5
      );
    });

    it('should broadcast activity update successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activity_update',
          userId: 'test-user-1',
          data: {
            activityType: 'property_view',
            propertyId: 'property-1',
            metadata: { duration: 5000 }
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRealTimeService.broadcastActivityUpdate).toHaveBeenCalledWith(
        'test-user-1',
        'property_view',
        'property-1',
        { duration: 5000 }
      );
    });

    it('should broadcast user stats update successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_stats_update',
          userId: 'test-user-1',
          data: {
            totalViews: 10,
            totalWishlistItems: 3,
            totalActivities: 25
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRealTimeService.broadcastUserStatsUpdate).toHaveBeenCalledWith(
        'test-user-1',
        {
          totalViews: 10,
          totalWishlistItems: 3,
          totalActivities: 25
        }
      );
    });

    it('should broadcast global stats update successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'global_stats_update',
          userId: 'admin-user',
          data: {
            totalUsers: 1000,
            activeUsers: 50,
            totalProperties: 500
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRealTimeService.broadcastGlobalStatsUpdate).toHaveBeenCalledWith({
        totalUsers: 1000,
        activeUsers: 50,
        totalProperties: 500
      });
    });

    it('should handle missing type field', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-1',
          data: { action: 'add' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Type and data are required');
    });

    it('should handle missing data field', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wishlist_update',
          userId: 'test-user-1'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Type and data are required');
    });

    it('should handle unknown event type', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'unknown_event_type',
          userId: 'test-user-1',
          data: { test: 'data' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unknown event type');
    });

    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to broadcast real-time event');
    });

    it('should handle service errors', async () => {
      mockRealTimeService.broadcastWishlistUpdate.mockImplementation(() => {
        throw new Error('Service error');
      });

      const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wishlist_update',
          userId: 'test-user-1',
          data: {
            action: 'add',
            propertyId: 'property-1',
            wishlistCount: 5
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to broadcast real-time event');
    });

    it('should handle concurrent broadcast requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        POST(new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'activity_update',
            userId: `test-user-${i}`,
            data: {
              activityType: 'property_view',
              propertyId: `property-${i}`
            }
          })
        }))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(mockRealTimeService.broadcastActivityUpdate).toHaveBeenCalledTimes(5);
    });
  });

  describe('Real-time Event Types', () => {
    const eventTypes = [
      {
        type: 'wishlist_update',
        data: { action: 'add', propertyId: 'prop-1', wishlistCount: 1 },
        expectedMethod: 'broadcastWishlistUpdate'
      },
      {
        type: 'activity_update',
        data: { activityType: 'search', metadata: { query: 'test' } },
        expectedMethod: 'broadcastActivityUpdate'
      },
      {
        type: 'user_stats_update',
        data: { totalViews: 5 },
        expectedMethod: 'broadcastUserStatsUpdate'
      },
      {
        type: 'global_stats_update',
        data: { totalUsers: 100 },
        expectedMethod: 'broadcastGlobalStatsUpdate'
      }
    ];

    eventTypes.forEach(({ type, data, expectedMethod }) => {
      it(`should handle ${type} event type correctly`, async () => {
        const request = new NextRequest('http://localhost:3000/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            userId: 'test-user-1',
            data
          })
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(mockRealTimeService[expectedMethod]).toHaveBeenCalled();
      });
    });
  });

  describe('SSE Connection Management', () => {
    it('should handle connection cleanup on client disconnect', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=global');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalled();
      
      // The cleanup function should be set up, but we can't easily test it
      // without more complex stream manipulation
    });

    it('should handle multiple concurrent SSE connections', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const requests = Array.from({ length: 3 }, () => 
        GET(new NextRequest('http://localhost:3000/api/realtime?channel=global'))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      });

      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalledTimes(3);
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authenticated user connections', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToUserUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=user');
      const requestWithUser = { ...request, user: { id: 'authenticated-user' } };
      
      const response = await GET(requestWithUser as any);

      expect(response.status).toBe(200);
      expect(mockRealTimeService.subscribeToUserUpdates).toHaveBeenCalledWith(
        'authenticated-user',
        expect.any(Function)
      );
    });

    it('should handle anonymous user connections', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealTimeService.subscribeToGlobalUpdates.mockReturnValue(mockUnsubscribe);

      const request = new NextRequest('http://localhost:3000/api/realtime?channel=user');
      // No user in request (anonymous)
      
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should fall back to global updates for anonymous users
      expect(mockRealTimeService.subscribeToGlobalUpdates).toHaveBeenCalled();
    });
  });
});