# PHASE 5 BATCH 3 PRE-CHECK（只读检查结论）

> 本阶段最高优先级为视觉冻结。以下仅分析，未做任何修改。

## 1. 当前 SEO 状态

| 项 | 状态 |
|----|------|
| title | ✅ `影·迹 PHOTOGRAPHY — 记录光影 · 发现美好` |
| meta description | ✅ 已存在 |
| viewport | ✅ 已存在 |
| Open Graph | ✅ og:type/title/description/image 齐全 |
| Twitter Card | ✅ summary_large_image |
| canonical | ❌ 缺失（无正式域名，**禁止伪造** → BLOCKED，待部署后处理） |
| robots.txt | ❌ 缺失（需创建） |
| sitemap.xml | ❌ 缺失（需创建，但缺域名 → 用 example.com 占位 + 明确标注替换） |

## 2. 当前 Accessibility 状态

| 项 | 状态 |
|----|------|
| icon-only button aria-label | ✅ 齐全（PhotoHero/PhotoActions/Lightbox/Navigation/FloatingActions/WorkCard） |
| 图片 alt | ✅ 全部有 alt |
| nav aria-label | ✅ 主导航 `aria-label="主导航"`、面包屑 `aria-label="Breadcrumb"` |
| Lightbox | ✅ `role="dialog"` + `aria-modal="true"` + Esc/←/→/F + 关闭 |
| 收藏/点赞 aria-pressed | ✅ 已有（PhotoActions、WorkCard） |
| aria-live | ⚠️ 缺失（拟加 `role="status"` 到 Toast 容器，非破坏、无重复播报） |
| heading 层级 | ⚠️ Help.tsx 两处 `<h2 class="text-h3">` 应为 h3（SectionHeader 已是 h2 页标题） |
| focus-visible | ✅ 复用 `ring-accent/50` Token |
| prefers-reduced-motion | ✅ globals.css 已存在 `@media (prefers-reduced-motion: reduce)`，无需改 |

## 3. 当前 Performance 状态

| 项 | 状态 |
|----|------|
| 图片 loading/srcset/sizes/width/height | ✅ 已具备 |
| Hero/LCP 图片 | ✅ `loading="eager"` + `fetchPriority="high"`（React 18.3.1 支持） |
| 相邻作品 preload | ✅ PhotoDetail + Lightbox |
| 重复图片请求 | ✅ 无（列表 imageUrl / 详情 fullUrl 分工） |
| 大型 JS 导入 | ✅ lucide-react 按需引入，bundle gzip 77.45 kB |
| 事件监听 cleanup | ✅ 全部 hook 正确 removeEventListener / disconnect |
| timer cleanup | ✅ PhotoActions timersRef 已清理；Toast 2.5s 短命可接受 |
| FavoritesProvider value 重建 | ⚠️ 每次 render 重建对象 → 拟 useMemo |

## 4. 当前技术债

| 项 | 决策 |
|----|------|
| FavoritesProvider useMemo | ✅ 可改（行为不变） |
| LikesProvider/ToastProvider useMemo | ✅ 可改（我 Batch 2 新增，同模式） |
| aria-live | ✅ Toast 容器加 role="status"（低风险） |
| NavLink 精确匹配（/photo/:id 不高亮） | ❌ **视觉冻结冲突，未修改**（改高亮=改视觉） |
| locations 死数据 | ✅ 可删除（无任何引用） |
| T-1 下载/分享抽 hook | ❌ **保留**（PhotoActions 与 Lightbox 行为存在差异：inline label vs toast、share 兜底方式不同） |
| P3-1 首页标签 6→9 | ❌ 禁止（改视觉） |
| P3-2 transition-all | ❌ 禁止（无法证明等价） |

## 5. 可以安全修改（本轮执行）

1. `public/robots.txt`（新建）
2. `public/sitemap.xml`（新建，example.com 占位 + 标注）
3. `FavoritesProvider.tsx` / `LikesProvider.tsx` / `ToastProvider.tsx` 加 useMemo
4. `ToastProvider.tsx` Toast 容器加 `role="status"`
5. `mockData.ts` 删除 `locations` 死数据
6. `Help.tsx` h2 → h3（纯语义，零视觉变化）

## 6. 不应修改（本轮跳过）

- canonical（无域名，禁止伪造）
- NavLink 匹配、首页标签、transition-all（视觉冻结冲突）
- T-1 下载/分享抽象（行为差异）
- API 化 / 后端 / 上传 / 登录 / SSR / 无限滚动（Phase 6+）
