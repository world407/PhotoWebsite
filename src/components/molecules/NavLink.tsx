import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function NavLink({ href, children, isActive = false, isMobile = false, onClick, className = '', style }: NavLinkProps) {
  const baseClass = isMobile
    ? 'nav-link text-h3 py-3 px-4 rounded-lg hover:bg-white/5'
    : 'nav-link text-body';

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`${baseClass} ${isActive ? 'active text-text-primary' : 'text-text-secondary'} ${className}`}
      style={style}
    >
      {children}
    </Link>
  );
}
