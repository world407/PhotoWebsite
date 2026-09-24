/**
 * ModalTransition — 自主实现，非 React Bits 源码组件
 *
 * 对标 React Bits「Magic Transform」：弹窗整体平滑入场，替代生硬弹出。
 * - backdrop 淡入（200ms）+ panel 淡入 / 上移 8px / 轻微缩放（240ms ease-out）
 * - 内建 Esc 关闭、Tab 焦点陷阱、滚动锁定、点击遮罩关闭、关闭后焦点归还
 * - prefers-reduced-motion：仅保留透明度变化
 *
 * 仅做展示层转场，不承载任何业务逻辑。
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useBodyScrollLock } from '@/lib/hooks';
import './ModalTransition.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 标题元素 id，用于 aria-labelledby */
  labelledBy?: string;
  /** 面板宽度类，默认 max-w-md */
  widthClassName?: string;
  /** 点击遮罩是否关闭，默认 true */
  closeOnBackdropClick?: boolean;
}

export function ModalTransition({
  isOpen,
  onClose,
  children,
  labelledBy,
  widthClassName = 'max-w-md',
  closeOnBackdropClick = true,
}: ModalTransitionProps) {
  const reducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(isOpen);

  // 打开时焦点移入面板、记录原焦点；关闭时归还
  useEffect(() => {
    if (isOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement) prevFocusRef.current = active;
      // 等面板挂载后聚焦第一个可聚焦元素
      const raf = window.requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    prevFocusRef.current?.focus();
    prevFocusRef.current = null;
  }, [isOpen]);

  // Esc 关闭 + Tab 焦点陷阱
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = rootRef.current;
      if (!root) return;
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={rootRef} className="modal-transition-root">
          <motion.div
            className="modal-transition-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            aria-hidden="true"
            onClick={closeOnBackdropClick ? onClose : undefined}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`modal-transition-panel ${widthClassName}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
