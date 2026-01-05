"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBuilding, FaTachometerAlt, FaUser, FaSignOutAlt, FaDatabase, FaHeart, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
      name: 'Users',
      href: '/admin/users',
      icon: <FaUser />
    },
    {
      name: 'Wishlist Analytics',
      href: '/admin/wishlist-analytics',
      icon: <FaChartBar />
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
      name: 'Plots',
      href: '/admin/plots',
      icon: <FaBuilding />
    },
    {
      name: 'Migration',
      href: '/admin/migrate',
      icon: <FaDatabase />
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
      <header className="bg-blue-900 text-white py-4 px-4 md:px-6 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 mr-2 rounded hover:bg-blue-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            
            <Link href="/admin/dashboard" className="text-lg md:text-xl font-bold flex items-center">
              <FaBuilding className="mr-2" />
              <span className="hidden sm:inline">StealDeals Admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="mr-2 md:mr-4 text-right">
              <div className="text-xs md:text-sm text-blue-100">Welcome,</div>
              <div className="text-sm md:text-base font-semibold">{userName}</div>
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
      
      <div className="flex flex-1 relative">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar - Desktop: always visible, Mobile: slide-in */}
        <aside className={`
          fixed md:relative top-0 left-0 h-full md:h-auto
          w-64 bg-white border-r border-gray-200 shadow-md
          transform transition-transform duration-300 ease-in-out
          z-50 md:z-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block
          pt-16 md:pt-0
        `}>
          {/* Mobile close button */}
          <div className="md:hidden absolute top-4 right-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-blue-50 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={pathname === item.href ? { color: 'rgb(28, 110, 164)' } : {}}
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
        <main className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 