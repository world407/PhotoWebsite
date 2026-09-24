/**
 * ChipPop — 自主实现，非 React Bits 源码组件
 *
 * 标签 chip 添加反馈：opacity + scale(0.8 → 1)，150ms ease-out 完成。
 * 用途：上传页标签输入器每添加一个标签时弹入。
 * prefers-reduced-motion 时渲染为普通元素。
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface ChipPopProps {
  children: ReactNode;
  className?: string;
}

export function ChipPop({ children, className }: ChipPopProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span className={`inline-flex ${className ?? ''}`}>{children}</span>;
  }

  return (
    <motion.span
      className={`inline-flex ${className ?? ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}
