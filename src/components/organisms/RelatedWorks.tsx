import { useMemo } from 'react';
import { WorkCard } from '@/components/molecules/WorkCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { useWorks } from '@/lib/works';
import type { Work } from '@/types';

interface RelatedWorksProps {
  currentWork: Work;
  onWorkClick: (work: Work) => void;
}

export function RelatedWorks({ currentWork, onWorkClick }: RelatedWorksProps) {
  const { works } = useWorks();

  const relatedWorks = useMemo(() => {
    const sameTag = works.filter(
      (w) => w.id !== currentWork.id && w.tag === currentWork.tag
    );

    const sameAuthor = works.filter(
      (w) =>
        w.id !== currentWork.id &&
        w.author === currentWork.author &&
        !sameTag.some((t) => t.id === w.id)
    );

    const others = works.filter(
      (w) =>
        w.id !== currentWork.id &&
        !sameTag.some((t) => t.id === w.id) &&
        !sameAuthor.some((a) => a.id === w.id)
    );

    return [...sameTag, ...sameAuthor, ...others].slice(0, 4);
  }, [works, currentWork]);

  if (relatedWorks.length === 0) return null;

  return (
    <section aria-label="相关作品">
      <SectionHeader title="相关作品" className="mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {relatedWorks.map((work, index) => (
          <WorkCard
            key={work.id}
            work={work}
            index={index}
            showAuthor={false}
            onClick={() => onWorkClick(work)}
          />
        ))}
      </div>
    </section>
  );
}
