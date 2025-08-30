'use client';

import React from 'react';
import { RealTimeTest } from '@/components/debug/RealTimeTest';

export default function RealTimeTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Real-Time Updates Test</h1>
        
        <div className="space-y-8">
          {/* Global Channel Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Global Channel</h2>
            <RealTimeTest channel="global" />
          </div>
          
          {/* User Channel Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">User Channel</h2>
            <RealTimeTest channel="user" />
          </div>
          
          {/* Admin Channel Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Admin Channel</h2>
            <RealTimeTest channel="admin" />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Open multiple browser tabs to test real-time synchronization</li>
            <li>• Use the test actions to trigger wishlist and activity events</li>
            <li>• Watch the events log to see real-time updates</li>
            <li>• Check browser console for detailed logging</li>
            <li>• Test connection management with connect/disconnect buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}