# WORKBUDDY TAKEOVER — 影·迹 PHOTOGRAPHY 项目接管文档

> 本文件是 WorkBuddy Agent 接管的**权威文档**（Source of Handoff）。
> 建立时间：2026-08-16 | 接管方式：只读审计 + 生产构建实测
> 上一轮产物 `docs/PHASE3_TAKEOVER_REPORT.md` 的结论已并入本文，以本文为准。

---

## 1. 项目简介

**影·迹 PHOTOGRAPHY** — 高级个人摄影作品集网站，从 `prototype.html` 单文件原型工程化而来。

- **定位**：摄影师的视觉叙事空间，核心价值是「展示」与「发现」
- **目标用户**：摄影师（创作者）+ 摄影爱好者（浏览者）
- **视觉风格**：深色近黑背景（#0a0a0f）+ 金色强调（#d4a853），电影感、画廊级、克制优雅
- **核心理念**：图片是主角，所有 UI 服务于图片展示
- **当前状态**：Phase 0-3 完成封档，Phase 4（Photo Detail）待开发
- **数据模式**：纯前端 Mock 数据（Unsplash CDN 图片），无后端、无持久化

---

## 2. 技术栈

| 类别 | 技术 | 版本 | 状态 |
|------|------|------|------|
| 框架 | React（函数组件 + Hooks） | ^18.2.0 | 稳定，禁止更换 |
| 语言 | TypeScript（Strict Mode） | ^5.2.2 | 稳定，禁止更换 |
| 构建 | Vite | ^5.1.4 | 稳定，禁止更换 |
| 路由 | react-router-dom（BrowserRouter） | ^6.22.0 | 稳定，禁止更换 |
| 样式 | Tailwind CSS + CSS Variables 设计令牌 | ^3.4.1 | 稳定，禁止更换 |
| 图标 | lucide-react | ^0.344.0 | 稳定，禁止更换 |
| 规范 | ESLint（0 警告目标） | ^8.56.0 | 已配置 |
| 后处理 | PostCSS + Autoprefixer | ^8.4.35 | 已配置 |

**明确不引入**：状态管理库、CSS 框架、UI 组件库、测试框架（当前规模不需要）。

---

## 3. 当前目录结构

```
PhotoWebsite/
├── prototype.html              # ⚠️ 视觉 Source of Truth（禁止修改）
├── AGENTS.md                   # AI 开发规则
├── README.md                   # ⚠️ 页面规划部分已过期（见问题清单）
├── package.json / vite.config.ts / tailwind.config.js
├── tsconfig.json / tsconfig.node.json / postcss.config.js / .eslintrc.cjs
├── index.html                  # ⚠️ favicon 指向 /vite.svg 但文件不存在（404）
├── dist/                       # 生产构建产物（已存在）
├── docs/                       # 12 份文档（Phase 0-1 报告 + 6 规范 + 状态 + 计划 + 接管）
└── src/
    ├── App.tsx                 # 路由：/ /gallery /photo/:id /projects /about /journal /contact + 404
    ├── main.tsx                # 入口（React StrictMode）
    ├── types/index.ts          # Work / ExifData / Photographer / NavItem / StatItem / 枚举
    ├── data/mockData.ts        # 18 works / 4 photographers / 4 heroStats / 9 tagLabels / 16 locations / 4 navItems
    ├── lib/hooks/index.ts      # 6 hooks
    ├── styles/globals.css      # 设计令牌 + 组件样式 + 动效 + reduced-motion
    ├── components/
    │   ├── atoms/       (9)    # Icon / Button / IconButton / Logo / GradientText / PulseDot / ShimmerPlaceholder / SocialIcon / TagChip
    │   ├── molecules/   (8)    # WorkCard / GalleryToolbar / TagFilterBar / PhotographerCard / SectionHeader / StatItem / AnnouncementBadge / NavLink
    │   ├── organisms/   (8)    # HeroSection / WaterfallGallery / PhotographerGrid / Navigation / MobileDrawer / Footer / FloatingActions / Lightbox
    │   └── layouts/     (1)    # MainLayout
    └── pages/           (8)    # Home ✅ / Gallery ✅ / NotFound ✅ / PhotoDetail·Projects·About·Journal·Contact 占位
```

