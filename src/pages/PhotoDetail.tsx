import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailBreadcrumb } from '@/components/atoms/DetailBreadcrumb';
import { PhotoHero } from '@/components/organisms/PhotoHero';
import { RippleDistortion } from '@/components/organisms/RippleDistortion';
import { PhotoInfo } from '@/components/molecules/PhotoInfo';
import { PhotoActions } from '@/components/molecules/PhotoActions';
import { ExifPanel } from '@/components/molecules/ExifPanel';
import { PhotographerMini } from '@/components/molecules/PhotographerMini';
import { RelatedWorks } from '@/components/organisms/RelatedWorks';
import { PhotoNavigation } from '@/components/molecules/PhotoNavigation';
import { Lightbox } from '@/components/organisms/Lightbox';
import { useWorks } from '@/lib/works';
import type { Work } from '@/types';
import { useSwipe, useMediaQuery } from '@/lib/hooks';
import { NotFound } from '@/pages/NotFound';

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works } = useWorks();
  const mainRef = useRef<HTMLElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 639px)');

  const currentWork = useMemo<Work | undefined>(() => {
    if (!id) return undefined;
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return undefined;
    return works.find((w) => w.id === numericId);
  }, [id, works]);

  const currentIndex = useMemo(() => {
    if (!currentWork) return -1;
    return works.findIndex((w) => w.id === currentWork.id);
  }, [currentWork, works]);

  const prevWork = useMemo(() => {
    if (currentIndex <= 0) return undefined;
    return works[currentIndex - 1];
  }, [currentIndex, works]);

  const nextWork = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= works.length - 1) return undefined;
    return works[currentIndex + 1];
  }, [currentIndex, works]);

  // Sync lightbox index with current work
  useEffect(() => {
    setLightboxIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [currentIndex]);

  const goToWork = useCallback((work: Work) => {
    navigate(`/photo/${work.id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [navigate]);

  const goToGallery = useCallback(() => {
    navigate('/gallery');
  }, [navigate]);

  // Esc: prefer browser navigation semantics (go back), fallback to gallery on direct entry
  const handleEscape = useCallback(() => {
    const state = window.history.state as { idx?: number } | null;
    if (state && typeof state.idx === 'number' && state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/gallery');
    }
  }, [navigate]);

  // Always start the detail page at the top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (prevWork) goToWork(prevWork);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (nextWork) goToWork(nextWork);
          break;
        case 'Escape':
          e.preventDefault();
          handleEscape();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setLightboxOpen(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToWork, handleEscape, prevWork, nextWork]);

  // Preload adjacent works
  useEffect(() => {
    if (!currentWork) return;
    [prevWork, nextWork].forEach((work) => {
      if (!work?.fullUrl) return;
      const img = new Image();
      img.src = work.fullUrl;
    });
  }, [currentWork, prevWork, nextWork]);

  // Swipe navigation
  useSwipe(mainRef, {
    onSwipeLeft: () => {
      if (nextWork) goToWork(nextWork);
    },
    onSwipeRight: () => {
      if (prevWork) goToWork(prevWork);
    },
  });

  if (!currentWork) {
    return <NotFound />;
  }

  return (
    <>
      <main
        ref={mainRef}
        className="min-h-screen bg-bg-base animate-page-enter"
      >
        <div className="container-main px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-6 md:pb-8">
          <DetailBreadcrumb title={currentWork.title} onBack={goToGallery} />
        </div>

        <section className="container-main px-4 sm:px-6 lg:px-8">
          <div className="relative max-h-[50vh] sm:max-h-[70vh] lg:max-h-[85vh] overflow-hidden rounded-image">
            <PhotoHero
              work={currentWork}
              onOpenLightbox={() => setLightboxOpen(true)}
            />
            {/* WebGL 涟漪覆盖层：视觉增强，GL 失败/纹理未就绪/减弱动效时自动降级为原图 */}
            <RippleDistortion src={currentWork.fullUrl || currentWork.imageUrl} />
          </div>
        </section>

        <section className="container-main px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="order-2 lg:order-1 lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="hidden lg:block">
                  <PhotoActions
                    work={currentWork}
                    variant="vertical"
                    onOpenLightbox={() => setLightboxOpen(true)}
                  />
                </div>
                <PhotographerMini work={currentWork} />
              </div>
            </aside>

            <div className="order-1 lg:order-2 lg:col-span-8 space-y-10">
              <div className="space-y-5">
                <PhotoInfo work={currentWork} />
                <div className="flex flex-wrap items-center gap-3 lg:hidden">
                  <PhotoActions
                    work={currentWork}
                    variant="horizontal"
                    onOpenLightbox={() => setLightboxOpen(true)}
                  />
                </div>
              </div>

              <ExifPanel work={currentWork} />
            </div>
          </div>
        </section>

        <section className="container-main px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <RelatedWorks currentWork={currentWork} onWorkClick={goToWork} />
        </section>
      </main>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-16 glass-panel pb-safe">
          <PhotoActions
            work={currentWork}
            variant="bottom-bar"
            onOpenLightbox={() => setLightboxOpen(true)}
          />
        </div>
      )}

      <PhotoNavigation
        prevWork={prevWork}
        nextWork={nextWork}
        onPrevious={() => prevWork && goToWork(prevWork)}
        onNext={() => nextWork && goToWork(nextWork)}
      />

      <Lightbox
        works={works}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
