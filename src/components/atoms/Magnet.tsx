import { useState, useRef, type ReactNode, type MouseEvent } from 'react';

/**
 * Magnet — 复用 React Bits Magnet 组件源码逻辑（仅 React，零外部依赖）
 * 鼠标位于元素自身边界内时，内容轻微跟随光标位移，形成磁性吸附反馈。
 * 仅使用 transform，保证 60fps；尊重 prefers-reduced-motion（启用时禁用磁性位移）。
 *
 * 源码路径: src/content/Animations/Magnet/Magnet.jsx
 *
 * 实现说明：官方源码在 window 上监听 mousemove 并用 padding 距离判定激活，
 * 在紧凑布局（如导航栏 gap-3）中相邻按钮的触发区会重叠，导致鼠标悬停 A 按钮时
 * B 按钮也跟着位移。这里改为元素自身的 onMouseEnter/onMouseMove/onMouseLeave
 * 激活，严格限定在元素边界内，同一时刻只有悬停的元素产生位移。
 */
interface MagnetProps {
  children: ReactNode;
  /** @deprecated 保留以兼容调用点；激活区已严格限定为元素自身边界 */
  padding?: number;
  /** 磁性强度系数，数值越大位移越弱（与位移成反比） */
  magnetStrength?: number;
  /** 激活时的 transition（默认 0.3s ease-out） */
  activeTransition?: string;
  /** 失活时的 transition（默认 0.5s ease-in-out，回弹更柔和） */
  inactiveTransition?: string;
  /** 外层 wrapper 的 className（用于响应式隐藏等） */
  wrapperClassName?: string;
  /** 内层（被吸附元素）的 className */
  innerClassName?: string;
  /** 等价于 wrapperClassName，便于直接写 className="hidden md:block" */
  className?: string;
}

export function Magnet({
  children,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  className = '',
}: MagnetProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseEnter = () => {
    if (prefersReducedMotion()) return;
    setIsActive(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || !magnetRef.current) return;
    const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    setPosition({
      x: (e.clientX - centerX) / magnetStrength,
      y: (e.clientY - centerY) / magnetStrength,
    });
  };

  const handleMouseLeave = () => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
  };

  const wrapperClass = `${wrapperClassName} ${className}`.trim();
  const transitionStyle = isActive ? activeTransition : inactiveTransition;

  return (
    <div
      ref={magnetRef}
      className={wrapperClass}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
