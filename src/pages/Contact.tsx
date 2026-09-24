import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

const cooperation = [
  {
    icon: 'calendar' as const,
    title: '约拍与合作',
    desc: '个人写真、活动跟拍、品牌内容等商业合作',
  },
  {
    icon: 'image' as const,
    title: '作品授权',
    desc: '图片使用授权、出版与媒体转载',
  },
  {
    icon: 'share' as const,
    title: '展览与出版',
    desc: '画廊展览、画册出版与联合创作',
  },
  {
    icon: 'user' as const,
    title: '创作者入驻',
    desc: '欢迎摄影师入驻，分享你的视觉叙事',
  },
];

export function Contact() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-3xl">
        <SectionHeader title="联系我们" description="合作洽谈与意见反馈" />

        <section className="rounded-card bg-bg-card p-6 md:p-8">
          <h3 className="text-h3 font-semibold text-text-primary">合作方式</h3>
          <p className="text-body-sm text-text-secondary mt-3 leading-relaxed">
            欢迎各类合作。无论是约拍、作品授权还是展览出版，都可以通过邮件与我们联系，我们会在收到邮件后尽快回复。
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
          {cooperation.map((item) => (
            <div key={item.title} className="rounded-card bg-bg-card p-6">
              <Icon name={item.icon} size={24} className="text-accent" />
              <h4 className="text-body font-semibold text-text-primary mt-4">{item.title}</h4>
              <p className="text-caption text-text-secondary mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="rounded-card bg-bg-card p-6 md:p-8 mt-8">
          <h3 className="text-h3 font-semibold text-text-primary">联系方式</h3>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-body-sm text-text-muted w-24 flex-shrink-0">邮箱</span>
              <a
                href="mailto:25158b123@m.gduf.edu.cn"
                className="text-body-sm text-accent hover:text-accent-hover transition-colors"
              >
                25158b123@m.gduf.edu.cn
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-body-sm text-text-muted w-24 flex-shrink-0">帮助中心</span>
              <Link
                to="/help"
                className="text-body-sm text-accent hover:text-accent-hover transition-colors"
              >
                查看使用指南与常见问题
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-body-sm text-text-muted w-24 flex-shrink-0">作品库</span>
              <Link
                to="/gallery"
                className="text-body-sm text-accent hover:text-accent-hover transition-colors"
              >
                浏览全部摄影作品
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/help">
            <Button variant="accent" size="md">
              前往帮助中心
              <Icon name="chevron-right" size={18} />
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="outline" size="md">
              浏览作品库
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
