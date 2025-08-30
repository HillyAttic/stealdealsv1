'use client';

import React, { useState, useEffect } from 'react';
import { useRealTime } from '@/hooks/useRealTime';
import { useWishlist } from '@/hooks/useWishlist';
import { useActivity } from '@/hooks/useActivity';

interface RealTimeTestProps {
  channel?: 'user' | 'admin' | 'global';
}

export function RealTimeTest({ channel = 'global' }: RealTimeTestProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [testPropertyId] = useState('test-property-123');
  
  const realTime = useRealTime({ channel });
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { logPropertyView, logSearch } = useActivity();

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribe = realTime.subscribe((event) => {
      console.log('[RealTimeTest] Received event:', event);
      setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    });

    return unsubscribe;
  }, []);

  const handleTestWishlistAdd = async () => {
    try {
      await addToWishlist(testPropertyId);
      console.log('[RealTimeTest] Wishlist add triggered');
    } catch (error) {
      console.error('[RealTimeTest] Wishlist add failed:', error);
    }
  };

  const handleTestWishlistRemove = async () => {
    try {
      await removeFromWishlist(testPropertyId);
      console.log('[RealTimeTest] Wishlist remove triggered');
    } catch (error) {
      console.error('[RealTimeTest] Wishlist remove failed:', error);
    }
  };

  const handleTestActivity = async () => {
    try {
      await logPropertyView(testPropertyId, {
        source: 'direct',
        duration: Math.floor(Math.random() * 60000)
      });
      console.log('[RealTimeTest] Activity logged');
    } catch (error) {
      console.error('[RealTimeTest] Activity logging failed:', error);
    }
  };

  const handleTestSearch = async () => {
    try {
      await logSearch('real-time test search', {
        resultsCount: Math.floor(Math.random() * 100)
      });
      console.log('[RealTimeTest] Search logged');
    } catch (error) {
      console.error('[RealTimeTest] Search logging failed:', error);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Real-Time Updates Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Channel:</span> {channel}
          </div>
          <div>
            <span className="font-medium">Connected:</span>{' '}
            <span className={realTime.isConnected ? 'text-green-600' : 'text-red-600'}>
              {realTime.isConnected ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Connecting:</span>{' '}
            <span className={realTime.isConnecting ? 'text-yellow-600' : 'text-gray-600'}>
              {realTime.isConnecting ? '🔄 Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Last Update:</span>{' '}
            {realTime.lastUpdate ? realTime.lastUpdate.toLocaleTimeString() : 'Never'}
          </div>
          <div>
            <span className="font-medium">Attempts:</span> {realTime.connectionAttempts}
          </div>
          <div>
            <span className="font-medium">Error:</span>{' '}
            <span className="text-red-600">{realTime.connectionError || 'None'}</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={realTime.connect}
            disabled={realTime.isConnected || realTime.isConnecting}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={realTime.disconnect}
            disabled={!realTime.isConnected}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Disconnect
          </button>
          <button
            onClick={realTime.reconnect}
            className="px-3 py-1 bg-yellow-500 text-white rounded"
          >
            Reconnect
          </button>
        </div>
      </div>

      {/* Test Actions */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Test Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleTestWishlistAdd}
            disabled={isInWishlist(testPropertyId)}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Add to Wishlist
          </button>
          <button
            onClick={handleTestWishlistRemove}
            disabled={!isInWishlist(testPropertyId)}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Remove from Wishlist
          </button>
          <button
            onClick={handleTestActivity}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Log Property View
          </button>
          <button
            onClick={handleTestSearch}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Log Search
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Test Property: {testPropertyId} (In wishlist: {isInWishlist(testPropertyId) ? 'Yes' : 'No'})
        </div>
      </div>

      {/* Events Log */}
      <div className="p-4 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Real-Time Events ({events.length})</h3>
          <button
            onClick={clearEvents}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No events received yet. Try performing some actions above.
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded border text-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-blue-600">{event.type}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {event.data && (
                  <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}