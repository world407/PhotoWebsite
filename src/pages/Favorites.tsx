import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Stack } from '@/components/molecules/Stack';
import type { StackCard } from '@/components/molecules/Stack';
import { WorkCard } from '@/components/molecules/WorkCard';
import { useWorks } from '@/lib/works';
import { useFavorites } from '@/lib/favorites';
import { saveScrollPosition, restoreScrollPosition } from '@/lib/hooks';

export function Favorites() {
  const { favoriteIds } = useFavorites();
  const { works } = useWorks();
  const navigate = useNavigate();

  const favoriteWorks = useMemo(
    () => works.filter((w) => favoriteIds.includes(w.id)),
    [works, favoriteIds]
  );

  // 页头装饰用卡片堆叠：取前 4 张收藏作品封面
  const stackCards = useMemo<StackCard[]>(
    () => favoriteWorks.slice(0, 4).map((w) => ({ id: w.id, imageUrl: w.imageUrl })),
    [favoriteWorks]
  );

  // Restore scroll position when returning from detail page
  useEffect(() => {
    const saved = restoreScrollPosition();
    if (saved > 0) {
      window.scrollTo({ top: saved, behavior: 'auto' });
    }
  }, []);

  const handleWorkClick = (workId: number) => {
    saveScrollPosition();
    navigate(`/photo/${workId}`);
  };

  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 mb-8">
          <SectionHeader title="我的收藏" description="你收藏的摄影作品" className="!mb-0" />
          {stackCards.length > 0 && (
            <div className="hidden md:block shrink-0 mr-2">
              <Stack
                cards={stackCards}
                cardDimensions={{ width: 140, height: 175 }}
                autoplay
                autoplayDelay={4000}
                pauseOnHover
                sendToBackOnClick
              />
            </div>
          )}
        </div>
        {favoriteWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteWorks.map((work, index) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                onClick={() => handleWorkClick(work.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-body text-text-secondary">还没有收藏的作品</p>
            <p className="text-caption text-text-muted mt-2">
              在作品详情页点击收藏即可加入收藏夹
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
