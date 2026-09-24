import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import './Stack.css';

/** 单张堆叠卡片的数据 */
export interface StackCard {
  id: number;
  imageUrl: string;
  /** 装饰性图片默认 alt="" */
  alt?: string;
}

/** 堆叠容器尺寸（px） */
export interface StackCardDimensions {
  width: number;
  height: number;
}

/** 弹簧动画参数 */
export interface StackAnimationConfig {
  stiffness: number;
  damping: number;
}

export interface StackProps {
  cards: StackCard[];
  cardDimensions?: StackCardDimensions;
  animationConfig?: StackAnimationConfig;
  /** 拖拽位移超过该阈值时换堆 */
  sensitivity?: number;
  /** 点击卡片将其送至堆底 */
  sendToBackOnClick?: boolean;
  /** 自动换堆 */
  autoplay?: boolean;
  /** 自动换堆间隔（ms，最低 3000） */
  autoplayDelay?: number;
  /** 悬停时暂停自动换堆 */
  pauseOnHover?: boolean;
  /** 每张卡片附加随机倾角 */
  randomRotation?: boolean;
  className?: string;
}

const ROTATE_STEP = 3;
const SCALE_STEP = 0.06;
const SRC_WIDTHS = [300, 450, 600];

const buildSrcSet = (imageUrl: string, width: number, height: number): string => {
  try {
    return SRC_WIDTHS.map((w) => {
      const url = new URL(imageUrl);
      url.searchParams.set('w', String(w));
      url.searchParams.set('h', String(Math.round((w * height) / width)));
      return `${url.toString()} ${w}w`;
    }).join(', ');
  } catch {
    return '';
  }
};

interface CardRotateProps {
  children: ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [25, -25]);
  const rotateY = useTransform(x, [-100, 100], [-25, 25]);

  return (
    <motion.div
      className="stack-card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={(_event, info) => {
        if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
          onSendToBack();
        } else {
          x.set(0);
          y.set(0);
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stack({
  cards,
  cardDimensions = { width: 140, height: 175 },
  animationConfig = { stiffness: 260, damping: 20 },
  sensitivity = 100,
  sendToBackOnClick = true,
  autoplay = false,
  autoplayDelay = 4000,
  pauseOnHover = false,
  randomRotation = false,
  className = '',
}: StackProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [stack, setStack] = useState<StackCard[]>(cards);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setStack(cards);
  }, [cards]);

  // 视口外暂停
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 页面不可见时暂停
  useEffect(() => {
    const onVisibilityChange = () => {
      setPageVisible(document.visibilityState === 'visible');
    };
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const sendToBack = useCallback((id: number) => {
    setStack((prev) => {
      const index = prev.findIndex((card) => card.id === id);
      if (index <= 0) return prev;
      const next = [...prev];
      const [card] = next.splice(index, 1);
      next.unshift(card);
      return next;
    });
  }, []);

  const isPaused = !inView || !pageVisible || (pauseOnHover && hovered) || reducedMotion;

  // 自动换堆（间隔不低于 3s）
  useEffect(() => {
    if (!autoplay || isPaused || stack.length <= 1) return;
    const interval = setInterval(() => {
      setStack((prev) => {
        if (prev.length <= 1) return prev;
        const next = [...prev];
        const [top] = next.splice(next.length - 1, 1);
        next.unshift(top);
        return next;
      });
    }, Math.max(autoplayDelay, 3000));
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isPaused, stack.length]);

  const { width, height } = cardDimensions;

  return (
    <div
      ref={containerRef}
      className={`stack-container ${className}`}
      style={{ width, height }}
      aria-hidden="true"
      onMouseEnter={() => {
        if (pauseOnHover) setHovered(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setHovered(false);
      }}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        const cardContent = (
          <motion.div
            className="stack-card"
            onClick={() => {
              if (sendToBackOnClick) sendToBack(card.id);
            }}
            animate={{
              rotateZ: (stack.length - index - 1) * ROTATE_STEP + randomRotate,
              scale: 1 + index * SCALE_STEP - stack.length * SCALE_STEP,
              transformOrigin: '90% 90%',
            }}
            initial={false}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: animationConfig.stiffness, damping: animationConfig.damping }
            }
          >
            <img
              src={card.imageUrl}
              srcSet={buildSrcSet(card.imageUrl, width, height)}
              sizes={`${width}px`}
              alt={card.alt ?? ''}
              loading="lazy"
              decoding="async"
              width={width}
              height={height}
              className="stack-card-image"
            />
          </motion.div>
        );

        return reducedMotion ? (
          <div key={card.id} className="stack-card-static">
            {cardContent}
          </div>
        ) : (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            {cardContent}
          </CardRotate>
        );
      })}
    </div>
  );
}
