import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { photographers } from '@/data/mockData';
import { useWorks } from '@/lib/works';
import type { Work } from '@/types';

interface PhotographerMiniProps {
  work: Work;
}

export function PhotographerMini({ work }: PhotographerMiniProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
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

  const displayWorksCount = photographer?.worksCount ?? 0;
  const displayFollowers = photographer?.followers ?? '0';
  const displayBio = photographer?.bio ?? '摄影师';
  const avatarUrl = photographer?.avatarUrl || work.authorAvatar;

  return (
    <section className="rounded-card bg-bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt={photographer?.name || work.author}
              className="w-full h-full rounded-full object-cover avatar-ring"
              onError={() => setAvatarError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center text-lg font-medium text-text-primary avatar-ring">
              {initials}
            </div>
          )}
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
          onClick={() => setIsFollowed(!isFollowed)}
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
