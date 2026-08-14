import { ButtonHTMLAttributes, ReactNode } from 'react';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

const sizeMap = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const variantMap = {
  primary:
    'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md active:bg-primary-700',
  secondary:
    'bg-secondary-500 hover:bg-secondary-600 text-white shadow-sm hover:shadow-md active:bg-secondary-700',
  accent:
    'bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow-md active:bg-accent-700',
  danger:
    'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md active:bg-red-700',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-700 active:bg-gray-200',
  outline:
    'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white active:bg-primary-600',
};

export default function AdminButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeMap[size]}
        ${variantMap[variant]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
