import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/atoms/Icon';
import { getExifFields } from '@/lib/exif';
import type { Work } from '@/types';
import { useBodyScrollLock } from '@/lib/hooks';
import { useToast } from '@/lib/toast';

interface LightboxProps {
  works: Work[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ works, currentIndex, isOpen, onClose, onIndexChange }: LightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useBodyScrollLock(isOpen);

  const { toast } = useToast();

  const currentWork = works[currentIndex];

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setImageLoaded(false);
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const goToNext = useCallback(() => {
    if (currentIndex < works.length - 1) {
      setImageLoaded(false);
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, works.length, onIndexChange]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentWork) return;
    const url = currentWork.fullUrl || currentWork.imageUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${currentWork.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      toast('下载已开始');
    } catch {
      toast('下载失败，请重试');
    }
  }, [currentWork, toast]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: currentWork?.title, url });
        toast('分享成功');
      } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url);
        toast('链接已复制');
      } else {
        toast('当前环境不支持分享');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户主动取消分享，不提示失败
      }
      toast('分享失败，请重试');
    }
  }, [currentWork, toast]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrev, goToNext, toggleFullscreen]);

  // Focus management: move focus into dialog, trap Tab, restore on close
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusables = containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleTabTrap);
    return () => {
      window.removeEventListener('keydown', handleTabTrap);
      previous?.focus();
    };
  }, [isOpen]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen) return;
    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };
    if (currentIndex > 0) preloadImage(works[currentIndex - 1].fullUrl || works[currentIndex - 1].imageUrl);
    if (currentIndex < works.length - 1) preloadImage(works[currentIndex + 1].fullUrl || works[currentIndex + 1].imageUrl);
  }, [currentIndex, works, isOpen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  if (!isOpen || !currentWork) return null;

  const imageSrc = currentWork.fullUrl || currentWork.imageUrl;
  const exifFields = getExifFields(currentWork);

  const content = (
    <div
      ref={containerRef}
      className="lightbox-enter fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col outline-none"
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={currentWork.title}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 md:p-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out active:scale-95"
            aria-label="关闭"
          >
            <Icon name="close" size={20} />
          </button>
          <div className="hidden sm:block">
            <h3 className="text-body font-semibold text-white">{currentWork.title}</h3>
            <p className="text-caption text-white/60">
              {currentIndex + 1} / {works.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out active:scale-95"
            aria-label={isFullscreen ? '退出全屏' : '全屏'}
          >
            <Icon name="fullscreen" size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out active:scale-95"
            aria-label="下载"
          >
            <Icon name="download" size={18} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out active:scale-95"
            aria-label="分享"
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 flex items-center justify-center relative px-4 md:px-16 pb-4">
        {/* Prev button */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out hover:scale-110 active:scale-95 z-10"
            aria-label="上一张"
          >
            <Icon name="chevron-left" size={24} />
          </button>
        )}

        {/* Image container */}
        <div key={currentIndex} className="lightbox-pop relative max-w-full max-h-full flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={currentWork.title}
            className={`max-w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Next button */}
        {currentIndex < works.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition duration-200 ease-out hover:scale-110 active:scale-95 z-10"
            aria-label="下一张"
          >
            <Icon name="chevron-right" size={24} />
          </button>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="p-4 md:p-6 glass-panel">
        <div className="max-w-4xl mx-auto">
          <div className="sm:hidden mb-3">
            <h3 className="text-body font-semibold text-white">{currentWork.title}</h3>
            <p className="text-caption text-white/60">
              {currentIndex + 1} / {works.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentWork.authorAvatar && (
                <img
                  src={currentWork.authorAvatar}
                  alt={currentWork.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-body-sm font-medium text-white">@{currentWork.author}</p>
                {currentWork.location && (
                  <p className="text-caption text-white/60 flex items-center gap-1">
                    <Icon name="map-pin" size={12} />
                    {currentWork.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-white/70 text-caption">
                <Icon name="heart" size={14} />
                {currentWork.likes.toLocaleString()}
              </span>
              {currentWork.views && (
                <span className="flex items-center gap-1 text-white/70 text-caption">
                  <Icon name="eye" size={14} />
                  {currentWork.views.toLocaleString()}
                </span>
              )}
              {currentWork.createdAt && (
                <span className="flex items-center gap-1 text-white/70 text-caption">
                  <Icon name="calendar" size={14} />
                  {currentWork.createdAt}
                </span>
              )}
            </div>
          </div>

          {currentWork.description && (
            <p className="text-body-sm text-white/70 mt-3 max-w-2xl">{currentWork.description}</p>
          )}

          {/* EXIF data */}
          {exifFields.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 pt-4 border-t border-white/10">
              {exifFields.map((field) => (
                <span key={field.key} className="text-caption text-white/50">
                  {field.key === 'iso' ? `ISO ${field.value}` : field.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
