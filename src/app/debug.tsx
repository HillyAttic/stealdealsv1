"use client";

import React, { useEffect, useState } from 'react';

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false);
  const [hasFirebase, setHasFirebase] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if Firebase is loaded
    try {
      import('@/lib/firebase').then(() => {
        setHasFirebase(true);
      }).catch(err => {
        console.error('Firebase error:', err);
      });
    } catch (err) {
      console.error('Firebase import error:', err);
    }

    // Check if Image is working
    try {
      import('next/image').then(() => {
        setHasImage(true);
      }).catch(err => {
        console.error('Image error:', err);
      });
    } catch (err) {
      console.error('Image import error:', err);
    }
  }, []);

  return (
    <div className="p-8 bg-white">
      <h1 className="text-3xl font-bold mb-6">Debug Page</h1>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Basic Rendering Test</h2>
        <p className="text-gray-700">
          {isClient ? "✅ Client-side rendering works" : "❌ Client-side rendering not working"}
        </p>
      </div>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Firebase Test</h2>
        <p className="text-gray-700">
          {hasFirebase ? "✅ Firebase loaded successfully" : "❌ Firebase not loading"}
        </p>
      </div>
      
      <div className="mb-6 p-4 border border-gray-200 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Image Component Test</h2>
        <p className="text-gray-700 mb-2">
          {hasImage ? "✅ Image component imported successfully" : "❌ Image component failed to import"}
        </p>
        <div className="relative w-64 h-64 bg-gray-100 rounded overflow-hidden">
          {isClient && (
            <img 
              src="/logo.svg" 
              alt="Test logo"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
      
      <div className="p-4 border border-red-200 bg-red-50 rounded-md">
        <h2 className="text-xl font-semibold mb-2 text-red-700">Environment Variables</h2>
        <p className="text-gray-700 mb-2">
          Firebase API Key status: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"}
        </p>
      </div>
    </div>
  );
} 