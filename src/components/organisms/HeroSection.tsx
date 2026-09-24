import { AnnouncementBadge } from '@/components/molecules/AnnouncementBadge';
import { GradientText } from '@/components/atoms/GradientText';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Magnet } from '@/components/atoms/Magnet';
import { StatItem } from '@/components/molecules/StatItem';
import { heroStats } from '@/data/mockData';
import { useIntersectionObserver } from '@/lib/hooks';
import { useToast } from '@/lib/toast';

export function HeroSection() {
  const { ref: leftRef, isVisible: leftVisible } = useIntersectionObserver<HTMLDivElement>();
  const { ref: rightRef, isVisible: rightVisible } = useIntersectionObserver<HTMLDivElement>();
  const { toast } = useToast();

  const scrollToWorks = () => {
    const worksSection = document.getElementById('works');
    if (worksSection) {
      worksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden grid-texture">
      {/* Bottom light-table glow */}
      <div className="hero-glow" aria-hidden="true" />
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)] overflow-hidden">
          {/* Left Content */}
          <div
            ref={leftRef}
            className={`w-full lg:w-[55%] animate-on-scroll ${leftVisible ? 'visible' : ''}`}
          >
            <AnnouncementBadge text="精选摄影作品持续更新中" className="mb-8" />

            <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-text-primary">
              记录光影 · <GradientText>发现美好</GradientText>
            </h1>

            <p className="text-body text-text-secondary mt-6 max-w-lg">
              为摄影师打造的视觉叙事空间，分享每一个值得铭记的瞬间
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mt-10">
              {heroStats.map((stat, i) => (
                <StatItem key={stat.label} value={stat.value} label={stat.label} delay={i * 80} />
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <Magnet padding={80} magnetStrength={2.5}>
                <Button variant="accent" size="md" onClick={scrollToWorks}>
                  探索作品
                  <Icon name="chevron-right" size={18} />
                </Button>
              </Magnet>
              <Magnet padding={80} magnetStrength={3}>
                <Button variant="outline" size="md" onClick={() => toast('上传功能即将上线')}>
                  上传作品
                </Button>
              </Magnet>
            </div>
          </div>

          {/* Right Visual */}
          <div
            ref={rightRef}
            className={`w-full lg:w-[45%] relative animate-on-scroll ${rightVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Back Card - offset top-left, rotated */}
              <div
                className="absolute -top-8 -left-10 w-[70%] rounded-card overflow-hidden shadow-card z-0"
                style={{ transform: 'rotate(-8deg)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=650&fit=crop"
                  alt="自然风景"
                  className="w-full h-60 object-cover"
                  loading="lazy"
                />
              </div>
              {/* Front Card - main hero image */}
              <div className="relative rounded-card overflow-hidden shadow-card z-10">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=880&fit=crop"
                  alt="精选风景摄影"
                  className="w-full h-[440px] lg:h-[520px] object-cover"
                  width={700}
                  height={880}
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
