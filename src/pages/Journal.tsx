import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Icon } from '@/components/atoms/Icon';
import { journalPosts } from '@/data/journal';
import { tagLabels } from '@/data/mockData';

export function Journal() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-3xl">
        <SectionHeader title="摄影日志" description="创作手记与拍摄故事" />

        <div className="space-y-5">
          {journalPosts.map((post) => (
            <article key={post.id} className="group relative rounded-card border border-transparent bg-bg-card p-6 transition-colors duration-200 hover:border-accent/30">
              {/* 整卡主入口：与“相关作品”为兄弟节点，避免链接嵌套 */}
              <Link
                to={`/journal/${post.id}`}
                aria-label={`阅读文章：${post.title}`}
                className="absolute inset-0 z-[5] rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              />
              <div className="flex items-center justify-between">
                <time className="text-caption text-text-muted">{post.date}</time>
                <Link
                  to={`/gallery?tag=${post.tag}`}
                  className="relative z-10 inline-flex items-center gap-1 text-caption text-accent hover:text-accent-hover transition-colors"
                >
                  相关作品
                  <Icon name="chevron-right" size={12} />
                </Link>
              </div>
              <h3 className="text-body font-semibold text-text-primary mt-3 group-hover:text-accent">
                {post.title}
              </h3>
              <p className="text-body-sm text-text-secondary mt-2 leading-relaxed">{post.excerpt}</p>
              <span className="relative z-10 mt-4 inline-flex items-center gap-1 text-caption text-text-muted">
                {tagLabels[post.tag]} · {post.readMinutes} 分钟阅读
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
