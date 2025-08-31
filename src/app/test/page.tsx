"use client";

import React from 'react';
import { ToastTest } from '@/components/test/ToastTest';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test Page
          </h1>
          
          <div className="space-y-4">
            <ToastTest />
            
            <div className="mt-8 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">To test wishlist authentication:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>Go to the franchise page: <a href="/franchise" className="underline">http://localhost:3001/franchise</a></li>
                <li>Try clicking the wishlist heart button on any franchise card</li>
                <li>Without being signed in, you should see a warning toast popup</li>
                <li>The toast should have a "Sign In" button that redirects to the sign-in page</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">Testing the toast system:</h3>
              <p className="text-yellow-700">Click the "Test All Toasts" button above to verify the toast system is working correctly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;