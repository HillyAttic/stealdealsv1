"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaKey, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import Cookies from 'js-cookie';
import ClientOnly from '@/components/ClientOnly';

// Add global type declaration for our window extension
declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

export default function AdminLogin() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full mb-4"></div>
            <p>Loading admin login...</p>
          </div>
        </div>
      }
    >
      <AdminLoginContent />
    </ClientOnly>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in - using both cookie methods
  useEffect(() => {
    // Clean any Bitdefender attributes if the global cleaner function exists
    if (typeof window !== 'undefined' && window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }
    
    // Check if we're already logged in
    const checkLoginStatus = async () => {
      try {
        // Try to access a protected endpoint to check if we're logged in
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Important: include cookies
        });
        
        if (response.ok) {
          // Already logged in, redirect to dashboard
          router.push('/admin/dashboard');
        }
      } catch (err) {
        // Not logged in, stay on login page
        console.log('Not logged in yet');
      }
    };
    
    checkLoginStatus();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Submitting login with:', { 
        email: formData.email,
        passwordLength: formData.password.length 
      });

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies in the request
        body: JSON.stringify({
          ...formData,
          adminLogin: true // Flag to indicate this is an admin login
        }),
      });

      const data = await response.json();
      console.log('Login response status:', response.status);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login successful');
      
      // Note: The HTTP-only cookies are set by the server
      // We only need to set the non-HTTP-only ones for client access
      if (data.user) {
        Cookies.set('adminUser', JSON.stringify(data.user), {
          expires: 1,
          path: '/',
          sameSite: 'lax', // Changed from strict to lax for better compatibility
          secure: process.env.NODE_ENV === 'production'
        });
      }
      
      // Wait a moment to ensure cookies are processed
      setTimeout(() => {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
            <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaEnvelope />
              </span>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaKey />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {isLoading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <Link href="/" className="hover:text-blue-800" style={{ color: 'rgb(28, 110, 164)' }}>
              Back to Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 