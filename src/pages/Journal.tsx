import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Icon } from '@/components/atoms/Icon';
import type { WorkTag } from '@/types';

interface JournalPost {
  date: string;
  title: string;
  excerpt: string;
  tag: WorkTag;
}

const posts: JournalPost[] = [
  {
    date: '2026年5月20日',
    title: '在撒哈拉等待一场日落',
    excerpt: '光线从金黄渐入深红，只用了不到十分钟。等待，是风光摄影最重要的功课。',
    tag: 'travel',
  },
  {
    date: '2026年5月5日',
    title: '极简建筑的构成练习',
    excerpt: '少即是多。当画面里只剩线条与色块，构图反而变得清晰而有力。',
    tag: 'architecture',
  },
  {
    date: '2026年4月30日',
    title: '一卷 Portra 400 的日常',
    excerpt: '胶片教会我慢下来。每一次快门都更谨慎，也更有分量。',
    tag: 'still',
  },
  {
    date: '2026年4月15日',
    title: '街拍的温度在于人',
    excerpt: '地铁、街角、咖啡馆——最动人的画面，往往藏在最平凡的瞬间里。',
    tag: 'street',
  },
  {
    date: '2026年3月10日',
    title: '黑白人像的光影逻辑',
    excerpt: '去掉色彩之后，光影的层次就成了唯一的语言。',
    tag: 'blackwhite',
  },
  {
    date: '2026年2月28日',
    title: '追一场极光的夜',
    excerpt: '零下十五度的夜晚，绿色的光带在头顶缓缓展开，那一刻一切都值得。',
    tag: 'nature',
  },
];

export function Journal() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-3xl">
        <SectionHeader title="摄影日志" description="创作手记与拍摄故事" />

        <div className="space-y-5">
          {posts.map((post) => (
            <article key={post.title} className="rounded-card bg-bg-card p-6">
              <div className="flex items-center justify-between">
                <time className="text-caption text-text-muted">{post.date}</time>
                <Link
                  to={`/gallery?tag=${post.tag}`}
                  className="inline-flex items-center gap-1 text-caption text-accent hover:text-accent-hover transition-colors"
                >
                  相关作品
                  <Icon name="chevron-right" size={12} />
                </Link>
              </div>
              <h3 className="text-body font-semibold text-text-primary mt-3">{post.title}</h3>
              <p className="text-body-sm text-text-secondary mt-2 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
