import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Camera, Compass, Heart, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { saveScrollPosition } from '@/lib/hooks';
import './MobileDock.css';

// 移植自 docs/react-bits-sources/Dock：macOS 风格悬停放大 Dock，
// 简化为移动端底部导航（去掉 DockLabel 悬浮标签，触屏无 hover 不叠加 tooltip）。

const BASE_ITEM_SIZE = 44;
const MAGNIFICATION = 60;
const DISTANCE = 160;
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

interface MobileDockItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// 导航项与顶部 Navigation 的 navItems 一致；
// 菜单项因 drawerOpen 状态封装在 Navigation 内部无法从 MainLayout 触达，按方案省略，
// 移动端仍可通过顶栏汉堡按钮打开 MobileDrawer。
const dockItems: MobileDockItem[] = [
  { label: '首页', href: '/', icon: Home },
  { label: '探索', href: '/gallery', icon: Compass },
  { label: '收藏夹', href: '/favorites', icon: Heart },
  { label: '摄影师', href: '/photographers', icon: Camera },
];

interface DockItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  mouseX: MotionValue<number>;
  reducedMotion: boolean;
  onSelect: (href: string) => void;
}

function DockItem({ label, href, icon: ItemIcon, isActive, mouseX, reducedMotion, onSelect }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // 鼠标 X 与当前 item 中心的距离 → 目标尺寸（Infinity 时钳回基础尺寸）
  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: BASE_ITEM_SIZE };
    return val - rect.x - rect.width / 2;
  });
  const targetSize = useTransform(
    mouseDistance,
    [-DISTANCE, 0, DISTANCE],
    [BASE_ITEM_SIZE, MAGNIFICATION, BASE_ITEM_SIZE],
  );
  const size = useSpring(targetSize, SPRING);

  const itemSize = reducedMotion ? BASE_ITEM_SIZE : size;

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onSelect(href)}
      style={{ width: itemSize, height: itemSize }}
      className={`mobile-dock-item${isActive ? ' mobile-dock-item--active' : ''}`}
    >
      <span className="mobile-dock-icon">
        <ItemIcon size={22} strokeWidth={1.75} />
      </span>
    </motion.button>
  );
}

export function MobileDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  const mouseX = useMotionValue(Infinity);

  const handleSelect = useCallback(
    (href: string) => {
      if (href === location.pathname) return;
      // 复用列表页“跳转前保存滚动位置”的模式（同 Home/Gallery/Favorites）；
      // 从详情页离开时不覆盖，避免破坏进入详情前已保存的列表滚动位置。
      if (!location.pathname.startsWith('/photo/')) {
        saveScrollPosition();
      }
      navigate(href);
    },
    [location.pathname, navigate],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      mouseX.set(e.clientX);
    },
    [mouseX, reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
  }, [mouseX]);

  return (
    <nav className="mobile-dock-root md:hidden" aria-label="移动端底部导航">
      <div className="mobile-dock-panel" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {dockItems.map((item) => (
          <DockItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            isActive={location.pathname === item.href}
            mouseX={mouseX}
            reducedMotion={reducedMotion}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </nav>
  );
}
