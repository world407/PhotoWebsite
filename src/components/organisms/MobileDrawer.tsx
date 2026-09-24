import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { IconButton } from '@/components/atoms/IconButton';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { NavLink } from '@/components/molecules/NavLink';
import { useBodyScrollLock } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import './MobileDrawer.css';

// 项目统一 ease-smooth 曲线 cubic-bezier(0.4, 0, 0.2, 1)
const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Drawer menu items matching prototype
const drawerItems = [
  { label: '首页', href: '/' },
  { label: '探索', href: '/gallery' },
  { label: '收藏夹', href: '/favorites' },
  { label: '摄影师', href: '/photographers' },
  { label: '关于', href: '/about' },
  { label: '帮助', href: '/help' },
];

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(isOpen);
  const closeTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useBodyScrollLock(isOpen);

  const handleUploadClick = () => {
    onClose();
    if (user) navigate('/upload');
    else openAuthModal('/upload');
  };

  // 关闭动画总时长上限（layers: 0.12 + 0.03 + 0.28 = 0.43s），用于收尾 inert/焦点恢复
  const CLOSE_SETTLE_MS = reduceMotion ? 0 : 450;

  // 开/关：焦点管理 + inert 切换（动画由 motion 声明式驱动）
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (isOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !root.contains(active)) {
        prevFocusRef.current = active;
      }
      root.classList.add('is-open');
      root.removeAttribute('inert');
      panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    } else {
      if (!wasOpenRef.current) {
        // 初始挂载即为关闭态：仅置为不可交互
        root.setAttribute('inert', '');
        return;
      }
      // 立即设 inert 把焦点移出抽屉，避免 aria-hidden 套住聚焦元素（a11y 警告）
      root.setAttribute('inert', '');
      // 关闭动画结束后再收尾视觉状态并恢复焦点
      closeTimerRef.current = window.setTimeout(() => {
        root.classList.remove('is-open');
        prevFocusRef.current?.focus();
        prevFocusRef.current = null;
        closeTimerRef.current = null;
      }, CLOSE_SETTLE_MS);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, CLOSE_SETTLE_MS]);

  // 键盘：Esc 关闭 + Tab 焦点陷阱
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = rootRef.current;
      if (!root) return;
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
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

  // 卸载时清理定时器
  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className="mobile-menu-root fixed inset-0 z-[60] md:hidden"
      aria-hidden={!isOpen}
    >
      <div className="mobile-menu-prelayers" aria-hidden="true">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="mobile-menu-prelayer"
            initial={{ x: '100%' }}
            animate={{ x: isOpen ? '0%' : '100%' }}
            transition={{
              duration: reduceMotion ? 0 : isOpen ? 0.3 : 0.28,
              ease: EASE_SMOOTH,
              delay: reduceMotion ? 0 : isOpen ? i * 0.05 : 0.12 + (1 - i) * 0.03,
            }}
          />
        ))}
      </div>

      <motion.aside
        ref={panelRef}
        className="mobile-menu-panel"
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{
          duration: reduceMotion ? 0 : isOpen ? 0.42 : 0.32,
          ease: EASE_SMOOTH,
          delay: reduceMotion ? 0 : 0.08,
        }}
      >
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-border-subtle">
          <span className="text-h3 font-semibold">菜单</span>
          <IconButton aria-label="关闭菜单" size="md" className="mobile-menu-close" onClick={onClose}>
            <Icon name="close" size={20} />
          </IconButton>
        </div>
        <nav className="flex-1" aria-label="移动端导航">
          <ul className="mobile-menu-list" role="list">
            {drawerItems.map((item, i) => (
              <li key={item.href} className="mobile-menu-item-wrap">
                <NavLink
                  href={item.href}
                  isMobile
                  onClick={onClose}
                  className="mobile-menu-item"
                >
                  <motion.span
                    className="mobile-menu-item-label"
                    initial={{ y: '115%', rotate: 8 }}
                    animate={isOpen ? { y: '0%', rotate: 0 } : { y: '115%', rotate: 8 }}
                    transition={{
                      duration: reduceMotion ? 0 : isOpen ? 0.26 : 0.18,
                      ease: EASE_SMOOTH,
                      delay: reduceMotion
                        ? 0
                        : isOpen
                          ? 0.16 + i * 0.035
                          : (drawerItems.length - 1 - i) * 0.02,
                    }}
                  >
                    {item.label}
                  </motion.span>
                </NavLink>
              </li>
            ))}
          </ul>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={isOpen ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : isOpen ? 0.24 : 0.14,
              ease: EASE_SMOOTH,
              delay: reduceMotion ? 0 : isOpen ? 0.3 : 0,
            }}
          >
            <Button variant="accent" size="lg" className="mobile-menu-cta w-full" onClick={handleUploadClick}>
              <Icon name="upload" size={16} />
              上传作品
            </Button>
          </motion.div>
        </nav>
      </motion.aside>
    </div>
  );
}
