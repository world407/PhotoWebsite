import type { CSSProperties, ReactNode } from 'react';
import './GlassIcons.css';

/** 预置渐变点缀色（已按项目规范降低饱和度与不透明度） */
const gradientMapping: Record<string, string> = {
  gold: 'linear-gradient(hsla(42, 52%, 50%, 0.75), hsla(36, 52%, 42%, 0.75))',
  blue: 'linear-gradient(hsla(223, 40%, 46%, 0.6), hsla(208, 40%, 46%, 0.6))',
  purple: 'linear-gradient(hsla(283, 35%, 48%, 0.6), hsla(268, 35%, 48%, 0.6))',
  red: 'linear-gradient(hsla(3, 40%, 45%, 0.6), hsla(348, 40%, 45%, 0.6))',
  indigo: 'linear-gradient(hsla(253, 35%, 50%, 0.6), hsla(238, 35%, 50%, 0.6))',
  orange: 'linear-gradient(hsla(43, 45%, 46%, 0.6), hsla(28, 45%, 46%, 0.6))',
  green: 'linear-gradient(hsla(123, 30%, 36%, 0.6), hsla(108, 30%, 36%, 0.6))',
};

export interface GlassIconItem {
  /** 图标元素（如 <Icon name="search" />） */
  icon: ReactNode;
  /** 文字标签，同时作为按钮 aria-label */
  label: string;
  /** 预置色名（gold/blue/purple/red/indigo/orange/green）或任意 CSS 颜色 */
  color?: string;
  /** 附加到按钮上的自定义类名 */
  customClass?: string;
  /** 点击回调（缺省时为纯装饰展示） */
  onClick?: () => void;
}

export interface GlassIconsProps {
  items: GlassIconItem[];
  className?: string;
}

export function GlassIcons({ items, className = '' }: GlassIconsProps) {
  const getBackgroundStyle = (color: string): CSSProperties => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div className={`glass-icons ${className}`}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`glass-icon-btn ${item.customClass ?? ''}`}
          aria-label={item.label}
          onClick={item.onClick}
        >
          <span className="glass-icon-btn__back" style={getBackgroundStyle(item.color ?? 'gold')} />
          <span className="glass-icon-btn__front">
            <span className="glass-icon-btn__icon" aria-hidden="true">
              {item.icon}
            </span>
          </span>
          <span className="glass-icon-btn__label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
