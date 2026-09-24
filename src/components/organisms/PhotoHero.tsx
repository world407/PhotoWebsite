import { useEffect, useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { ShimmerPlaceholder } from '@/components/atoms/ShimmerPlaceholder';
import type { Work } from '@/types';

interface PhotoHeroProps {
  work: Work;
  onOpenLightbox?: () => void;
}

export function PhotoHero({ work, onOpenLightbox }: PhotoHeroProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset loading/error state when switching between works
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [work.id]);

  const fullUrl = work.fullUrl || work.imageUrl;
  const naturalWidth = 1600;
  const naturalHeight = Math.round(naturalWidth / work.aspectRatio);
  // data:/blob: 内联图不设 srcset（同一内联地址重复声明无意义且可能被错误解析）
  const srcSet = /^https?:\/\//i.test(work.imageUrl)
    ? `${work.imageUrl} 600w, ${fullUrl} 1600w`
    : undefined;

  return (
    <section
      className="relative w-full overflow-hidden rounded-image bg-bg-deep"
      style={{ aspectRatio: `${work.aspectRatio}` }}
    >
      {!loaded && !error && (
        <ShimmerPlaceholder className="z-10" style={{ backgroundColor: work.color }} />
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-card text-text-secondary">
          <Icon name="image" size={48} className="opacity-40" />
          <p className="text-sm">图片加载失败</p>
        </div>
      )}

      <img
        src={fullUrl}
        srcSet={srcSet}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        alt={work.title}
        loading="eager"
        decoding="async"
        width={naturalWidth}
        height={naturalHeight}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-smooth ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {onOpenLightbox && (
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label="全屏查看"
          className="absolute top-4 right-4 z-20 icon-btn bg-bg-base/60 backdrop-blur-sm opacity-0 focus:opacity-100 hover:opacity-100 transition-opacity duration-200"
        >
          <Icon name="fullscreen" size={18} />
        </button>
      )}
    </section>
  );
}
