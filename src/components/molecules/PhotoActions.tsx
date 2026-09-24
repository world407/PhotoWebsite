import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { ClickSpark } from '@/components/atoms/ClickSpark';
import { WarmTooltip, WarmTooltipGroup } from '@/components/atoms/WarmTooltip';
import { useFavorites } from '@/lib/favorites';
import { useLikes } from '@/lib/likes';
import type { Work } from '@/types';

type PhotoActionsVariant = 'vertical' | 'horizontal' | 'bottom-bar';

interface PhotoActionsProps {
  work: Work;
  variant?: PhotoActionsVariant;
  onOpenLightbox?: () => void;
  className?: string;
}

interface ActionButton {
  key: string;
  label: string;
  activeLabel?: string;
  icon: 'heart' | 'bookmark' | 'bookmark-check' | 'share' | 'download' | 'fullscreen';
  activeIcon?: 'heart' | 'bookmark' | 'bookmark-check';
  isActive: boolean;
  onClick: () => void;
}

export function PhotoActions({
  work,
  variant = 'horizontal',
  onOpenLightbox,
  className = '',
}: PhotoActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isLiked: isWorkLiked, toggleLike } = useLikes();
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const isFavorited = isFavorite(work.id);
  const isLiked = isWorkLiked(work.id);

  // Track timers so they can be cleaned up on unmount
  const setTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  // Reset transient interaction state when switching between works
  useEffect(() => {
    setLikeAnimating(false);
    setLastAction(null);
  }, [work.id]);

  const handleLike = useCallback(() => {
    toggleLike(work.id);
    setLikeAnimating(true);
    setTimer(() => setLikeAnimating(false), 300);
  }, [toggleLike, work.id, setTimer]);

  const handleFavorite = useCallback(() => {
    toggleFavorite(work.id);
  }, [toggleFavorite, work.id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!successful) throw new Error('Copy failed');
      }
      setLastAction('copied');
      setTimer(() => setLastAction(null), 2000);
    } catch {
      setLastAction('copy-failed');
      setTimer(() => setLastAction(null), 2000);
    }
  }, [setTimer]);

  const handleDownload = useCallback(async () => {
    if (!work.fullUrl) return;
    try {
      const response = await fetch(work.fullUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${work.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimer(() => URL.revokeObjectURL(blobUrl), 5000);
      setLastAction('downloaded');
      setTimer(() => setLastAction(null), 2000);
    } catch {
      setLastAction('download-failed');
      setTimer(() => setLastAction(null), 2000);
    }
  }, [work.fullUrl, work.title, setTimer]);

  const baseButtonClasses =
    'group relative flex items-center justify-center rounded-full transition duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50';

  const sizeClasses = {
    vertical: 'w-11 h-11 bg-bg-card hover:bg-bg-card-hover text-text-secondary hover:text-text-primary',
    horizontal: 'w-10 h-10 bg-bg-card hover:bg-bg-card-hover text-text-secondary hover:text-text-primary',
    'bottom-bar': 'flex-1 h-full flex-col gap-1 text-text-secondary hover:text-text-primary',
  };

  const iconSizes = {
    vertical: 20,
    horizontal: 18,
    'bottom-bar': 20,
  };

  const actions: ActionButton[] = [
    {
      key: 'like',
      label: '点赞',
      activeLabel: '已赞',
      icon: 'heart',
      activeIcon: 'heart',
      isActive: isLiked,
      onClick: handleLike,
    },
    {
      key: 'favorite',
      label: '收藏',
      activeLabel: '已收藏',
      icon: isFavorited ? 'bookmark-check' : 'bookmark',
      activeIcon: 'bookmark-check',
      isActive: isFavorited,
      onClick: handleFavorite,
    },
    {
      key: 'share',
      label: lastAction === 'copied' ? '已复制' : lastAction === 'copy-failed' ? '复制失败' : '分享',
      icon: 'share',
      isActive: false,
      onClick: handleShare,
    },
    {
      key: 'download',
      label:
        lastAction === 'downloaded' ? '已下载' : lastAction === 'download-failed' ? '下载失败' : '下载',
      icon: 'download',
      isActive: false,
      onClick: handleDownload,
    },
  ];

  if (onOpenLightbox) {
    actions.push({
      key: 'fullscreen',
      label: '全屏',
      icon: 'fullscreen',
      isActive: false,
      onClick: onOpenLightbox,
    });
  }

  const sparkWrapperClass =
    variant === 'bottom-bar' ? 'relative inline-flex flex-1 h-full' : 'relative inline-flex';

  const renderButton = (action: ActionButton) => {
    const isHeart = action.key === 'like';
    const isFavorite = action.key === 'favorite';
    const iconName = action.isActive && action.activeIcon ? action.activeIcon : action.icon;
    const isActive = action.isActive || lastAction === 'copied' || lastAction === 'downloaded';

    return (
      <ClickSpark key={action.key} className={sparkWrapperClass}>
        <WarmTooltip
          content={action.isActive && action.activeLabel ? action.activeLabel : action.label}
          className={variant === 'bottom-bar' ? 'h-full w-full' : ''}
        >
        <button
          type="button"
          onClick={action.onClick}
          aria-label={action.isActive && action.activeLabel ? action.activeLabel : action.label}
          aria-pressed={action.isActive}
          className={`${baseButtonClasses} ${sizeClasses[variant]} w-full ${
            isActive ? 'text-accent' : ''
          } ${isHeart && likeAnimating ? 'animate-like-bounce' : ''}`}
        >
          {isFavorite ? (
            /* Icon Morph — bookmark ↔ bookmark-check 交叉形变 */
            <span className="relative inline-flex items-center justify-center">
              <Icon
                name="bookmark"
                size={iconSizes[variant]}
                className={`transition duration-200 ease-out ${
                  isFavorited ? 'scale-[0.4] opacity-0' : 'scale-100 opacity-100'
                }`}
              />
              <Icon
                name="bookmark-check"
                size={iconSizes[variant]}
                className={`absolute inset-0 m-auto transition duration-200 ease-out ${
                  isFavorited ? 'scale-100 opacity-100' : 'scale-[0.4] opacity-0'
                }`}
              />
            </span>
          ) : (
            <Icon
              name={iconName}
              size={iconSizes[variant]}
              className={`transition-transform duration-200 ${
                isHeart && isLiked ? 'text-accent' : ''
              } ${isHeart ? 'group-hover:scale-110' : ''}`}
            />
          )}
          {variant === 'bottom-bar' && (
            <span className="text-xs leading-none">{action.label}</span>
          )}
        </button>
        </WarmTooltip>
      </ClickSpark>
    );
  };

  const wrapperClasses = {
    vertical: 'flex flex-col gap-3',
    horizontal: 'flex flex-wrap items-center gap-2',
    'bottom-bar': 'flex items-stretch h-full',
  };

  return (
    <WarmTooltipGroup delay={350}>
      <div className={`${wrapperClasses[variant]} ${className}`} role="group" aria-label="照片操作">
        {actions.map(renderButton)}
      </div>
    </WarmTooltipGroup>
  );
}
