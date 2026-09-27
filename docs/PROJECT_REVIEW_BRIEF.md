# PhotoWebsite 项目现状报告（供外部评审）

> 用途：将本报告交给外部 AI/顾问，请其评估优化点、升级方向与可新增功能。
> 报告日期：2026-09-27。所有数据均来自仓库实况，非预估。

---

## 一、项目定位

摄影作品展示网站（作品集/画廊型），**纯前端 SPA，无任何后端**。
视觉基调：近黑背景（#0a0a0f）+ 金色强调（#d4a853），图片是绝对主角，UI 低对比度克制。

## 二、技术栈与依赖

| 类别 | 选型 | 版本 |
|---|---|---|
| 框架 | React + TypeScript (strict，禁 any) | 18.2 / 5.2 |
| 构建 | Vite | 5.1 |
| 样式 | Tailwind CSS（自定义设计令牌，无 UI 组件库） | 3.4 |
| 路由 | React Router（BrowserRouter + 路由级懒加载） | 6.22 |
| 动效 | motion（原 framer-motion）+ ogl（WebGL） | 13.4 / 1.0 |
| 图标 | lucide-react | 0.344 |
| 单测 | Vitest + Testing Library + jsdom + fake-indexeddb | 1.6 |
| E2E | Playwright（单 project chromium）+ @axe-core/playwright | 1.63 |
| CI | GitHub Actions：lint → tsc+build+vitest、Playwright 两个 job | — |

持久化：**localStorage**（收藏/点赞/关注/登录态）+ **IndexedDB**（用户本地上传的作品图片 blob）。

## 三、路由与功能全景（15 个路由级页面）

| 路由 | 页面 | 核心功能 |
|---|---|---|
| `/` | Home | Hero（WebGL）、精选作品、热门摄影师、统计 |
| `/gallery` | Gallery | 瀑布流/网格双布局；URL 参数驱动：`q` 搜索、`tag`、`location` 精确地点、`featured`、`sort`、`layout`；可关闭筛选胶囊；滚动位置恢复 |
| `/photo/:id` | PhotoDetail | 大图（WebGL 涟漪）、EXIF 面板、点赞/收藏/真实下载/复制链接、上一张/下一张（按钮+←→键+移动端滑动）、相邻图预加载、Esc 返回、标签→gallery 联动、相关作品 |
| `/photographers` | Photographers | 摄影师列表 |
| `/photographers/:id` | PhotographerDetail | 金环头像、简介、真实统计（作品数/粉丝/总获赞）、关注（持久化）、该作者真实作品集网格；非法 id → 404 |
| `/journal` | Journal | 6 篇手记列表，整卡进详情 |
| `/journal/:id` | JournalDetail | 面包屑、封面、作者卡（链摄影师主页）、正文（段落/引用/小节/配图 blocks）、相关作品 CTA、上一篇/下一篇 |
| `/projects` | Projects | 专题/项目集 |
| `/favorites` | Favorites | 收藏夹（localStorage） |
| `/upload` | Upload | 本地上传作品（IndexedDB 存图，合并进作品流） |
| `/profile` | Profile | 个人中心 |
| `/about` `/contact` `/help` | — | 静态页 |
| `*` | NotFound | 404 |

全局：AuthModal（本地模拟登录）、MobileDrawer、移动端底部 Dock、Toast 系统。

## 四、关键子系统

1. **图片系统（SmartImage 原子组件，全站 11+ 处接入）**：onError 自动降级、文字/图标 fallback、shimmer 加载态、srcset/sizes、width/height + aspect-ratio 防 CLS、首屏 eager 其余 lazy；列表用 600-800w、Lightbox 才加载大图。
2. **数据层**：`mockData.ts`（18 个作品，全部带 authorId 1-5；5 位摄影师；标签枚举）+ `journal.ts`（6 篇手记，slug/正文 blocks/authorId）。本地上传作品由 WorksProvider 合并进作品流。
3. **状态层**：Toast > Auth > Works > Favorites > Likes > Follows 六层 Provider 嵌套，各自独立 localStorage key。
4. **动效**：IntersectionObserver 入场（animate-on-scroll）、transform/opacity only、统一 ease-smooth、尊重 prefers-reduced-motion。
5. **可访问性**：axe 扫描 13 个路由零 serious；键盘（方向键/Esc/f）、aria-label、focus-visible ring 全覆盖。
6. **响应式**：Mobile First，390/768/1024/1280 断点，移动端 E2E 专项。

