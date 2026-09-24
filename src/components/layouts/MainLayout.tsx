import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Navigation } from '@/components/organisms/Navigation';
import { Footer } from '@/components/organisms/Footer';
import { FloatingActions } from '@/components/organisms/FloatingActions';
import { MobileDock } from '@/components/organisms/MobileDock';

// AeroShards 依赖 ogl/vgpu（gzip 69kB），属纯装饰背景，懒加载移出首屏关键路径
const AeroShards = lazy(() => import('@/components/organisms/AeroShards'));

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 全局背景层 — AeroShards 深紫碎片流光（官方源码直用），沉底且不拦截任何交互 */}
      <div className="fixed inset-0 z-[-1] pointer-events-none" aria-hidden="true">
        <Suspense fallback={<div className="w-full h-full bg-bg-base" />}>
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#896ABD"
          accentColor="#A855F7"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather={true}
        />
        </Suspense>
      </div>
      <Navigation />
      {/* pb-16(64px) 防止移动端底部 Dock 遮挡内容，桌面端不加 */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <FloatingActions />
      <MobileDock />
    </div>
  );
}
