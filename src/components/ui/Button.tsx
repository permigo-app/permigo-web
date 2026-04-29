import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'premium' | 'exam' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-night-brand hover:bg-night-brand-hover text-night-bg-primary font-bold',
    premium: 'bg-night-premium hover:bg-yellow-400 text-night-bg-primary font-bold',
    exam: 'bg-night-exam-orange hover:bg-orange-500 text-white font-bold',
    danger: 'bg-night-error hover:bg-red-600 text-white font-bold',
    success: 'bg-night-success hover:bg-green-500 text-white font-bold',
    ghost: 'bg-transparent border border-night-border-subtle text-night-text-primary hover:bg-night-card-secondary',
  };

  return (
    <button
      className={`
        rounded-2xl
        transition-colors duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </div>
    </button>
  );
}