**不存在**：public/、src/assets/、.env*、任何测试文件。

---

## 4. 产品结构

```
首页 / (Home)
├── HeroSection        公告条 → 渐变标题 → 副标题 → 4 统计数字(计数动画) → 双 CTA → 浮动双卡片
├── WaterfallGallery   精选作品（TagFilterBar 6 标签筛选 + 瀑布流 18 作品）
├── PhotographerGrid   热门摄影师（4 卡片，关注按钮）
└── (MainLayout 全局: Navigation + Footer + FloatingActions)

探索 /gallery (Gallery)
├── 精选作品开关
├── GalleryToolbar     搜索框 + 排序下拉 + 布局切换(masonry/grid) + 9 标签 + 计数
├── 作品网格（瀑布流/网格，空状态处理）
├── Lightbox           点击作品打开全屏灯箱
└── 加载更多按钮（占位无功能）

404 * (NotFound)
其他占位页: /photo/:id /projects /about /journal /contact
死链接: /favorites /photographers（导航）/help（抽屉）
```

---

## 5. Phase 0～3 状态

| Phase | 文档声明 | 代码验证 | 结论 |
|-------|----------|----------|------|
| Phase 0 视觉分析 | prototype.html + 8 份规范 | 设计令牌与 React 实现逐项一致 | ✅ 完成 |
| Phase 1 基础架构 | 脚手架/9 atoms/6 hooks/路由/类型 | 全部存在，`any` 0 处，tsc 零错误 | ✅ 完成 |
| Phase 2 Home 首页 | Hero/导航/抽屉/瀑布流/摄影师/页脚/FAB | 全部组件实质实现 | ✅ 完成 |
| Phase 3 Gallery 作品库 | 双布局/筛选/搜索/排序/Lightbox | 全部功能代码确认 | ✅ 完成 |

**实测证据**：`npm run build`（tsc && vite build）成功，1509 模块，0 TS 错误；产物 CSS 27.74KB(gzip 6.41KB) / JS 215.08KB(gzip 67.84KB) 与封档记录一致。

---

## 6. 已完成功能

- 双形态导航（透明 ↔ 玻璃态 pill，scrollY>80 切换，rAF 节流）
- 移动端抽屉（滑入 + 阶梯延迟，body 滚动锁定）
- Hero 首屏（统计计数动画、浮动卡片、CTA）
- 瀑布流画廊（CSS columns，3/2/1 列响应式）
- 9 标签筛选、全文搜索、3 种排序、精选筛选、空状态、清除筛选
- Masonry/Grid 双布局切换
- Lightbox（ESC/←→/F 键、全屏、预加载 ±1、EXIF 展示、body 锁定、Portal）
- WorkCard 响应式图片（srcset 400/600/800/1200w + sizes + lazy + async + 颜色占位 + Shimmer + aspect-ratio 防 CLS）
- 摄影师卡片关注切换、回到顶部、上传 FAB
- 滚动入场动画、reduced-motion 支持、自定义滚动条

---

## 7. 当前功能（占位/未完成）

| 页面/功能 | 状态 | 说明 |
|-----------|------|------|
| `/photo/:id` PhotoDetail | 占位 | "Phase 4 实现"文本 |
| `/projects` `/about` `/journal` `/contact` | 占位 | 占位文本 |
| `/favorites` `/photographers` `/help` | 死链接 | 路由未实现 |
| 下载/分享按钮 | 仅 UI | Lightbox 内无行为 |
| 加载更多 | 仅 UI | Gallery 底部 |
| 搜索/上传/用户按钮 | 仅 UI | 导航内无行为 |
| 点赞/收藏 | 无交互 | 仅展示数字 |

