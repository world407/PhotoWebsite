import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ImagePlus, Lock } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { WorkCard } from '@/components/molecules/WorkCard';
import { ProfileHeader } from '@/components/organisms/ProfileHeader';
import { ProfileEditModal } from '@/components/molecules/ProfileEditModal';
import { TabCrossfade } from '@/components/react-bits/custom';
import { useAuth } from '@/lib/auth';
import { useWorks } from '@/lib/works';
import { useFavorites } from '@/lib/favorites';
import { useLikes } from '@/lib/likes';
import { saveScrollPosition } from '@/lib/hooks';
import type { Work } from '@/types';

type ProfileTab = 'mine' | 'favorites' | 'liked';

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'mine', label: '我的作品' },
  { key: 'favorites', label: '我的收藏' },
  { key: 'liked', label: '我的点赞' },
];

export function Profile() {
  const navigate = useNavigate();
  const { user, ready, logout, openAuthModal } = useAuth();
  const { works, myWorks, ready: worksReady } = useWorks();
  const { favoriteIds } = useFavorites();
  const { likedIds } = useLikes();

  const [tab, setTab] = useState<ProfileTab>('mine');
  const [editOpen, setEditOpen] = useState(false);

  const favoriteWorks = useMemo(
    () => works.filter((w) => favoriteIds.includes(w.id)),
    [works, favoriteIds],
  );
  const likedWorks = useMemo(
    () => works.filter((w) => likedIds.includes(w.id)),
    [works, likedIds],
  );
  const totalLikes = useMemo(
    () => myWorks.reduce((sum, w) => sum + w.likes, 0),
    [myWorks],
  );

  const openWork = (workId: number) => {
    saveScrollPosition();
    navigate(`/photo/${workId}`);
  };

  // 认证 / 数据初始化中：不渲染内容避免闪烁
  if (!ready || !worksReady) return <main className="pt-32 pb-20 md:pt-40" aria-busy="true" />;

  return (
    <main className="pt-32 pb-20 md:pt-40">
      <div className="container-main max-w-6xl">
        {!user ? (
          /* 游客引导：不自动弹窗 */
          <div className="rounded-card border border-border-subtle bg-bg-card/50 p-10 sm:p-14 text-center">
            <div
              className="mx-auto w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-5"
              aria-hidden="true"
            >
              <Lock size={22} className="text-accent" />
            </div>
            <h1 className="text-h3 text-text-primary">登录后查看个人主页</h1>
            <p className="text-body-sm text-text-muted mt-2 max-w-sm mx-auto">
              登录后可以管理你发布的作品、收藏与点赞。账号为本地演示账号，信息仅保存在当前浏览器。
            </p>
            <Button variant="accent" size="lg" className="mt-6" onClick={() => openAuthModal()}>
              登录 / 注册
            </Button>
          </div>
        ) : (
          <>
            <ProfileHeader
              user={user}
              worksCount={myWorks.length}
              totalLikes={totalLikes}
              favoritesCount={favoriteIds.length}
              onEdit={() => setEditOpen(true)}
              onLogout={logout}
            />

            {/* Tab 分段器 */}
            <div
              role="tablist"
              aria-label="个人内容分类"
              className="mt-8 flex bg-bg-deep/70 border border-border-subtle rounded-btn p-1 max-w-md"
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  id={`profile-tab-${t.key}`}
                  aria-selected={tab === t.key}
                  aria-controls={`profile-panel-${t.key}`}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2 rounded-md text-body-sm font-medium transition-all duration-200 ease-out ${
                    tab === t.key
                      ? 'bg-accent text-bg-deep'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 内容：交叉淡入，无位移 */}
            <TabCrossfade tabKey={tab}>
              {tab === 'mine' && (
                <Panel id="profile-panel-mine">
                  {myWorks.length > 0 ? (
                    <WorkGrid works={myWorks} onOpen={openWork} />
                  ) : (
                    <EmptyState
                      icon={<ImagePlus size={24} />}
                      title="还没有发布作品"
                      desc="上传你的第一张摄影作品，让更多人看到"
                      actionLabel="去上传"
                      onAction={() => navigate('/upload')}
                    />
                  )}
                </Panel>
              )}
              {tab === 'favorites' && (
                <Panel id="profile-panel-favorites">
                  {favoriteWorks.length > 0 ? (
                    <WorkGrid works={favoriteWorks} onOpen={openWork} />
                  ) : (
                    <EmptyState
                      icon={<Bookmark size={24} />}
                      title="还没有收藏作品"
                      desc="在作品详情页点击收藏，随时回来重温"
                      actionLabel="去发现作品"
                      onAction={() => navigate('/gallery')}
                    />
                  )}
                </Panel>
              )}
              {tab === 'liked' && (
                <Panel id="profile-panel-liked">
                  {likedWorks.length > 0 ? (
                    <WorkGrid works={likedWorks} onOpen={openWork} />
                  ) : (
                    <EmptyState
                      icon={<Heart size={24} />}
                      title="还没有点赞作品"
                      desc="为喜欢的作品点个赞，记录你的审美偏好"
                      actionLabel="去发现作品"
                      onAction={() => navigate('/gallery')}
                    />
                  )}
                </Panel>
              )}
            </TabCrossfade>
          </>
        )}
      </div>

      <ProfileEditModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </main>
  );
}

function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} role="tabpanel" className="pt-6">
      {children}
    </div>
  );
}

/** 作品网格：直接复用 WorkCard 自带的滚动入场，不叠加外层 stagger */
function WorkGrid({ works, onOpen }: { works: Work[]; onOpen: (id: number) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {works.map((work, index) => (
        <WorkCard
          key={work.id}
          work={work}
          index={index}
          onClick={() => onOpen(work.id)}
        />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ icon, title, desc, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-16 sm:py-20 text-center">
      <div
        className="mx-auto w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 text-accent"
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-body text-text-primary font-medium">{title}</p>
      <p className="text-caption text-text-muted mt-2">{desc}</p>
      <Button variant="outline" size="sm" className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
