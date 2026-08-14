import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

export default function AdminCard({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'md',
}: AdminCardProps) {
  const baseStyles = 'rounded-xl transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-gray-100 shadow-sm',
    glass: 'admin-glass shadow-lg',
    gradient: 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg',
    outlined: 'bg-transparent border-2 border-primary-200',
  };

  const hoverClass = hover ? 'admin-card-hover cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingMap[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
