import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/atoms/Icon';
import { WorkCard } from '@/components/molecules/WorkCard';
import { PhotographerHeader } from '@/components/organisms/PhotographerHeader';
import { NotFound } from '@/pages/NotFound';
import { photographers } from '@/data/mockData';
import { useWorks } from '@/lib/works';
import { usePageMeta } from '@/lib/usePageMeta';
import { saveScrollPosition } from '@/lib/hooks';
import type { Work } from '@/types';

export function PhotographerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, ready: worksReady } = useWorks();

  const photographerId = Number(id);
  const photographer = photographers.find((p) => p.id === photographerId);

  const photographerWorks = useMemo(
    () => (Number.isInteger(photographerId) ? works.filter((w) => w.authorId === photographerId) : []),
    [works, photographerId],
  );
  const totalLikes = useMemo(
    () => photographerWorks.reduce((sum, w) => sum + w.likes, 0),
    [photographerWorks],
  );

  // 路由级 title / description / Person 结构化数据
  const pageMeta = useMemo(() => {
    if (!photographer) return { title: '摄影师不存在 · 影·迹 PHOTOGRAPHY' };
    return {
      title: `${photographer.name} · 影·迹 PHOTOGRAPHY`,
      description: photographer.bio,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: photographer.name,
        description: photographer.bio,
        image: photographer.avatarUrl,
      },
    };
  }, [photographer]);
  usePageMeta(pageMeta);

  const openWork = (workId: number) => {
    saveScrollPosition();
    navigate(`/photo/${workId}`);
  };

  // 非法 / 不存在的摄影师 ID：与照片详情一致，渲染 404
  // worksReady 之前不判定，避免用户作品短暂合并时闪烁
  if (!photographer || !worksReady) {
    if (worksReady && !photographer) return <NotFound />;
    return <main className="pt-32 pb-20 md:pt-40" aria-busy="true" />;
  }

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-6xl">
        <nav aria-label="面包屑" className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link
            to="/"
            className="hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          >
            首页
          </Link>
          <Icon name="chevron-right" size={14} className="opacity-50" aria-hidden="true" />
          <Link
            to="/photographers"
            className="hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          >
            摄影师
          </Link>
          <Icon name="chevron-right" size={14} className="opacity-50" aria-hidden="true" />
          <span className="text-text-secondary truncate max-w-[200px] sm:max-w-xs" aria-current="page">
            {photographer.name}
          </span>
        </nav>

        <PhotographerHeader
          photographer={photographer}
          worksCount={photographerWorks.length}
          totalLikes={totalLikes}
        />

        <h2 className="text-h3 font-semibold text-text-primary mt-10 mb-6">
          作品集
          <span className="ml-2 text-body-sm font-normal text-text-muted">
            {photographerWorks.length} 幅
          </span>
        </h2>

        {photographerWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {photographerWorks.map((work: Work, index: number) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                onClick={() => openWork(work.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-border-subtle bg-bg-card/50 py-16 text-center">
            <p className="text-body text-text-primary">这位摄影师还没有发布作品</p>
            <Link
              to="/gallery"
              className="inline-block mt-4 text-body-sm text-accent hover:underline underline-offset-4"
            >
              去发现其他作品
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
