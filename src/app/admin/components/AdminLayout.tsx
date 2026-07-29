"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBuilding, FaTachometerAlt, FaUser, FaSignOutAlt, FaDatabase, FaChartBar, FaBars, FaTimes, FaUsers, FaUserShield } from 'react-icons/fa';
import Cookies from 'js-cookie';
import ClientOnly from '@/components/ClientOnly';

// Add global type declaration for the window extension
declare global {
  interface Window {
    __cleanBitdefenderAttributes?: () => void;
  }
}

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'superuser' | 'subuser';
  permissions: {
    pages: {
      vacant: boolean;
      plots: boolean;
      franchise: boolean;
      preleased: boolean;
      // NEW PERMISSIONS ADDED
      dashboard: boolean;
      users: boolean;
      wishlist: boolean;
      analytics: boolean;
      migration: boolean;
    };
    viewOthers: boolean;
    editOthers: boolean;
  };
  effectivePermissions: {
    pages: {
      vacant: boolean;
      plots: boolean;
      franchise: boolean;
      preleased: boolean;
      // NEW PERMISSIONS ADDED
      dashboard: boolean;
      users: boolean;
      wishlist: boolean;
      analytics: boolean;
      migration: boolean;
    };
    viewOthers: boolean;
    editOthers: boolean;
    manageUsers: boolean;
  };
}

interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
  permission?: keyof AdminUser['effectivePermissions']['pages'] | 'manageUsers';
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
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Clean any Bitdefender attributes if the global cleaner function exists
    if (window.__cleanBitdefenderAttributes) {
      window.__cleanBitdefenderAttributes();
    }

    // Check if user is authenticated and get permissions
    const checkAuthAndPermissions = async () => {
      try {
        // First verify basic authentication
        const authResponse = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (!authResponse.ok) {
          console.log('Basic authentication failed - redirecting to login');
          router.push('/admin/login');
          return false;
        }

        const authData = await authResponse.json();
        if (!authData.authenticated || !authData.user) {
          console.log('User not authenticated - redirecting to login');
          router.push('/admin/login');
          return false;
        }

        // Now get detailed permissions
        const permissionsResponse = await fetch('/api/auth/verify-permissions', {
          method: 'GET',
          credentials: 'include',
        });

        if (!permissionsResponse.ok) {
          console.log('Failed to get permissions - redirecting to login');
          router.push('/admin/login');
          return false;
        }

        const permissionsData = await permissionsResponse.json();
        if (!permissionsData.success || !permissionsData.user) {
          console.log('Invalid permissions response - redirecting to login');
          router.push('/admin/login');
          return false;
        }

        const user = permissionsData.user;
        setCurrentUser(user);

        // Set user name
        if (user.name) {
          setUserName(user.name);
        } else if (user.email) {
          const name = user.email.split('@')[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }

        // Build set of authorized pages
        const authorized = new Set<string>();

        // For superusers, grant access to all pages
        if (user.role === 'superuser') {
          authorized.add('/admin/dashboard');
          authorized.add('/admin/vacant');
          authorized.add('/admin/plots');
          authorized.add('/admin/franchise');
          authorized.add('/admin/Pre-Leased');
          authorized.add('/admin/users');
          authorized.add('/admin/manage-admins');
          authorized.add('/admin/wishlist-analytics');
          authorized.add('/admin/migrate');
        } else {
          // Dashboard access controlled by permission
          if (user.effectivePermissions.pages.dashboard) {
            authorized.add('/admin/dashboard');
          }

          if (user.effectivePermissions.pages.vacant) {
            authorized.add('/admin/vacant');
          }
          if (user.effectivePermissions.pages.plots) {
            authorized.add('/admin/plots');
          }
          if (user.effectivePermissions.pages.franchise) {
            authorized.add('/admin/franchise');
          }
          if (user.effectivePermissions.pages.preleased) {
            authorized.add('/admin/Pre-Leased');
          }

          // User management permissions
          if (user.effectivePermissions.manageUsers || user.effectivePermissions.pages.users) {
            authorized.add('/admin/users');
            authorized.add('/admin/manage-admins');
          }
        }

        // New permissions for specific sections
        if (user.effectivePermissions.pages.analytics || user.role === 'superuser') {
          authorized.add('/admin/wishlist-analytics');
        }
        if (user.effectivePermissions.pages.migration || user.role === 'superuser') {
          authorized.add('/admin/migrate');
        }

        // Check if current page is authorized
        const currentPath = pathname;
        let isCurrentPageAuthorized = false;

        // Check if current path starts with any authorized path
        for (const authorizedPath of authorized) {
          if (currentPath.startsWith(authorizedPath)) {
            isCurrentPageAuthorized = true;
            break;
          }
        }

        if (!isCurrentPageAuthorized) {
          console.log(`Current page ${currentPath} not authorized, redirecting to dashboard`);
          router.push('/admin/dashboard');
          return false;
        }

        setIsAuthChecking(false);
        return true;
      } catch (error) {
        console.error('Error checking authentication and permissions:', error);
        router.push('/admin/login');
        return false;
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuthAndPermissions();
  }, [router, pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double clicks
    setIsLoggingOut(true);

    try {
      // Call logout API
      await fetch('/api/auth/logout', {
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

  // Navigation items with permission requirements
  const allNavItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <FaTachometerAlt />,      // Permission required - now controlled by dashboard permission
      permission: 'dashboard'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <FaUser />, permission: 'users'
    },
    {
      name: 'Wishlist Analytics',
      href: '/admin/wishlist-analytics',
      icon: <FaChartBar />, permission: 'analytics'
    },
    {
      name: 'Pre-leased',
      href: '/admin/Pre-Leased',
      icon: <FaBuilding />,
      permission: 'preleased'
    },
    {
      name: 'Vacant',
      href: '/admin/vacant',
      icon: <FaBuilding />,
      permission: 'vacant'
    },
    {
      name: 'Franchise',
      href: '/admin/franchise',
      icon: <FaBuilding />,
      permission: 'franchise'
    },
    {
      name: 'Plots',
      href: '/admin/plots',
      icon: <FaBuilding />,
      permission: 'plots'
    },
    {
      name: 'Migration',
      href: '/admin/migrate',
      icon: <FaDatabase />, permission: 'migration'
    },
  ];

  // Filter navigation items based on user permissions
  const getVisibleNavItems = (): NavigationItem[] => {
    if (!currentUser) return [];

    // For superusers, show all navigation items plus Manage Admins
    if (currentUser.role === 'superuser') {
      let superuserNavItems = [...allNavItems];

      // Add "Manage Admins" link for superusers
      const userIndex = superuserNavItems.findIndex(item => item.name === 'Users');
      if (userIndex !== -1) {
        superuserNavItems.splice(userIndex + 1, 0, {
          name: 'Manage Admins',
          href: '/admin/manage-admins',
          icon: <FaUserShield />
        });
      }

      return superuserNavItems;
    }

    const visibleItems = allNavItems.filter(item => {
      // If no permission required, always show
      if (!item.permission) return true;

      // Check page permissions
      if (item.permission in currentUser.effectivePermissions.pages) {
        return currentUser.effectivePermissions.pages[item.permission as keyof AdminUser['effectivePermissions']['pages']];
      }

      return false;
    });

    // Add "Manage Admins" link for superusers only
    if (currentUser.effectivePermissions.manageUsers) {
      // Find the index after "Users" to insert "Manage Admins"
      const userIndex = visibleItems.findIndex(item => item.name === 'Users');
      if (userIndex !== -1) {
        // Insert "Manage Admins" after "Users"
        visibleItems.splice(userIndex + 1, 0, {
          name: 'Manage Admins',
          href: '/admin/manage-admins',
          icon: <FaUserShield />
        });
      }
    }

    return visibleItems;
  };

  const navItems = getVisibleNavItems();

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
              {currentUser && (
                <div className="text-xs text-blue-200 capitalize">
                  {currentUser.role}
                </div>
              )}
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
                    className={`flex items-center p-3 rounded-md transition-colors ${pathname === item.href
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