import { Icon } from '@/components/atoms/Icon';
import { useMediaQuery } from '@/lib/hooks';
import type { Work } from '@/types';

interface PhotoNavigationProps {
  prevWork?: Work;
  nextWork?: Work;
  onPrevious: () => void;
  onNext: () => void;
}

export function PhotoNavigation({ prevWork, nextWork, onPrevious, onNext }: PhotoNavigationProps) {
  const isMobile = useMediaQuery('(max-width: 639px)');

  if (isMobile) return null;

  return (
    <>
      {prevWork && (
        <button
          type="button"
          onClick={onPrevious}
          aria-label={`上一张：${prevWork.title}`}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-bg-card/80 backdrop-blur-md text-text-secondary hover:text-text-primary hover:bg-bg-card hover:scale-105 active:scale-95 transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 hidden sm:flex items-center justify-center shadow-card"
        >
          <Icon name="chevron-left" size={24} />
        </button>
      )}
      {nextWork && (
        <button
          type="button"
          onClick={onNext}
          aria-label={`下一张：${nextWork.title}`}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-bg-card/80 backdrop-blur-md text-text-secondary hover:text-text-primary hover:bg-bg-card hover:scale-105 active:scale-95 transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 hidden sm:flex items-center justify-center shadow-card"
        >
          <Icon name="chevron-right" size={24} />
        </button>
      )}
    </>
  );
}
