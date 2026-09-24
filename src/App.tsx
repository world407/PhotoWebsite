import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FavoritesProvider } from '@/lib/FavoritesProvider';
import { LikesProvider } from '@/lib/LikesProvider';
import { ToastProvider } from '@/lib/ToastProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import { WorksProvider } from '@/lib/WorksProvider';
import { AuthModal } from '@/components/organisms/AuthModal';

// 首屏关键路由保持同步加载，保证 LCP
import { Home } from '@/pages/Home';
import { Gallery } from '@/pages/Gallery';
import { PhotoDetail } from '@/pages/PhotoDetail';
// NotFound 被 PhotoDetail 静态引用，已在主包内，无需懒加载
import { NotFound } from '@/pages/NotFound';

// 非首屏路由懒加载，减小主入口体积
// 页面均为命名导出，lazy 需 default，统一映射
const Favorites = lazy(() => import('@/pages/Favorites').then((m) => ({ default: m.Favorites })));
const Photographers = lazy(() => import('@/pages/Photographers').then((m) => ({ default: m.Photographers })));
const Help = lazy(() => import('@/pages/Help').then((m) => ({ default: m.Help })));
const Projects = lazy(() => import('@/pages/Projects').then((m) => ({ default: m.Projects })));
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const Journal = lazy(() => import('@/pages/Journal').then((m) => ({ default: m.Journal })));
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })));
const Upload = lazy(() => import('@/pages/Upload').then((m) => ({ default: m.Upload })));
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-text-muted">
        <div className="w-10 h-10 rounded-full border-2 border-border-subtle border-t-accent animate-spin" />
        <span className="text-sm">加载中…</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <WorksProvider>
            <FavoritesProvider>
              <LikesProvider>
                <MainLayout>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/photo/:id" element={<PhotoDetail />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/photographers" element={<Photographers />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </MainLayout>
                <AuthModal />
              </LikesProvider>
            </FavoritesProvider>
          </WorksProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
