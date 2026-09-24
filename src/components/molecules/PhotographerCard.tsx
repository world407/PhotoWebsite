import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Photographer } from '@/types';
import { useIntersectionObserver } from '@/lib/hooks';

interface PhotographerCardProps {
  photographer: Photographer;
  index: number;
}

export function PhotographerCard({ photographer, index }: PhotographerCardProps) {
  const [isFollowed, setIsFollowed] = useState(photographer.isFollowed ?? false);
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`photographer-card rounded-card p-6 animate-on-scroll ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="avatar-ring w-20 h-20 rounded-full border-transparent p-0.5 mx-auto">
        <img
          src={photographer.avatarUrl}
          alt={photographer.name}
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
        className={`mt-5 w-full ${isFollowed ? 'followed' : ''}`}
        onClick={() => setIsFollowed(!isFollowed)}
      >
        {isFollowed ? '已关注' : '关注'}
      </Button>
    </div>
  );
}
