import { PhotographerCard } from '@/components/molecules/PhotographerCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { photographers } from '@/data/mockData';
import { useIntersectionObserver } from '@/lib/hooks';

export function PhotographerGrid() {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();

  return (
    <section id="photographers" className="py-20 lg:py-24 border-t border-border-subtle">
      <div className="container-main">
        <div
          ref={ref}
          className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <SectionHeader title="热门摄影师" description="关注你喜欢的创作者" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {photographers.map((photographer, index) => (
            <PhotographerCard key={photographer.id} photographer={photographer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