---

## 8. 当前问题

### P0（阻断）
无。

### P1（高）
无阻断级 P1；以下 P2 项影响产品完整性。

### P2（中）
| # | 问题 | 位置 |
|---|------|------|
| 1 | 首页 TagFilterBar 仅 6 标签，缺 nature/travel/blackwhite（与 Gallery 9 标签不一致） | `molecules/TagFilterBar.tsx:11` |
| 2 | Gallery「加载更多」无功能 | `pages/Gallery.tsx:144` |
| 3 | Lightbox 下载/分享按钮仅 UI | `organisms/Lightbox.tsx:145-156` |
| 4 | Footer 分类链接 `/gallery?tag=xxx` 无实际筛选效果（Gallery 不读 URL query） | `organisms/Footer.tsx:13-17` |
| 5 | MobileDrawer `/help` 死链接 | `organisms/MobileDrawer.tsx:19` |

### P3（低）
| # | 问题 | 位置 |
|---|------|------|
| 6 | 导航 /favorites、/photographers 死链接 | `Navigation.tsx:15-16`、`MobileDrawer.tsx:16-17`、`Footer.tsx:9` |
| 7 | 图片加载失败无 onError 降级 | `molecules/WorkCard.tsx` |
| 8 | `text-h1` 类未定义（tailwind 无 h1 token，静默无效） | `pages/Gallery.tsx:80` |
| 9 | Lightbox EXIF 漏渲染 `film` 字段（类型与数据均有） | `organisms/Lightbox.tsx:256-276` |
| 10 | WorkCard `e.preventDefault()` 冗余（div 非链接） | `molecules/WorkCard.tsx:31-34` |
| 11 | Logo 用 `<a href="/">` 非 Router Link（整页刷新） | `atoms/Logo.tsx:8` |
| 12 | favicon `/vite.svg` 404（无 public 目录） | `index.html:5` |
| 13 | index.html 缺 Open Graph / 社交分享 meta | `index.html` |
| 14 | README 页面规划过期（Gallery 未勾选，实际已完成） | `README.md:58` |

---

## 9. 视觉系统（设计意图）

### 为什么长这样
以近黑为画布、金色为唯一高光、玻璃态为层次——**一切为了"让照片成为主角"**。金色不用作装饰性填充，仅用于品牌点、交互焦点、数据高亮与 CTA；圆角克制（8-16px）避免"可爱感"；4px 统一上浮是核心微交互语言；浮动动画仅 4px 位移。情绪关键词：`暗调沉浸` `高端克制` `电影质感` `金色微光` `呼吸感`。

### 核心令牌（globals.css / tailwind.config.js）
- 颜色：bg-base #0a0a0f / bg-deep #08080c / bg-card #14141c / bg-card-hover #1a1a24 / accent #d4a853 / accent-hover #e0b866 / text-primary #fff / text-secondary #a0a0b0 / text-muted #6b6b7b / border-subtle rgba(255,255,255,.08)
- 字体：Inter + PingFang SC + Microsoft YaHei；display 64px/1.1/700/-0.02em、h2 32px/600、h3 24px/600、body 16px/1.7、body-sm 14px/500、caption 14px、stat 28px/700
- 圆角：img 8 / btn 12 / card 16 / pill 999
- 阴影：card `0 4px 24px rgba(0,0,0,.3)`、nav `0 8px 32px rgba(0,0,0,.4)`、modal `0 16px 48px rgba(0,0,0,.5)`、glow 金色
- 动效：fast 200 / base 250 / normal 300 / slow 350 / slower 400 / entrance 600ms；缓动统一 `cubic-bezier(0.4,0,0.2,1)`；仅动画 transform/opacity
- 间距：4px 基数（8/12/16/20/24/32/48）；容器 max 1200px + px-6
- 背景装饰：顶部径向渐变（#12121a → #0a0a0f）+ 60px 极淡网格纹理
- 图片：宽 100%、aspect-ratio 预留、hover scale(1.05)、overlay 从底部滑入、加载失败无降级

