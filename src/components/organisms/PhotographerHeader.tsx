import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { SmartImage } from '@/components/atoms/SmartImage';
import { AvatarGlow } from '@/components/react-bits/custom';
import { useFollows } from '@/lib/follows';
import type { Photographer } from '@/types';

interface PhotographerHeaderProps {
  photographer: Photographer;
  worksCount: number;
  totalLikes: number;
}

/**
 * 摄影师主页头部：大头像 + 简介 + 真实统计（作品/获赞来自实际作品数据）+ 关注按钮。
 * 视觉与 ProfileHeader 保持同一语言（圆角卡、金色头像环、居中的移动布局）。
 */
export function PhotographerHeader({ photographer, worksCount, totalLikes }: PhotographerHeaderProps) {
  const { isFollowed, toggleFollow } = useFollows();
  const followed = isFollowed(photographer.id);

  return (
    <section className="rounded-card border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <AvatarGlow className="flex-shrink-0 self-center sm:self-auto">
          <SmartImage
            src={photographer.avatarUrl}
            alt={photographer.name}
            fallbackText={photographer.name.slice(0, 1)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-bg-base"
            width={112}
            height={112}
          />
        </AvatarGlow>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-h2 font-semibold text-text-primary">{photographer.name}</h1>
          <p className="text-body-sm text-text-muted mt-2">{photographer.bio}</p>

          <div className="mt-4 flex items-center justify-center sm:justify-start gap-6 text-caption text-text-secondary">
            <span>
              <span className="text-accent font-semibold text-body-sm">{worksCount}</span> 作品
            </span>
            <span className="w-1 h-1 rounded-full bg-text-muted" aria-hidden="true" />
            <span>
              <span className="text-accent font-semibold text-body-sm">{photographer.followers}</span> 粉丝
            </span>
            <span className="w-1 h-1 rounded-full bg-text-muted" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Icon name="heart" size={12} className="text-accent" aria-hidden="true" />
              {totalLikes.toLocaleString()} 获赞
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 self-center sm:self-auto">
          <Button
            variant={followed ? 'outline' : 'follow'}
            aria-pressed={followed}
            onClick={() => toggleFollow(photographer.id)}
          >
            <Icon name={followed ? 'check' : 'plus'} size={16} aria-hidden="true" />
            {followed ? '已关注' : '关注'}
          </Button>
        </div>
      </div>
    </section>
  );
}
