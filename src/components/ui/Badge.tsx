import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'premium' | 'success' | 'error' | 'info';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-night-card-secondary text-night-text-secondary',
    premium: 'bg-night-premium/20 text-night-premium',
    success: 'bg-night-success/20 text-night-success',
    error: 'bg-night-error/20 text-night-error',
    info: 'bg-night-brand/20 text-night-brand',
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-semibold
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
