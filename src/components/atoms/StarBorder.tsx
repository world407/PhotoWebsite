import type { ElementType, ReactNode, CSSProperties } from 'react';

/**
 * StarBorder — 复用 React Bits StarBorder 组件源码（纯 CSS，零依赖）
 * 两枚金色光点沿边框上下穿梭，形成精致环绕动效。仅 opacity + transform 动画。
 * 尊重 prefers-reduced-motion：启用时降级为静态金色边框（动画在 globals.css 内被全局禁用）。
 *
 * 源码路径: src/content/Animations/StarBorder/StarBorder.jsx + .css
 *
 * 视觉调整：默认 color = 金色 accent #d4a853；边框/底色贴合暗色主题。
 */
interface StarBorderProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** 光点颜色 */
  color?: string;
  /** 动画周期 */
  speed?: string;
  /** 边框厚度 */
  thickness?: number;
  /** 内层底色 */
  backgroundColor?: string;
  /** 内层文字色 */
  textColor?: string;
  /** 内层边框色 */
  borderColor?: string;
  /** 内联样式 */
  style?: CSSProperties;
}

export function StarBorder({
  as: Component = 'div',
  children,
  className = '',
  color = 'var(--color-accent)',
  speed = '8s',
  thickness = 1,
  backgroundColor = 'var(--color-bg-card)',
  textColor = 'var(--color-text-primary)',
  borderColor = 'rgba(212, 168, 83, 0.25)',
  style,
  ...rest
}: StarBorderProps) {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{ padding: `${thickness}px 0`, ...style }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />
      <div
        className="inner-content"
        style={{ background: backgroundColor, color: textColor, borderColor }}
      >
        {children}
      </div>
    </Component>
  );
}
