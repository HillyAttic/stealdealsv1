import { ReactNode } from 'react';

interface AdminStatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'purple';
  className?: string;
  subtitle?: string;
}

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-500',
    text: 'text-primary-600',
    ring: 'ring-primary-100',
  },
  secondary: {
    bg: 'bg-secondary-50',
    icon: 'bg-secondary-500',
    text: 'text-secondary-600',
    ring: 'ring-secondary-100',
  },
  accent: {
    bg: 'bg-accent-50',
    icon: 'bg-accent-500',
    text: 'text-accent-600',
    ring: 'ring-accent-100',
  },
  success: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
    ring: 'ring-red-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
    ring: 'ring-purple-100',
  },
};

export default function AdminStat({
  label,
  value,
  icon,
  trend,
  color = 'primary',
  className = '',
  subtitle,
}: AdminStatProps) {
  const colors = colorMap[color];

  return (
    <div className={`rounded-xl p-5 bg-white border border-gray-100 shadow-sm admin-card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
            {label}
          </p>
          <p className={`text-2xl font-bold text-gray-900 mt-1.5 ${colors.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-semibold ${
                  trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`flex-shrink-0 w-11 h-11 rounded-xl ${colors.icon} text-white flex items-center justify-center shadow-sm ring-4 ${colors.ring}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
