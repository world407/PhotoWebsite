import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  variant?: 'default' | 'card' | 'accent';
}

const sizeClasses = {
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

const variantClasses = {
  default: '',
  card: 'bg-bg-card hover:text-accent',
  accent: 'btn-accent shadow-lg shadow-accent/30',
};

export function IconButton({
  children,
  size = 'sm',
  className = '',
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  variant = 'default',
}: IconButtonProps) {
  const baseClass = variant === 'accent' ? 'rounded-full flex items-center justify-center' : 'icon-btn rounded-full';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
