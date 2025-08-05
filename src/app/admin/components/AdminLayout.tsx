"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBuilding, FaTachometerAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Cookies from 'js-cookie';
import ClientOnly from '@/components/ClientOnly';

// Add global type declaration for the window extension
declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="p-4 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ClientOnly>
  );
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  useEffect(() => {
    // Clean any Bitdefender attributes if the global cleaner function exists
    if (window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Verify authentication status
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Important to include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            // Extract username from email
            if (data.user.email) {
              const name = data.user.email.split('@')[0];
              setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            }
            setIsAuthChecking(false);
            return true;
          }
        }
        
        // Not authenticated
        console.log('Session expired or invalid - redirecting to login');
        router.push('/admin/login');
        return false;
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/admin/login');
        return false;
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double clicks
    setIsLoggingOut(true);
    
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important to include cookies
      });
      
      // Clear client-side cookies regardless of API response
      Cookies.remove('adminToken', { path: '/' });
      Cookies.remove('adminUser', { path: '/' });
      
      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: still try to clear cookies and redirect
      Cookies.remove('adminToken', { path: '/' });
      Cookies.remove('adminUser', { path: '/' });
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
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
    },
    {
      name: 'Migration',
      href: '/admin/migrate',
      icon: <FaUser />
    }
  ];
  
  // Show loading state while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }
  
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
              disabled={isLoggingOut}
              className="p-2 rounded-full hover:bg-blue-800 transition-colors disabled:opacity-50"
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