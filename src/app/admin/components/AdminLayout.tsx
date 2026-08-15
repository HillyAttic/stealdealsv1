"use client";

import { ReactNode, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TbLayoutDashboard, TbBuilding, TbBuildingSkyscraper, TbHome,
  TbBuildingStore, TbUsers, TbUserShield,
  TbChartBar, TbHeart, TbDatabase, TbLogout, TbMenu, TbX,
  TbChevronRight,
} from 'react-icons/tb';
import Cookies from 'js-cookie';
import ClientOnly from '@/components/ClientOnly';
import { ScrollToBottom } from '@/components/ui/ScrollToBottom';
import AdminBreadcrumb from '@/components/admin/ui/AdminBreadcrumb';

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
  permission?: string;
  group?: string;
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
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading admin panel...</p>
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
  const [userEmail, setUserEmail] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch with timeout
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException('Request timeout', 'TimeoutError'));
    }, timeoutMs);
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Suppress AbortError logging for expected timeouts
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.warn(`Request to ${url} timed out after ${timeoutMs}ms`);
      }
      
      throw error;
    }
  };

  // Auth check — runs once on mount
  useEffect(() => {
    const win = window as Window & { __cleanBitdefenderAttributes?: () => void };
    if (win.__cleanBitdefenderAttributes) {
      win.__cleanBitdefenderAttributes();
    }

    const checkAuthAndPermissions = async () => {
      try {
        const response = await fetchWithTimeout('/api/auth/verify-permissions', {
          method: 'GET',
          credentials: 'include',
        }, 8000);

        if (!response.ok) { router.push('/admin/login'); return; }

        const data = await response.json();
        if (!data.success || !data.user) { router.push('/admin/login'); return; }

        const user = data.user;
        setCurrentUser(user);

        if (user.name) {
          setUserName(user.name);
        } else if (user.email) {
          setUserName(user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1));
        }
        setUserEmail(user.email || '');

        // Check permissions for current page
        const authorized = new Set<string>();
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
          const pages = user.effectivePermissions.pages;
          if (pages.dashboard) authorized.add('/admin/dashboard');
          if (pages.vacant) authorized.add('/admin/vacant');
          if (pages.plots) authorized.add('/admin/plots');
          if (pages.franchise) authorized.add('/admin/franchise');
          if (pages.preleased) authorized.add('/admin/Pre-Leased');
          if (user.effectivePermissions.manageUsers || pages.users) {
            authorized.add('/admin/users');
            authorized.add('/admin/manage-admins');
          }
          if (pages.analytics) authorized.add('/admin/wishlist-analytics');
          if (pages.migration) authorized.add('/admin/migrate');
        }

        let isCurrentPageAuthorized = false;
        for (const p of authorized) {
          if (pathname.startsWith(p)) { isCurrentPageAuthorized = true; break; }
        }

        if (!isCurrentPageAuthorized) {
          router.push('/admin/dashboard');
          return;
        }

        setIsAuthChecking(false);
      } catch (error) {
        console.error('[AdminLayout] Auth/permission check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuthAndPermissions();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      Cookies.remove('adminToken', { path: '/' });
      Cookies.remove('adminUser', { path: '/' });
      router.push('/admin/login');
    } catch (error) {
      Cookies.remove('adminToken', { path: '/' });
      Cookies.remove('adminUser', { path: '/' });
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation items grouped
  const navGroups = useMemo(() => {
    if (!currentUser) return [];

    const isSuperuser = currentUser.role === 'superuser';
    const pages = isSuperuser
      ? null
      : currentUser.effectivePermissions.pages;

    const canSee = (perm: string) =>
      isSuperuser || (pages && (pages as any)[perm]);

    const mainItems: NavigationItem[] = [];
    const propertyItems: NavigationItem[] = [];
    const toolsItems: NavigationItem[] = [];

    // Main
    if (canSee('dashboard')) {
      mainItems.push({ name: 'Dashboard', href: '/admin/dashboard', icon: <TbLayoutDashboard />, permission: 'dashboard', group: 'main' });
    }

    // Properties
    if (canSee('vacant')) propertyItems.push({ name: 'Vacant', href: '/admin/vacant', icon: <TbHome />, permission: 'vacant', group: 'properties' });
    if (canSee('plots')) propertyItems.push({ name: 'Plots', href: '/admin/plots', icon: <TbBuilding />, permission: 'plots', group: 'properties' });
    if (canSee('franchise')) propertyItems.push({ name: 'Franchise', href: '/admin/franchise', icon: <TbBuildingStore />, permission: 'franchise', group: 'properties' });
    if (canSee('preleased')) propertyItems.push({ name: 'Pre-Leased', href: '/admin/Pre-Leased', icon: <TbBuildingSkyscraper />, permission: 'preleased', group: 'properties' });

    // Tools
    if (canSee('users')) mainItems.push({ name: 'Users', href: '/admin/users', icon: <TbUsers />, permission: 'users', group: 'main' });
    if (isSuperuser || currentUser.effectivePermissions?.manageUsers) {
      mainItems.push({ name: 'Manage Admins', href: '/admin/manage-admins', icon: <TbUserShield />, group: 'main' });
    }
    if (canSee('analytics')) toolsItems.push({ name: 'Wishlist Analytics', href: '/admin/wishlist-analytics', icon: <TbChartBar />, permission: 'analytics', group: 'tools' });
    if (canSee('migration')) toolsItems.push({ name: 'Migration', href: '/admin/migrate', icon: <TbDatabase />, permission: 'migration', group: 'tools' });

    const groups: { label: string; items: NavigationItem[] }[] = [];
    if (mainItems.length > 0) groups.push({ label: 'Main', items: mainItems });
    if (propertyItems.length > 0) groups.push({ label: 'Properties', items: propertyItems });
    if (toolsItems.length > 0) groups.push({ label: 'Tools', items: toolsItems });

    return groups;
  }, [currentUser]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const userInitial = userName.charAt(0).toUpperCase();

  // Loading state — skeleton layout
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar skeleton */}
        <div className="w-[260px] bg-gradient-to-b from-primary-600 to-primary-800 p-5 hidden md:block">
          <div className="admin-skeleton h-8 w-32 mb-8 opacity-20" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="admin-skeleton h-10 w-full mb-2 opacity-15" />
          ))}
        </div>
        {/* Main area skeleton */}
        <div className="flex-1 p-6">
          <div className="admin-skeleton h-6 w-48 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-skeleton h-24 rounded-xl" />
            ))}
          </div>
          <div className="admin-skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-10
          min-h-screen w-[260px] flex-shrink-0
          bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800
          text-white
          transform transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          shadow-xl md:shadow-none
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <TbBuildingStore className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">StealDeals</h1>
            <p className="text-xs text-white/50 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <TbX className="text-white/70 text-xl" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto admin-scrollbar px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 px-3 mb-3">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          group flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium uppercase tracking-wide
                          transition-all duration-200
                          ${active
                            ? 'bg-white/15 text-white shadow-sm admin-nav-active'
                            : 'text-white/70 hover:text-white hover:bg-white/8'
                          }
                        `}
                      >
                        <span className={`flex-shrink-0 text-lg ${active ? 'text-accent-400' : 'text-white/50 group-hover:text-white/80'}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.name}</span>
                        {active && (
                          <TbChevronRight className="ml-auto text-sm text-white/50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User card at bottom */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/8">
            <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate uppercase tracking-wide">{userName}</p>
              <p className="text-xs text-white/40 truncate uppercase tracking-wider">{currentUser?.role || 'admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg text-white/40 hover:text-red-300 hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Logout"
            >
              <TbLogout className="text-lg" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <TbMenu className="text-xl" />
              </button>
              <AdminBreadcrumb />
            </div>

            <div className="flex items-center gap-3">
              {/* Search indicator */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search...</span>
              </div>

              {/* User avatar (desktop) */}
              <div className="hidden md:flex items-center gap-2.5 pl-4 border-l border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                  {userInitial}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{userName}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden admin-page-enter">
          {children}
        </main>
      </div>

      <ScrollToBottom showProgress={true} />
    </div>
  );
}
