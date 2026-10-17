"use client";

import { usePathname } from 'next/navigation';
import AdminLayout from './components/AdminLayout';

// Route layout, not a page wrapper: Next preserves it across navigations inside
// /admin, so AdminLayout mounts once per session instead of once per sidebar click.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /admin/login is where you land when auth fails — it must render bare.
  if (pathname === '/admin/login') return <>{children}</>;

  return <AdminLayout>{children}</AdminLayout>;
}
