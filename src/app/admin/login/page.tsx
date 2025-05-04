"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaKey, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminLogin: true // Flag to indicate this is an admin login
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token to localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
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
          
          {/* Instructions for demo */}
          <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4">
            <p className="text-sm">
              <strong>Demo Credentials:</strong><br />
              Email: admin@example.com<br />
              Password: admin123
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
            <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <FaEnvelope />
              </span>
              <input
                id="email"
                name="email"
                type="email"
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
            <Link href="/" className="text-blue-900 hover:text-blue-800">
              Back to Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 