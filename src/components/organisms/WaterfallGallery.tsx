import { useState, useMemo } from 'react';
import { WorkCard } from '@/components/molecules/WorkCard';
import { TagFilterBar } from '@/components/molecules/TagFilterBar';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { works } from '@/data/mockData';
import type { WorkTag } from '@/types';
import { useIntersectionObserver } from '@/lib/hooks';

interface WaterfallGalleryProps {
  onWorkClick?: (workId: number) => void;
}

export function WaterfallGallery({ onWorkClick }: WaterfallGalleryProps) {
  const [activeTag, setActiveTag] = useState<WorkTag>('all');
  const { ref: headerRef, isVisible: headerVisible } = useIntersectionObserver<HTMLDivElement>();
  const { ref: tagsRef, isVisible: tagsVisible } = useIntersectionObserver<HTMLDivElement>();
  const { ref: galleryRef, isVisible: galleryVisible } = useIntersectionObserver<HTMLDivElement>();

  const filteredWorks = useMemo(() => {
    if (activeTag === 'all') return works;
    return works.filter((w) => w.tag === activeTag);
  }, [activeTag]);

  return (
    <section id="works" className="py-20 lg:py-24">
      <div className="container-main">
        <div
          ref={headerRef}
          className={`animate-on-scroll ${headerVisible ? 'visible' : ''}`}
        >
          <SectionHeader
            title="精选作品"
            description="发现摄影师的视觉叙事"
            actionText="查看全部"
            actionHref="/gallery"
          />
        </div>

        <div
          ref={tagsRef}
          className={`animate-on-scroll ${tagsVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
          <TagFilterBar activeTag={activeTag} onTagChange={setActiveTag} />
        </div>

        <div
          ref={galleryRef}
          className={`waterfall animate-on-scroll ${galleryVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.2s' }}
        >
          {filteredWorks.map((work, index) => (
            <WorkCard
              key={work.id}
              work={work}
              index={index}
              onClick={() => onWorkClick?.(work.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
