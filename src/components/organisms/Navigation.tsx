import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/atoms/Logo';
import { IconButton } from '@/components/atoms/IconButton';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Magnet } from '@/components/atoms/Magnet';
import { WarmTooltip, WarmTooltipGroup } from '@/components/atoms/WarmTooltip';
import { NavLink } from '@/components/molecules/NavLink';
import { MobileDrawer } from './MobileDrawer';
import { useScrollPosition } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';

// Navigation items matching prototype
const navItems = [
  { label: '首页', href: '/', isActive: true },
  { label: '探索', href: '/gallery' },
  { label: '收藏夹', href: '/favorites' },
  { label: '摄影师', href: '/photographers' },
];

export function Navigation() {
  const scrolled = useScrollPosition(80);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const closeDrawer = () => setDrawerOpen(false);

  const handleUploadClick = () => {
    if (user) navigate('/upload');
    else openAuthModal('/upload');
  };

  const handleUserClick = () => {
    if (user) navigate('/profile');
    else openAuthModal();
  };

  return (
    <>
      <header className={`nav-header z-50 ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Logo variant="full" />

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                isActive={location.pathname === item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <WarmTooltipGroup delay={350}>
            <div className="flex items-center gap-3">
              <Magnet padding={24} magnetStrength={4}>
                <WarmTooltip content="搜索作品">
                  <IconButton aria-label="搜索" size="sm" onClick={() => navigate('/gallery')}>
                    <Icon name="search" size={18} />
                  </IconButton>
                </WarmTooltip>
              </Magnet>

              <Magnet padding={48} magnetStrength={3} className="hidden sm:inline-block">
                <Button
                  variant="accent"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={handleUploadClick}
                >
                  <Icon name="upload" size={16} />
                  上传作品
                </Button>
              </Magnet>

              <Magnet padding={24} magnetStrength={4}>
                <WarmTooltip content={user ? '个人主页' : '登录 / 注册'}>
                  <IconButton
                    aria-label={user ? '个人主页' : '登录 / 注册'}
                    size="sm"
                    variant="card"
                    onClick={handleUserClick}
                  >
                    {user?.avatarDataUrl ? (
                      <img
                        src={user.avatarDataUrl}
                        alt={user.displayName || user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <Icon name="user" size={16} />
                    )}
                  </IconButton>
                </WarmTooltip>
              </Magnet>

              <Magnet padding={24} magnetStrength={4} className="md:hidden">
                <WarmTooltip content="打开菜单" className="md:hidden">
                  <IconButton
                    aria-label="打开菜单"
                    size="sm"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <Icon name="menu" size={20} />
                  </IconButton>
                </WarmTooltip>
              </Magnet>
            </div>
          </WarmTooltipGroup>
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
