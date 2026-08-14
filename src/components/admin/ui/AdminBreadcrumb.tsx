"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

interface AdminBreadcrumbProps {
  /** Override automatic path detection with custom items */
  items?: { label: string; href?: string }[];
}

const labelMap: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  vacant: 'Vacant Properties',
  plots: 'Plots',
  franchise: 'Franchise',
  'Pre-Leased': 'Pre-Leased',
  users: 'Users',
  subusers: 'Sub-Users',
  'manage-admins': 'Manage Admins',
  'wishlist-analytics': 'Wishlist Analytics',
  migrate: 'Migration',
  'migrate-images': 'Migrate Images',
  new: 'New',
  test: 'Test',
};

function formatSegment(segment: string): string {
  if (labelMap[segment]) return labelMap[segment];
  // Handle edit-[id] patterns
  if (segment.startsWith('edit-')) return 'Edit';
  if (segment.startsWith('new')) return 'New';
  // Fallback: capitalize and replace hyphens
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  const breadcrumbs = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const isLast = index === segments.length - 1;
      return {
        label: formatSegment(segment),
        href: isLast ? undefined : href,
      };
    });
  })();

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      <Link
        href="/admin/dashboard"
        className="text-gray-400 hover:text-primary-500 transition-colors"
      >
        <FaHome className="w-3.5 h-3.5" />
      </Link>
      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      {breadcrumbs.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {item.href ? (
            <>
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary-500 transition-colors font-medium"
              >
                {item.label}
              </Link>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            <span className="text-gray-800 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
