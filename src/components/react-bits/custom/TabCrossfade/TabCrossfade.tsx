/**
 * TabCrossfade — 自主实现，非 React Bits 源码组件
 *
 * Tab 内容切换：交叉淡入，无位移。旧内容 80ms 淡出 → 新内容 180ms 淡入。
 * tabKey 变化即切换；prefers-reduced-motion 时直接显示新内容。
 */
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export interface TabCrossfadeProps {
  tabKey: string;
  children: ReactNode;
  className?: string;
}

export function TabCrossfade({ tabKey, children, className }: TabCrossfadeProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div key={tabKey} className={className}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tabKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
