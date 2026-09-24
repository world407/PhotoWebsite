import { SectionHeader } from '@/components/molecules/SectionHeader';
import { PhotographerCard } from '@/components/molecules/PhotographerCard';
import { OrbitImages } from '@/components/molecules/OrbitImages';
import type { OrbitImage } from '@/components/molecules/OrbitImages';
import { photographers } from '@/data/mockData';

const orbitImages: OrbitImage[] = photographers.slice(0, 5).map((photographer) => ({
  src: photographer.avatarUrl,
  alt: '',
}));

export function Photographers() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main">
        <div className="flex items-center justify-between gap-10 mb-8">
          <SectionHeader title="摄影师" description="发现优秀的摄影创作者" className="flex-1 !mb-0" />
          <OrbitImages
            images={orbitImages}
            shape="circle"
            baseWidth={320}
            radius={128}
            itemSize={56}
            duration={42}
            width={320}
            height={320}
            showPath
            pathColor="var(--color-glass-border)"
            className="hidden md:block shrink-0 pointer-events-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {photographers.map((photographer, index) => (
            <PhotographerCard key={photographer.id} photographer={photographer} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
