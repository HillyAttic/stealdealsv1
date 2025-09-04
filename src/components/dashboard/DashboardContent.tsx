'use client';

import Link from 'next/link';
import { WelcomeSection } from './WelcomeSection';
import { DashboardStats } from './DashboardStats';
import { EmptyDashboard } from './EmptyDashboard';
import { WishlistSection } from '@/components/wishlist';
import ActivityHistory from './ActivityHistory';
import { AnalyticsPreview } from './AnalyticsPreview';
import { RealTimeAnalytics } from './RealTimeAnalytics';

interface DashboardContentProps {
  userProfile: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    avatar?: string;
  } | null;
}

export function DashboardContent({ userProfile }: DashboardContentProps) {
  if (!userProfile) {
    return <EmptyDashboard />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection user={userProfile} />

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Wishlist Section */}
      <WishlistSection />

      {/* Real-Time Analytics Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Real-Time Analytics & Insights</h2>
            <Link 
              href="/dashboard/analytics"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Full Analytics
            </Link>
          </div>
        </div>
        <div className="p-6">
          <RealTimeAnalytics />
        </div>
      </div>

      {/* Activity History Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link 
              href="/dashboard/activity"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Activity
            </Link>
          </div>
        </div>
        <div className="p-6">
          <ActivityHistory />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/"
            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Properties
          </Link>
          <Link 
            href="/my-wishlist"
            className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            View Wishlist
          </Link>
          <Link 
            href="/dashboard/profile"
            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Update Profile
          </Link>
        </div>
      </div>


    </div>
  );
}