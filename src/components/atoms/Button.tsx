import type { ButtonVariant, ButtonSize } from '@/types';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-body-sm',
  md: 'px-7 py-3.5 text-body',
  lg: 'w-full py-3 px-6 text-body',
};

const variantClasses: Record<ButtonVariant, string> = {
  accent: 'btn-accent rounded-btn inline-flex items-center gap-2 justify-center',
  outline: 'btn-outline rounded-btn inline-flex items-center gap-2 justify-center',
  follow: 'btn-follow rounded-btn inline-flex items-center justify-center gap-1.5 py-2 text-body-sm font-medium',
  ghost: 'rounded-btn inline-flex items-center gap-2 justify-center',
};

export function Button({
  variant = 'accent',
  size = 'md',
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
}