## 五、质量基线（当前全绿）

- ESLint `--max-warnings 0` 零警告；`tsc && vite build` 零错误
- **Vitest 65 例 / Playwright E2E 70 例** 全部通过（CI 双 job success）
- axe 13 页零 serious；构建产物路由级 code splitting（首屏 3 页同步加载保 LCP）

## 六、已知限制（诚实清单，供评审参考）

1. **数据全是 mock**：无后端/CMS；摄影师 worksCount 静态值与实际作品数不符（页面已改为真实计算规避）。
2. **无 SEO 基建**：纯 CSR SPA，静态 meta，无预渲染/SSG、无 sitemap、无 OG 动态生成、无结构化数据。
3. **图片依赖 Unsplash 外链**：无自托管、无 AVIF/WebP 转码管线、无 CDN 域名控制。
4. **无 PWA/离线**、**无 i18n**、**无 RSS**。
5. **用户体系是本地模拟**：AuthModal 无真实鉴权；评论系统明确不做。
6. **性能数据缺失**：未做过 Lighthouse/LCP/CLS 实测归档，无 bundle 体积分析。
7. **测试盲区**：单元测试集中在 Provider/原子组件；页面级正确性主要靠 E2E；无视觉回归测试；E2E 仅 chromium。
8. **无错误监控/分析**：无 Sentry 类工具、无访问统计。
9. **工程细节**：6 层 Provider 嵌套较深；部分页面组件偏大（如 Gallery）；mock 数据与类型同文件。

## 七、请评审重点评估的方向

1. **性能**：图片管线升级路径（自托管/图床/AVIF/响应式生成）；bundle 分析与瘦身；WebGL（ogl 涟漪）在移动端的成本；字体加载策略。
2. **架构演进**：mock → 轻后端（如 Supabase/Cloudflare Pages Functions）的最小迁移路径与数据 schema；哪些状态值得上后端、哪些留本地。
3. **SEO/分享**：Vite SPA 下最划算的预渲染方案（vite-prerender / SSG 迁移 / prerender.io）；OG image 动态化；sitemap 生成。
4. **功能增强候选**（请按投入产出比排序）：全局命令面板搜索（Cmd+K）、作品对比视图、拍摄时间轴、图片打印购买流、RSS、i18n、PWA 离线、评论区（需后端）、摄影师投稿/入驻流、深浅色主题切换。
5. **工程化**：视觉回归（Playwright screenshot / Chromatic）、E2E 扩 webkit/firefox、错误监控、可观测性、依赖升级风险（React 19 / Vite 6 / Tailwind 4 是否值得）。
6. **代码组织**：Provider 嵌套是否应合并/重组；大组件拆分边界；数据层是否应引入轻量数据获取层。

## 八、评审建议必须遵守的硬约束

- 首页 `/` 与 `/gallery` 视觉已封档，禁止重新设计；`prototype.html` 是视觉唯一来源，禁止修改
- 禁止更换 React+TS+Vite+Tailwind 技术栈；禁止引入 UI 组件库/CSS 框架/状态管理库
- TS strict 禁 any；动画只用 transform/opacity；必须尊重 prefers-reduced-motion
- 明确不做：评论系统、真实后端鉴权（除非评审给出强理由）
- 部署环境在中国大陆，GitHub 访问间歇性阻断，外链资源需考虑可达性

## 九、仓库结构速览

```
src/
  components/{atoms,molecules,organisms,layouts}/   # Atomic Design 四层
  pages/        # 15 个路由级页面
  lib/          # 6 个 Provider + 工具
  data/         # mockData.ts、journal.ts
  types/        # 全局类型
docs/           # 设计系统/动效/响应式/组件规范 + 各 Phase 状态文档
e2e/            # Playwright（含 a11y、mobile 专项）
prototype.html  # 视觉唯一真实来源（禁改）
```
