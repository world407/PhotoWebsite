/**
 * StaggerItems / StaggerItem — 自主实现，非 React Bits 源码组件
 *
 * 对标 React Bits「Staggered Text」：子元素错峰入场（透明度 + 8px 上移）。
 * 用于弹窗表单项、资料统计数字等有序入场场景。
 * - 容器挂载即播放一次；stagger 默认 45ms，单项 200ms ease-out
 * - prefers-reduced-motion：直接显示静态内容
 */
import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface StaggerItemsProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 子项间隔（秒），默认 0.045 */
  stagger?: number;
  /** 入场延迟（秒），与弹窗整体入场错开 */
  delay?: number;
}

export function StaggerItems({
  children,
  className,
  style,
  stagger = 0.045,
  delay = 0.06,
}: StaggerItemsProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 单项动画时长（秒），默认取容器约定 0.2 */
  duration?: number;
}

export function StaggerItem({ children, className, style, duration = 0.2 }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: [0, 0, 0.2, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
