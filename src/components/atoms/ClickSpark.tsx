import { useRef, type ReactNode, type PointerEvent } from 'react';

/**
 * ClickSpark — 复用 React Bits ClickSpark 组件源码逻辑（原生 SVG + CSS 动画，零依赖）
 * 点击时在指针处迸发细碎微弱火花，仅做操作反馈。尊重 prefers-reduced-motion。
 */
interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  className?: string;
}

export function ClickSpark({
  children,
  sparkColor = 'var(--color-accent)',
  sparkSize = 5,
  sparkRadius = 10,
  sparkCount = 6,
  duration = 280,
  className = 'relative inline-flex',
}: ClickSparkProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const handlePointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.left = `${x}px`;
    svg.style.top = `${y}px`;
    svg.style.width = `${sparkRadius * 2 + sparkSize + 8}px`;
    svg.style.height = `${sparkRadius * 2 + sparkSize + 8}px`;
    svg.style.overflow = 'visible';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10';

    const center = (sparkRadius * 2 + sparkSize + 8) / 2;

    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(center));
      line.setAttribute('y1', String(center));
      line.setAttribute(
        'x2',
        String(center + Math.cos(angle) * (sparkSize + sparkRadius)),
      );
      line.setAttribute(
        'y2',
        String(center + Math.sin(angle) * (sparkSize + sparkRadius)),
      );
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-linecap', 'round');
      line.style.stroke = sparkColor;
      line.style.setProperty('--tx', `${Math.cos(angle) * sparkRadius}px`);
      line.style.setProperty('--ty', `${Math.sin(angle) * sparkRadius}px`);
      line.style.animation = `click-spark ${duration}ms ease-out forwards`;
      svg.appendChild(line);
    }

    container.appendChild(svg);
    window.setTimeout(() => {
      svg.remove();
    }, duration + 50);
  };

  return (
    <span ref={containerRef} className={className} onPointerDown={handlePointerDown}>
      {children}
    </span>
  );
}
