import type { CSSProperties } from 'react';

interface ShimmerPlaceholderProps {
  className?: string;
  style?: CSSProperties;
}

export function ShimmerPlaceholder({ className = '', style }: ShimmerPlaceholderProps) {
  return <div className={`img-placeholder absolute inset-0 ${className}`} style={style} />;
}
