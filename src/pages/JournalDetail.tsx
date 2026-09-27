import { Link, useParams } from 'react-router-dom';
import { Icon } from '@/components/atoms/Icon';
import { SmartImage } from '@/components/atoms/SmartImage';
import { NotFound } from '@/pages/NotFound';
import { journalPosts, getJournalPost, type JournalBlock } from '@/data/journal';
import { photographers, tagLabels } from '@/data/mockData';

function BlockRenderer({ block }: { block: JournalBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-body text-text-secondary leading-loose">{block.text}</p>
      );
    case 'quote':
      return (
        <blockquote className="border-l-2 border-accent pl-5 py-1 my-2">
          <p className="text-body text-text-primary italic leading-relaxed">{block.text}</p>
        </blockquote>
      );
    case 'heading':
      return (
        <h2 className="text-h3 font-semibold text-text-primary pt-2">{block.text}</h2>
      );
    case 'image':
      return (
        <figure className="my-2">
          <div className="rounded-img overflow-hidden bg-bg-deep" style={{ aspectRatio: '3 / 2' }}>
            <SmartImage
              src={block.src}
              alt={block.alt}
              loading="lazy"
              decoding="async"
              width={1200}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="text-caption text-text-muted text-center mt-3">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

interface NavPost {
  id: string;
  title: string;
}

function PostNav({ prev, next }: { prev?: NavPost; next?: NavPost }) {
  return (
    <nav aria-label="日志导航" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {prev ? (
        <Link
          to={`/journal/${prev.id}`}
          className="group rounded-card border border-border-subtle bg-bg-card/50 p-4 hover:border-accent/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <span className="flex items-center gap-1 text-caption text-text-muted">
            <Icon name="chevron-left" size={12} />
            上一篇
          </span>
          <span className="block mt-1 text-body-sm text-text-primary truncate group-hover:text-accent transition-colors duration-200">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" aria-hidden="true" />
      )}
      {next && (
        <Link
          to={`/journal/${next.id}`}
          className="group rounded-card border border-border-subtle bg-bg-card/50 p-4 text-right sm:col-start-2 hover:border-accent/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <span className="flex items-center justify-end gap-1 text-caption text-text-muted">
            下一篇
            <Icon name="chevron-right" size={12} />
          </span>
          <span className="block mt-1 text-body-sm text-text-primary truncate group-hover:text-accent transition-colors duration-200">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

export function JournalDetail() {
  const { id } = useParams<{ id: string }>();
  const post = getJournalPost(id);

  if (!post) return <NotFound />;

  const index = journalPosts.findIndex((p) => p.id === post.id);
  // 列表按时间倒序展示：「下一篇」是列表中更新的一篇（索引更小）
  const prev = index < journalPosts.length - 1 ? journalPosts[index + 1] : undefined;
  const next = index > 0 ? journalPosts[index - 1] : undefined;
  const author = photographers.find((p) => p.id === post.authorId);
  const tagLabel = tagLabels[post.tag as string] ?? post.tag;

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main max-w-3xl">
        {/* 面包屑 */}
        <nav aria-label="面包屑" className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link
            to="/"
            className="hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          >
            首页
          </Link>
          <Icon name="chevron-right" size={14} className="opacity-50" aria-hidden="true" />
          <Link
            to="/journal"
            className="hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          >
            摄影日志
          </Link>
          <Icon name="chevron-right" size={14} className="opacity-50" aria-hidden="true" />
          <span className="text-text-secondary truncate max-w-[200px] sm:max-w-xs" aria-current="page">
            {post.title}
          </span>
        </nav>

        <article>
          {/* 文章头 */}
          <header>
            <div className="flex items-center gap-3 text-caption text-text-muted">
              <time dateTime={post.date}>{post.date}</time>
              <span className="w-1 h-1 rounded-full bg-text-muted" aria-hidden="true" />
              <span>{post.readMinutes} 分钟阅读</span>
              <span className="w-1 h-1 rounded-full bg-text-muted" aria-hidden="true" />
              <Link
                to={`/gallery?tag=${post.tag}`}
                className="text-accent hover:text-accent-hover transition-colors duration-200"
              >
                {tagLabel}
              </Link>
            </div>
            <h1 className="text-h2 font-semibold text-text-primary mt-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-body text-text-muted mt-4 leading-relaxed">{post.excerpt}</p>

            {author && (
              <Link
                to={`/photographers/${author.id}`}
                className="mt-6 inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-btn"
              >
                <SmartImage
                  src={author.avatarUrl}
                  alt={author.name}
                  fallbackText={author.name.slice(0, 1)}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
                <span className="text-left">
                  <span className="block text-body-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
                    {author.name}
                  </span>
                  <span className="block text-caption text-text-muted">{author.bio}</span>
                </span>
              </Link>
            )}
          </header>

          {/* 封面 */}
          <div className="mt-8 rounded-img overflow-hidden bg-bg-deep" style={{ aspectRatio: '16 / 9' }}>
            <SmartImage
              src={post.coverUrl}
              alt={post.title}
              loading="eager"
              decoding="async"
              width={1200}
              height={675}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 正文 */}
          <div className="mt-10 space-y-6">
            {post.blocks.map((block, i) => (
              <BlockRenderer key={i} block={block} />
            ))}
          </div>
        </article>

        {/* 相关作品 CTA */}
        <div className="mt-12 rounded-card border border-border-subtle bg-bg-card/50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-body font-medium text-text-primary">想看这篇手记背后的照片？</p>
            <p className="text-caption text-text-muted mt-1">前往「{tagLabel}」分类，浏览相关作品。</p>
          </div>
          <Link
            to={`/gallery?tag=${post.tag}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-accent px-5 py-2.5 text-body-sm font-medium text-bg-deep hover:scale-[1.02] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 flex-shrink-0"
          >
            查看相关作品
            <Icon name="chevron-right" size={14} aria-hidden="true" />
          </Link>
        </div>

        <PostNav prev={prev} next={next} />
      </div>
    </main>
  );
}
