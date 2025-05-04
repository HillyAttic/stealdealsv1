"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBuilding, FaTachometerAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Get user info
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          // Extract username from email
          const name = user.email.split('@')[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };
  
  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <FaTachometerAlt />
    },
    {
      name: 'Pre-leased',
      href: '/admin/Pre-Leased',
      icon: <FaBuilding />
    },
    {
      name: 'Vacant',
      href: '/admin/vacant',
      icon: <FaBuilding />
    },
    {
      name: 'Franchise',
      href: '/admin/franchise',
      icon: <FaBuilding />
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-xl font-bold flex items-center">
            <FaBuilding className="mr-2" />
            StealDeals Admin
          </Link>
          
          <div className="flex items-center">
            <div className="mr-4">
              <div className="text-sm text-blue-100">Welcome,</div>
              <div className="font-semibold">{userName}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-blue-800 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-md hidden md:block">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-blue-50 text-blue-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 