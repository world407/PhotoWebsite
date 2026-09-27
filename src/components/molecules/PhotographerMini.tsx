import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { SmartImage } from '@/components/atoms/SmartImage';
import { photographers } from '@/data/mockData';
import { useWorks } from '@/lib/works';
import { useFollows } from '@/lib/follows';
import type { Work } from '@/types';

interface PhotographerMiniProps {
  work: Work;
}

export function PhotographerMini({ work }: PhotographerMiniProps) {
  // 无稳定 id 的作者（本地用户作品）无法持久化，退化为内存态
  const [localFollowed, setLocalFollowed] = useState(false);
  const { isFollowed: isPersistedFollowed, toggleFollow: togglePersistedFollow } = useFollows();
  const { works } = useWorks();

  const photographer = useMemo(() => {
    if (work.authorId) {
      const matched = photographers.find((p) => p.id === work.authorId);
      if (matched) return matched;
      // 用户作品（作者不在 mock 摄影师列表）：以当前用户信息构造展示卡
      return {
        name: work.author,
        bio: '本地摄影师',
        worksCount: works.filter((w) => w.authorId === work.authorId).length,
        followers: '0',
        avatarUrl: work.authorAvatar ?? '',
      };
    }
    return photographers.find((p) => p.name === work.author) || {
      name: work.author,
      bio: '摄影师',
      worksCount: 0,
      followers: '0',
      avatarUrl: '',
    };
  }, [work.author, work.authorId, work.authorAvatar, works]);

  const initials = useMemo(() => {
    const name = photographer?.name || work.author || '?';
    return name.slice(0, 1).toUpperCase();
  }, [photographer, work.author]);

  const followId = 'id' in photographer ? photographer.id : undefined;
  const isFollowed = followId !== undefined ? isPersistedFollowed(followId) : localFollowed;
  const handleToggleFollow = () => {
    if (followId !== undefined) togglePersistedFollow(followId);
    else setLocalFollowed((v) => !v);
  };

  const displayWorksCount = photographer?.worksCount ?? 0;
  const displayFollowers = photographer?.followers ?? '0';
  const displayBio = photographer?.bio ?? '摄影师';
  const avatarUrl = photographer?.avatarUrl || work.authorAvatar;

  return (
    <section className="rounded-card bg-bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <SmartImage
            src={avatarUrl}
            alt={photographer?.name || work.author}
            fallbackText={initials}
            className="w-full h-full rounded-full object-cover avatar-ring"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-body font-medium text-text-primary truncate">
            {photographer?.name || work.author}
          </h3>
          <p className="text-caption text-text-muted truncate">{displayBio}</p>
          <div className="mt-1.5 flex items-center gap-3 text-caption text-text-secondary">
            <span>{displayWorksCount} 作品</span>
            <span className="w-1 h-1 rounded-full bg-text-muted" />
            <span>{displayFollowers} 粉丝</span>
          </div>
        </div>

        <Button
          variant={isFollowed ? 'outline' : 'follow'}
          size="sm"
          onClick={handleToggleFollow}
          aria-pressed={isFollowed}
          className="flex-shrink-0"
        >
          {isFollowed ? (
            <>
              <Icon name="check" size={16} />
              已关注
            </>
          ) : (
            <>
              <Icon name="plus" size={16} />
              关注
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