---

## 10. 技术架构

- **组件系统**：Atomic Design（atoms → molecules → organisms → layouts → pages），已完全落地
- **状态管理**：无外部库，组件本地 useState + 自定义 hooks（React 自带能力足够当前规模）
- **路由**：BrowserRouter，7 业务路由 + 404；**注意部署需 SPA 回退配置**
- **数据层**：`src/data/mockData.ts` 纯静态导出；类型集中在 `src/types/index.ts`
- **图片系统**：Unsplash CDN URL 参数控尺寸；`imageUrl`(600w 列表) / `fullUrl`(1600w 大图) 分层；WorkCard 动态生成 srcset；Lightbox 预加载 ±1
- **样式**：Tailwind 工具类 + CSS Variables 令牌 + `@layer components` 自定义类（nav-header/work-card 等）+ `@apply` 少量
- **hooks（6）**：useScrollPosition / useIntersectionObserver / useCounter / useBackToTop / useBodyScrollLock / useMediaQuery
- **命令**：`npm run dev` / `npm run build`(tsc && vite build) / `npm run lint` / `npm run preview`

### 稳定 vs 可能重构
- **稳定**：技术栈全栈、组件分层、设计令牌、图片响应式方案、hooks 抽象
- **可能重构（未来，非本次）**：无测试框架（引入 vitest 需决策）；Lightbox 与未来 PhotoDetail 的 EXIF 展示逻辑重复（可抽共用组件）；首页 TagFilterBar 与 GalleryToolbar 标签源不统一；Gallery 状态不入 URL（无法分享筛选状态）；`transition: all` 多处使用（性能优化空间）

---

## 11. 图片系统

1. 尺寸分层：缩略 400w / 列表 600-800w / 大图 1200-1600w（fullUrl 1600w）
2. srcset：400w/600w/800w/1200w 动态生成；sizes：(max-width:640px)100vw,(max-width:1024px)50vw,33vw
3. 懒加载：loading="lazy" + IntersectionObserver rootMargin 200px 提前加载；Hero 主图 eager
4. CLS 防护：aspect-ratio + width/height 属性 + color 占位 + Shimmer
5. 预加载：Lightbox 相邻 ±1 张
6. 加载流程：颜色占位 + Shimmer → 进入视口 → 加载 → 淡入 → hover 显示信息
7. 缺口：无 LQIP 渐进加载、无 WebP/AVIF（Unsplash 可加 &fm=webp）、无 onError 降级

---

## 12. 响应式策略

- 断点：sm 640 / md 768 / lg 1024 / xl 1280（Tailwind 默认）；Mobile First
- 瀑布流列数：1（<640）/ 2（640-1023）/ 3（≥1024）
- Grid 列数：1 / 2 / 3(lg) / 4(xl)
- 导航：<768 汉堡+抽屉；≥768 水平导航
- Hero：<lg 堆叠，≥lg 左 55% 右 45%
- 触摸目标：图标按钮 w-9(36px) 偏小（规范建议 44px）；标签 chip 偏矮
- 已知风险（文档记载）：无 <360px 超小屏适配验证、Hero 后卡片窄屏可能溢出

---

## 13. Phase 4 建议（Photo Detail 照片详情页）

**结论**：`docs/PHASE_4_PLAN.md` 计划**仍然合理且必要**，继续沿用。补充依据 `docs/PHOTO_UX_SPEC.md` §3.2 的 UX 设计（全屏沉浸、object-fit contain、max-height 90vh、双击放大可选、右键保护可选）。

### 目标
实现沉浸式照片详情页，打通「浏览 → 详情」闭环，复用全部现有设计令牌与组件语言。

