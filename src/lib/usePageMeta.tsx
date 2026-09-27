import { Helmet } from 'react-helmet-async';

export interface PageMeta {
  /** 页面完整标题（写入 document.title） */
  title: string;
  /** meta description 内容，缺省时不动现有标签 */
  description?: string;
  /** JSON-LD 结构化数据（schema.org），缺省时不注入 */
  jsonLd?: Record<string, unknown>;
}

/**
 * 路由级 SEO：返回一个 <Helmet> 元素，调用方需将其渲染进组件输出
 * （提前 return 的 404 分支也要渲染，否则该分支下 title 不生效）。
 * - CSR：挂载时写入 document.head，卸载时自动恢复上一状态；
 * - SSG（npm run build:ssg）：构建期标签被采集进静态 HTML，
 *   不执行 JS 的爬虫（含主流 AI 爬虫）可直接读取。
 * Helmet 在 DOM 中渲染为 null，不产生任何可见节点。
 */
export function usePageMeta({ title, description, jsonLd }: PageMeta) {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
