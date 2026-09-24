/**
 * AnimatedList — 自主实现，非 React Bits 源码组件
 *
 * Props 接口对齐 React Bits AnimatedList 用法（items / onItemSelect /
 * showGradients / enableArrowNavigation / displayScrollbar），视觉重制为暗玻璃风格：
 * - 子项错峰入场（45ms stagger，200ms ease-out，仅 opacity + 8px 位移）
 * - showGradients：极弱金色光泽（非官方炫彩渐变），仅悬停/聚焦微亮
 * - enableArrowNavigation：网格行主序方向键导航（焦点落在项内首个可聚焦元素）
 * - displayScrollbar=false 时隐藏滚动条
 * - prefers-reduced-motion：静态直接渲染
 */
import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './AnimatedList.css';

const INNER_FOCUSABLE =
  'a[href], button:not([disabled]), [role="button"][tabindex="0"], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface AnimatedListProps<T extends ReactNode> {
  items: T[];
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
  className?: string;
  itemClassName?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function AnimatedList<T extends ReactNode>({
  items,
  onItemSelect,
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = true,
  className = '',
  itemClassName = '',
  style,
  ariaLabel,
}: AnimatedListProps<T>) {
  const reducedMotion = useReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!enableArrowNavigation) return;
    const supported = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!supported.includes(e.key)) return;
    e.preventDefault();

    const wrappers = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[data-animated-list-item]'),
    );
    if (!wrappers.length) return;
    const currentIndex = wrappers.findIndex(
      (el) => el === document.activeElement || el.contains(document.activeElement),
    );

    if (e.key === 'Home') {
      focusItemScoped(wrappers, 0);
      return;
    }
    if (e.key === 'End') {
      focusItemScoped(wrappers, items.length - 1);
      return;
    }

    // 依据每行首项 offsetLeft 推算列数
    const tops = wrappers.map((el) => Math.round(el.getBoundingClientRect().top));
    const firstRowEnd = tops.findIndex((t, i) => i > 0 && t !== tops[0]);
    const columns = firstRowEnd === -1 ? wrappers.length : firstRowEnd;
    const fallback = currentIndex === -1 ? 0 : currentIndex;
    let next = fallback;
    if (e.key === 'ArrowRight') next = Math.min(items.length - 1, fallback + 1);
    if (e.key === 'ArrowLeft') next = Math.max(0, fallback - 1);
    if (e.key === 'ArrowDown') next = Math.min(items.length - 1, fallback + columns);
    if (e.key === 'ArrowUp') next = Math.max(0, fallback - columns);
    focusItemScoped(wrappers, next);
  };

  if (reducedMotion) {
    return (
      <ul
        className={`animated-list ${!displayScrollbar ? 'animated-list--no-scrollbar' : ''} ${className}`}
        style={style}
        aria-label={ariaLabel}
        role="list"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <li
            key={index}
            data-animated-list-item
            className={`animated-list__item ${showGradients ? 'animated-list__item--gradient' : ''} ${itemClassName}`}
            onClick={onItemSelect ? () => onItemSelect(item, index) : undefined}
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <motion.ul
      className={`animated-list ${!displayScrollbar ? 'animated-list--no-scrollbar' : ''} ${className}`}
      style={style}
      aria-label={ariaLabel}
      role="list"
      onKeyDown={handleKeyDown}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
      }}
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          data-animated-list-item
          className={`animated-list__item ${showGradients ? 'animated-list__item--gradient' : ''} ${itemClassName}`}
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } },
          }}
          onClick={onItemSelect ? () => onItemSelect(item, index) : undefined}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

function focusItemScoped(wrappers: HTMLElement[], index: number) {
  const target = wrappers[index];
  if (!target) return;
  const inner = target.querySelector<HTMLElement>(INNER_FOCUSABLE);
  (inner ?? target).focus();
}
