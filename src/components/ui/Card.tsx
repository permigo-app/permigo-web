import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'primary',
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantClasses = {
    primary: 'bg-night-card-primary',
    secondary: 'bg-night-card-secondary',
  };

  return (
    <div
      className={`
        rounded-[22px]
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        border border-night-border-subtle
        ${className}
      `}
    >
      {children}
    </div>
  );
}
