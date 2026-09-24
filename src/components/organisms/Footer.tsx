import { Link } from 'react-router-dom';
import { Logo } from '@/components/atoms/Logo';
import { SocialIcon } from '@/components/atoms/SocialIcon';
import { Icon } from '@/components/atoms/Icon';

const footerLinks = {
  quickLinks: [
    { label: '首页', href: '/' },
    { label: '探索', href: '/gallery' },
    { label: '摄影师', href: '/photographers' },
    { label: '关于', href: '/about' },
  ],
  categories: [
    { label: '人像', href: '/gallery?tag=portrait' },
    { label: '风景', href: '/gallery?tag=landscape' },
    { label: '街拍', href: '/gallery?tag=street' },
    { label: '建筑', href: '/gallery?tag=architecture' },
  ],
  contact: [
    { label: '帮助中心', href: '/help' },
    { label: '意见反馈', href: '/contact' },
    { label: '合作洽谈', href: '/contact' },
    { label: '隐私政策', href: '#' },
  ],
};

const linkClassName = 'text-caption text-text-muted hover:text-accent transition-colors';

export function Footer() {
  return (
    <footer className="bg-bg-deep border-t border-border-subtle mt-10">
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="minimal" className="mb-4" />
            <p className="text-caption text-text-muted leading-relaxed">
              为摄影师打造的视觉叙事空间，让每一个瞬间都被铭记。
            </p>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-text-primary mb-4">快速链接</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-text-primary mb-4">作品分类</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-text-primary mb-4">联系我们</h4>
            <ul className="space-y-2">
              {footerLinks.contact.map((link) =>
                link.href === '#' ? (
                  <li key={link.label}>
                    <a href={link.href} className={linkClassName}>
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link to={link.href} className={linkClassName}>
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-text-muted">
            © 2026 影·迹 PHOTOGRAPHY. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <SocialIcon href="#" aria-label="微博">
              <Icon name="weibo" size={16} />
            </SocialIcon>
            <SocialIcon href="#" aria-label="Instagram">
              <Icon name="instagram" size={16} />
            </SocialIcon>
            <SocialIcon href="#" aria-label="Twitter">
              <Icon name="twitter" size={16} />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}
