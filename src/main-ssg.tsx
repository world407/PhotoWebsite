import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ViteReactSSG, type RouteRecord } from 'vite-react-ssg';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ToastProvider } from '@/lib/ToastProvider';
import { AuthProvider } from '@/lib/AuthProvider';
import { WorksProvider } from '@/lib/WorksProvider';
import { FavoritesProvider } from '@/lib/FavoritesProvider';
import { LikesProvider } from '@/lib/LikesProvider';
import { FollowsProvider } from '@/lib/FollowsProvider';
import { ComposeProviders } from '@/lib/ComposeProviders';
import { photographers, works } from '@/data/mockData';
import { journalPosts } from '@/data/journal';

// SSG 渲染在 Node（mock:true 注入 jsdom）中进行：jsdom 未实现 matchMedia，
// 而部分组件在 render 期读取它。此 polyfill 仅在 SSG 构建环境生效。
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/**
 * SSG 专用入口（npm run build:ssg 用，与 CSR 入口 main.tsx 并存）。
 * 预渲染全部内容路由 → 静态 HTML：不执行 JS 的爬虫（含主流 AI 爬虫）
 * 可直接读取作品/摄影师/手记的标题与正文。
 */
const ssgRoutes: RouteRecord[] = [
  {
    path: '/',
    element: (
      <ComposeProviders
        providers={[ToastProvider, AuthProvider, WorksProvider, FavoritesProvider, LikesProvider, FollowsProvider]}
      >
        <MainLayout>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </MainLayout>
      </ComposeProviders>
    ),
    children: [
      { index: true, lazy: () => import('@/pages/Home').then((m) => ({ Component: m.Home })) },
      { path: 'gallery', lazy: () => import('@/pages/Gallery').then((m) => ({ Component: m.Gallery })) },
      {
        path: 'photo/:id',
        lazy: () => import('@/pages/PhotoDetail').then((m) => ({ Component: m.PhotoDetail })),
        getStaticPaths: () => works.map((w) => `photo/${w.id}`),
      },
      { path: 'favorites', lazy: () => import('@/pages/Favorites').then((m) => ({ Component: m.Favorites })) },
      {
        path: 'photographers',
        lazy: () => import('@/pages/Photographers').then((m) => ({ Component: m.Photographers })),
      },
      {
        path: 'photographers/:id',
        lazy: () => import('@/pages/PhotographerDetail').then((m) => ({ Component: m.PhotographerDetail })),
        getStaticPaths: () => photographers.map((p) => `photographers/${p.id}`),
      },
      { path: 'help', lazy: () => import('@/pages/Help').then((m) => ({ Component: m.Help })) },
      { path: 'projects', lazy: () => import('@/pages/Projects').then((m) => ({ Component: m.Projects })) },
      { path: 'about', lazy: () => import('@/pages/About').then((m) => ({ Component: m.About })) },
      { path: 'journal', lazy: () => import('@/pages/Journal').then((m) => ({ Component: m.Journal })) },
      {
        path: 'journal/:id',
        lazy: () => import('@/pages/JournalDetail').then((m) => ({ Component: m.JournalDetail })),
        getStaticPaths: () => journalPosts.map((p) => `journal/${p.id}`),
      },
      { path: 'upload', lazy: () => import('@/pages/Upload').then((m) => ({ Component: m.Upload })) },
      { path: 'profile', lazy: () => import('@/pages/Profile').then((m) => ({ Component: m.Profile })) },
      { path: 'contact', lazy: () => import('@/pages/Contact').then((m) => ({ Component: m.Contact })) },
    ],
  },
];

export const createRoot = ViteReactSSG({ routes: ssgRoutes });
