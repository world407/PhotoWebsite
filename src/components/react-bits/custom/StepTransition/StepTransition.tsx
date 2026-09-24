/**
 * StepTransition — 自主实现，非 React Bits 源码组件
 *
 * 三步向导的步骤间转场（与 ModalTransition 共用同一转场语言）：
 * 淡入 + 水平 12px 微移，220ms ease-out。前进从右侧进入，后退从左侧进入。
 * stepKey 变化即重播；prefers-reduced-motion 时仅做极短淡入。
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface StepTransitionProps {
  /** 当前步骤标识，变化时触发转场 */
  stepKey: string | number;
  /** 1 = 前进（从右进入），-1 = 后退（从左进入），默认 1 */
  direction?: 1 | -1;
  children: ReactNode;
  className?: string;
}

export function StepTransition({ stepKey, direction = 1, children, className }: StepTransitionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={stepKey}
      className={className}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 * direction }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