### 功能（P0）
1. 大图展示区 + 标题/描述/地点/日期
2. 完整 EXIF 面板（含 film 字段——修复 Lightbox 遗漏）
3. 摄影师信息卡片（复用 PhotographerCard 或简化变体）
4. 点赞/收藏/分享操作（状态动画）
5. 上一张/下一张导航（键盘 ←→）+ 返回 Gallery + 面包屑
6. 相关作品推荐（同标签优先 + 同摄影师兜底）
7. useParams 取 ID；非法 ID → Navigate 404；浏览器前进/后退正常

### 新组件（Atomic Design）
- organism：`PhotoHero`（主图区）、`RelatedWorks`（推荐网格）
- molecule：`PhotoInfo`、`PhotoActions`、`ExifPanel`、`PhotoNavigation`
- 复用：WorkCard、PhotographerCard、Lightbox、Button、IconButton、Icon、SectionHeader

### 跳转入口打通
1. Gallery WorkCard 点击 → 详情页（决策点：是否保留 Lightbox 入口）
2. 首页 WaterfallGallery WorkCard → 详情页
3. Lightbox 增加「查看详情」按钮
4. 相关作品互跳

### 技术/视觉/性能任务
- 技术：路由数据流、滚动位置记忆（返回 Gallery 时恢复）、键盘事件管理
- 视觉：与 prototype 视觉语言一致（深底、金色活跃态、text-body/caption 层级、200-600ms 动效、reduced-motion）
- 性能：主图 lazy + 相邻预加载、Shimmer、无 CLS、build 零错误

### 验收标准
功能（详情可达/404/EXIF 完整/上下张/键盘/ESC/Lightbox/相关作品跳转/点赞收藏切换）+ 视觉（prototype 一致/响应式）+ 性能（lazy/预加载/无 CLS/build 零错/LCP<2.5s）+ 兼容（手机 Safari/Chrome、平板、桌面 4 浏览器）

### 范围外
评论、后端、用户系统、上传、摄影师主页、收藏夹页、重做 Home/Gallery。

---

## 14. 开发注意事项

1. **prototype.html 是视觉 Source of Truth**，禁止修改；有疑问先打开它看
2. **不推倒重来**：Phase 0-3 已封档，禁止重新设计 Home/Gallery
3. 新组件必须按 Atomic Design 放入对应目录，先检查是否已存在
4. TypeScript Strict：禁止 `any`；Props 必须定义接口；build 零错误才算完成
5. 样式用设计令牌（bg-bg-base/text-accent/rounded-card 等），禁止硬编码颜色
6. 图片必须 alt + lazy（首屏除外）+ srcset/sizes + aspect-ratio 防 CLS
7. 动效 200-600ms、ease-smooth、只动画 transform/opacity、尊重 reduced-motion
8. 响应式 Mobile First，测试 iPhone 14 / iPad / 1920×1080
9. 小步提交、频繁测试；每阶段区分「已真实验证/仅代码验证」
10. 键盘支持（←→/Esc/F）是既有产品标准，Phase 4 必须延续

---

## 15. 不允许修改的内容

| 内容 | 原因 |
|------|------|
| prototype.html | 视觉唯一真实来源 |
| 技术栈（React/TS/Vite/Tailwind/Router/lucide） | 封档确定 |
| Home 首页（页面/组件/视觉） | Phase 2 封档 |
| Gallery 页面（页面/组件/视觉/功能） | Phase 3 封档 |
| 已完成的 atoms/molecules/organisms/layouts | 复用而非重写 |
| 现有 Mock 数据结构（可扩展字段，不破坏现有） | 数据层稳定 |
| 无必要的新增依赖 | 当前依赖已足够 |

---

## 附：本次接管合规确认

- ✅ 只读审计：读取文档 12 份、源码 41 文件、配置 8 份、构建实测 1 次
- ✅ 未修改任何生产代码、未修改 prototype.html、未删除文件、未升级依赖
- ✅ 未开始 Phase 4
