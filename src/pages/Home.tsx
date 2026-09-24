import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/organisms/HeroSection';
import { WaterfallGallery } from '@/components/organisms/WaterfallGallery';
import { PhotographerGrid } from '@/components/organisms/PhotographerGrid';
import { saveScrollPosition, restoreScrollPosition } from '@/lib/hooks';

export function Home() {
  const navigate = useNavigate();

  const handleWorkClick = useCallback((workId: number) => {
    saveScrollPosition();
    navigate(`/photo/${workId}`);
  }, [navigate]);

  // Restore scroll position when returning from detail page
  useEffect(() => {
    const saved = restoreScrollPosition();
    if (saved > 0) {
      window.scrollTo({ top: saved, behavior: 'auto' });
    }
  }, []);

  return (
    <>
      <HeroSection />
      <WaterfallGallery onWorkClick={handleWorkClick} />
      <PhotographerGrid />
    </>
  );
}
