import type { ReactNode } from 'react';

interface SocialIconProps {
  children: ReactNode;
  href: string;
  'aria-label': string;
  className?: string;
}

export function SocialIcon({ children, href, 'aria-label': ariaLabel, className = '' }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`social-icon w-9 h-9 ${className}`}
    >
      {children}
    </a>
  );
}
