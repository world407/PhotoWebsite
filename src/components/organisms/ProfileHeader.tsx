/**
 * ProfileHeader — 个人主页头部资料卡
 *
 * AvatarGlow 头像装饰 + StaggerItems 信息错峰入场（Animated List 同类节奏）。
 */
import { LogOut, Pencil } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { AvatarGlow, StaggerItems, StaggerItem } from '@/components/react-bits/custom';
import type { User } from '@/lib/auth';

interface ProfileHeaderProps {
  user: User;
  worksCount: number;
  totalLikes: number;
  favoritesCount: number;
  onEdit: () => void;
  onLogout: () => void;
}

export function ProfileHeader({
  user,
  worksCount,
  totalLikes,
  favoritesCount,
  onEdit,
  onLogout,
}: ProfileHeaderProps) {
  const initial = (user.displayName || user.username || '?').slice(0, 1).toUpperCase();

  return (
    <section className="rounded-card border border-border-subtle bg-bg-card/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* 头像 */}
        <AvatarGlow className="flex-shrink-0 self-center sm:self-auto">
          {user.avatarDataUrl ? (
            <img
              src={user.avatarDataUrl}
              alt={user.displayName || user.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-bg-base"
            />
          ) : (
            <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-accent/15 text-accent flex items-center justify-center text-3xl font-semibold border-2 border-bg-base">
              {initial}
            </span>
          )}
        </AvatarGlow>

        {/* 信息 */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <StaggerItems stagger={0.06}>
            <StaggerItem>
              <h1 className="text-h3 text-text-primary truncate">
                {user.displayName || user.username}
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-body-sm text-text-muted mt-1">@{user.username}</p>
            </StaggerItem>
            {user.bio && (
              <StaggerItem>
                <p className="text-body-sm text-text-secondary mt-3 leading-relaxed break-words">
                  {user.bio}
                </p>
              </StaggerItem>
            )}
            <StaggerItem>
              <dl className="mt-4 flex items-center justify-center sm:justify-start gap-6">
                <ProfileStat value={worksCount} label="作品" />
                <ProfileStat value={totalLikes} label="获赞" />
                <ProfileStat value={favoritesCount} label="收藏" />
              </dl>
            </StaggerItem>
          </StaggerItems>
        </div>

        {/* 操作 */}
        <div className="flex sm:flex-col gap-2 self-center sm:self-start sm:flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil size={14} />
            编辑资料
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut size={14} />
            退出登录
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dd className="text-stat text-text-primary">{value}</dd>
      <dt className="text-caption text-text-muted">{label}</dt>
    </div>
  );
}
