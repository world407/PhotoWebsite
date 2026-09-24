import { useRef, type ReactNode, type MouseEvent } from 'react';

/**
 * SpotlightCard — 复用 React Bits SpotlightCard 组件源码（纯 CSS + React，零依赖）
 * 鼠标在卡片上方移动时，金色径向光晕跟随光标，仅 opacity 过渡，60fps 友好。
 * 默认光晕色：rgba(212, 168, 83, 0.18) — 适配摄影站点深色主题，不喧宾夺主。
 *
 * 源码路径: src/content/Components/SpotlightCard/SpotlightCard.jsx + .css
 */
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** 光晕颜色，默认金色低透明度 */
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(212, 168, 83, 0.18)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    el.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  );
}
