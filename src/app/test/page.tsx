"use client";

import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Authentication Test - Simplified
          </h1>
          
          <div className="space-y-4">
            <p className="text-lg text-green-600">✅ Page is loading successfully!</p>
            <p className="text-lg">Next.js is working properly without Turbopack.</p>
            
            <div className="mt-8 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">To test authentication:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>Go to the main page: <a href="/" className="underline">http://localhost:3000</a></li>
                <li>Click the "Sign In" button in the header navigation</li>
                <li>The modal should open with sign in/up options</li>
                <li>Try both email/password and Google authentication</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">If authentication still has issues:</h3>
              <p className="text-yellow-700">The system has been set up with fallback mock authentication, so it should work even if the backend APIs aren't fully configured.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;