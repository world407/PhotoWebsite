import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { SmartImage } from '@/components/atoms/SmartImage';
import type { Photographer } from '@/types';
import { useIntersectionObserver } from '@/lib/hooks';
import { useFollows } from '@/lib/follows';

interface PhotographerCardProps {
  photographer: Photographer;
  index: number;
}

export function PhotographerCard({ photographer, index }: PhotographerCardProps) {
  const { isFollowed, toggleFollow } = useFollows();
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();

  const followed = isFollowed(photographer.id);

  return (
    <div
      ref={ref}
      className={`photographer-card relative rounded-card p-6 animate-on-scroll ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* 整卡主入口：覆盖层链接，与关注按钮为兄弟节点避免交互嵌套 */}
      <Link
        to={`/photographers/${photographer.id}`}
        aria-label={`查看 ${photographer.name} 的主页`}
        className="absolute inset-0 z-[5] rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      />
      <div className="avatar-ring w-20 h-20 rounded-full border-transparent p-0.5 mx-auto">
        <SmartImage
          src={photographer.avatarUrl}
          alt={photographer.name}
          fallbackText={photographer.name.slice(0, 1)}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
          width={80}
          height={80}
        />
      </div>
      <h3 className="text-h3 font-semibold text-text-primary text-center mt-4">{photographer.name}</h3>
      <p className="text-caption text-text-muted text-center mt-1">{photographer.bio}</p>
      <div className="flex justify-center gap-6 mt-4 text-caption text-text-secondary">
        <span>
          <span className="text-accent font-semibold">{photographer.worksCount}</span> 作品
        </span>
        <span>
          <span className="text-accent font-semibold">{photographer.followers}</span> 粉丝
        </span>
      </div>
      <Button
        variant="follow"
        className={`relative z-10 mt-5 w-full ${followed ? 'followed' : ''}`}
        aria-pressed={followed}
        onClick={() => toggleFollow(photographer.id)}
      >
        {followed ? '已关注' : '关注'}
      </Button>
    </div>
  );
}
