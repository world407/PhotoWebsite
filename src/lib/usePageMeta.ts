import { useEffect } from 'react';

export interface PageMeta {
  /** 页面完整标题（写入 document.title） */
  title: string;
  /** meta description 内容，缺省时不动现有标签 */
  description?: string;
  /** JSON-LD 结构化数据（schema.org），缺省时不注入 */
  jsonLd?: Record<string, unknown>;
}

/**
 * 路由级 SEO：更新 document.title / meta description，并注入当前页 JSON-LD。
 * 卸载时移除注入的 JSON-LD，避免 SPA 路由切换后残留上一页数据。
 * 注意：CSR 下 JSON-LD 在 JS 执行后才进入 DOM——Googlebot 可见，
 * 不执行 JS 的爬虫（部分 AI 爬虫）不可见；彻底方案是构建期预渲染。
 */
export function usePageMeta({ title, description, jsonLd }: PageMeta) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.setAttribute('content', description);
    }
    if (!ld) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = ld;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [title, description, ld]);
}
