import { useState } from 'react';
import { ShimmerPlaceholder } from '@/components/atoms/ShimmerPlaceholder';
import { Icon } from '@/components/atoms/Icon';
import { SpotlightCard } from '@/components/molecules/SpotlightCard';
import type { Work } from '@/types';
import { useIntersectionObserver } from '@/lib/hooks';
import { useFavorites } from '@/lib/favorites';

interface WorkCardProps {
  work: Work;
  index: number;
  onClick?: () => void;
  showAuthor?: boolean;
}

// Helper to build srcset for responsive images
const buildSrcSet = (baseUrl: string): string | undefined => {
  // 仅对支持 w 参数的远程 http(s) 图片（Unsplash）生成 srcset；
  // data:/blob: 等内联地址直接返回 undefined，避免 new URL 改写破坏数据
  if (!/^https?:\/\//i.test(baseUrl)) return undefined;
  try {
    // Unsplash supports w parameter for width
    const widths = [400, 600, 800, 1200];
    return widths
      .map((w) => {
        const url = new URL(baseUrl);
        url.searchParams.set('w', String(w));
        return `${url.toString()} ${w}w`;
      })
      .join(', ');
  } catch {
    return undefined;
  }
};

export function WorkCard({ work, index, onClick, showAuthor = true }: WorkCardProps) {
  const [loaded, setLoaded] = useState(false);
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1, rootMargin: '200px' });
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorited = isFavorite(work.id);

  const handleClick = () => {
    onClick?.();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(work.id);
  };

  return (
    <div
      ref={ref}
      className={`work-card cursor-pointer animate-on-scroll rounded-lg ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div
        className="work-img relative bg-bg-card overflow-hidden rounded-lg"
        style={{ aspectRatio: String(work.aspectRatio) }}
      >
      <SpotlightCard className="absolute inset-0 rounded-lg">
        {/* Color placeholder for CLS prevention */}
        {!loaded && (
          <>
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: work.color || '#1a1a24' }}
            />
            <ShimmerPlaceholder />
          </>
        )}
        
        <img
          src={work.imageUrl}
          srcSet={buildSrcSet(work.imageUrl)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={work.title}
          loading="lazy"
          decoding="async"
          width={600}
          height={Math.round(600 / work.aspectRatio)}
          className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />

        {/* 整图主操作覆盖层：与收藏按钮为兄弟节点，避免 button 嵌套；透明、键盘可聚焦 */}
        <button
          type="button"
          aria-label={`查看作品：${work.title}`}
          onClick={handleClick}
          className="absolute inset-0 z-[5] rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />

        {/* Hover overlay */}
        <div className="work-overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 transition-transform duration-300">
            <h3 className="text-body-sm font-semibold text-white">{work.title}</h3>
            {work.location && (
              <div className="flex items-center gap-1 mt-1 text-white/60 text-caption">
                <Icon name="map-pin" size={12} />
                <span className="truncate">{work.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Top stats (always visible on hover) */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity duration-300 z-10 pointer-events-none">
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-caption px-2 py-1 rounded-full">
            <Icon name="heart" size={12} />
            {work.likes.toLocaleString()}
          </span>
          {work.views && (
            <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-caption px-2 py-1 rounded-full">
              <Icon name="eye" size={12} />
              {(work.views / 1000).toFixed(1)}k
            </span>
          )}
        </div>
      </SpotlightCard>
      </div>
      
      {/* Author info below image (optional) */}
      {showAuthor && (
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            {work.authorAvatar && (
              <img 
                src={work.authorAvatar} 
                alt={work.author}
                className="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
            )}
            <span className="text-caption text-text-secondary">@{work.author}</span>
          </div>
          <button
            type="button"
            className={`p-1 transition-colors ${favorited ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
            onClick={handleToggleFavorite}
            aria-label={favorited ? '取消收藏' : '收藏'}
            aria-pressed={favorited}
          >
            <Icon name="heart" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
