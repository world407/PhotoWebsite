import { Icon } from '@/components/atoms/Icon';
import { GlassIcons, type GlassIconItem } from '@/components/molecules/GlassIcons';
import { SectionHeader } from '@/components/molecules/SectionHeader';

const shortcutList = [
  { keys: '← / →', desc: '上一张 / 下一张作品' },
  { keys: 'Esc', desc: '返回作品库 / 关闭全屏查看' },
  { keys: 'F', desc: '打开全屏查看' },
];

const sections = [
  {
    title: '浏览作品',
    items: [
      '首页展示精选摄影作品，点击任意作品卡片即可进入详情页',
      '作品详情页包含标题、描述、地点、日期与拍摄参数（EXIF）',
      '详情页底部会推荐相关作品，方便持续浏览',
    ],
  },
  {
    title: '作品库（探索）',
    items: [
      '使用顶部搜索框按标题、摄影师、地点或标签搜索作品',
      '使用标签筛选作品分类，支持精选作品开关',
      '可切换最新 / 最热 / 趋势排序，以及瀑布流 / 网格布局',
    ],
  },
  {
    title: '全屏查看（Lightbox）',
    items: [
      '在详情页点击主图或按 F 键进入全屏查看',
      '全屏中可使用左右方向键切换作品，按 Esc 关闭',
      '全屏中可下载或分享当前作品',
    ],
  },
  {
    title: '收藏与分享',
    items: [
      '在详情页点击收藏即可将作品加入收藏夹，刷新后依然保留',
      '收藏的作品可在「收藏夹」页面统一查看',
      '分享与下载按钮位于详情页与全屏查看中',
    ],
  },
];

const helpTopics: GlassIconItem[] = [
  { icon: <Icon name="image" size={22} />, label: '浏览作品', color: 'gold' },
  { icon: <Icon name="search" size={22} />, label: '作品库探索', color: 'blue' },
  { icon: <Icon name="fullscreen" size={22} />, label: '全屏查看', color: 'purple' },
  { icon: <Icon name="bookmark" size={22} />, label: '收藏与分享', color: 'orange' },
];

export function Help() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-3xl">
        <SectionHeader title="帮助中心" description="使用指南与键盘快捷键" />

        <GlassIcons items={helpTopics} />

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-card bg-bg-card p-6">
              <h3 className="text-h3 font-semibold text-text-primary mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-body-sm text-text-secondary leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-card bg-bg-card p-6">
            <h3 className="text-h3 font-semibold text-text-primary mb-4">键盘快捷键</h3>
            <div className="space-y-3">
              {shortcutList.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between text-body-sm"
                >
                  <span className="text-text-secondary">{shortcut.desc}</span>
                  <span className="text-accent font-medium">{shortcut.keys}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
