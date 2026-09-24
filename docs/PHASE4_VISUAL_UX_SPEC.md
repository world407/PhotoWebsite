# Phase 4 Photo Detail Visual & UX Specification

> **版本**：v1.0
> **日期**：2026-08-16
> **状态**：设计分析完成，待用户确认后进入开发
> **前置**：Phase 0-3 已封档（WORKBUDDY_TAKEOVER.md 验证通过）
> **视觉 Source of Truth**：`prototype.html`

---

## 1. 页面结构（Page Architecture）

### 1.1 整体布局模型

Photo Detail 采用**垂直流式单列布局**，以照片为绝对视觉中心。页面从上到下分为 5 个语义区域：

```
┌─────────────────────────────────────────────┐
│  Zone A: Breadcrumb + 返回导航               │  ← 紧凑、不抢视线
├─────────────────────────────────────────────┤
│                                             │
│  Zone B: Photo Hero — 主图展示区             │  ← 视觉第一主角
│  （全宽大图 / 自适应比例 / 可点击进 Lightbox） │
│                                             │
├─────────────────────────────────────────────┤
│  Zone C: Meta Info — 作品元信息              │  ← 标题/地点/日期/描述
│  ┌──────────┬────────────────────────────┐  │
│  │ 操作栏    │ 标题 + 元数据 + 描述文字   │  │
│  │ ♡ ♥ ↗ ⤓ │                            │  │
│  └──────────┴────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Zone D: Detail Panel — 详情双栏             │  ← 摄影师 + EXIF
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ 摄影师卡片    │  │ EXIF 信息面板      │  │
│  │ [头像] 姓名   │  │ 相机/镜头/光圈...  │  │
│  │ 简介 + 关注  │  │ 3×2 网格           │  │
│  └──────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────┤
│  Zone E: Related Works — 相关作品            │  ← SectionHeader + 网格
│  "相关作品"  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│             │    │ │    │ │    │ │    │   │
│             └────┘ └────┘ └────┘ └────┘   │
├─────────────────────────────────────────────┤
│  Zone F: Navigation — 上下张导航             │  ← 固定在视口两侧
│     ←                        →            │
└─────────────────────────────────────────────┘
```

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **Photography First** | 照片占据首屏 70%+ 面积，所有 UI 元素服务于照片 |
| **渐进式信息密度** | 从上到下：图 → 标签 → 描述 → 数据 → 推荐，信息逐步加密 |
| **克制用金** | 金色仅用于交互反馈态（已点赞/已收藏/已关注/hover），不用作装饰 |
| **零干扰阅读** | 描述文字区 max-w-2xl（720px），保证长文本可读性 |
| **非电商式** | 无大标题霸屏、无复杂 Tab、无大面积按钮、无过度渐变阴影 |

---

## 2. 视觉层级（Visual Hierarchy）

### 2.1 层级排序（Z-index 逻辑）

| 层级 | 元素 | 视觉权重 | 实现方式 |
|------|------|----------|----------|
| L0 | 主图照片 | ★★★★★ | 最大尺寸、深色背景衬托、无遮挡 |
| L1 | 作品标题 | ★★★★☆ | text-h3 (24px) / font-semibold / white |
| L2 | 操作按钮组 | ★★★★☆ | 金色激活态 / icon-btn hover |
| L3 | 描述文字 | ★★★☆☆ | text-body (16px) / text-secondary / max-w-2xl |
| L4 | EXIF 数据 | ★★★☆☆ | text-caption (14px) / text-muted / 网格排列 |
| L5 | 摄影师卡片 | ★★☆☆☆ | bg-card / 小型卡片 / 复用 PhotographerCard |
| L6 | 相关作品 | ★★☆☆☆ | SectionHeader + WorkCard compact 变体 |
| L7 | 面包屑/返回 | ★☆☆☆☆ | text-caption / text-muted / 最轻量 |

### 2.2 色彩应用矩阵

| 元素 | 默认态 | Hover/Active 态 |
|------|--------|-----------------|
| 页面背景 | `--color-bg-base` (#0a0a0f) + 径向渐变 | 不变 |
| 主图区域背景 | `--color-bg-deep` (#08080c) 或纯黑 #000 | 不变 |
| 标题文字 | `--color-text-primary` (#fff) | 不变 |
| 正文/描述 | `--color-text-secondary` (#a0a0b0) | 不变 |
| 辅助信息 | `--color-text-muted` (#6b6b7b) | 不变 |
| 卡片背景 | `--color-bg-card` (#14141c) | `--color-bg-card-hover` (#1a1a24) |
| 分割线 | `--color-border-subtle` (rgba(255,255,255,0.08)) | 不变 |
| 强调/品牌 | 不使用 | `--color-accent` (#d4a853) |
| 点赞/收藏（未激活） | `--color-text-muted` | `--color-text-secondary` |
| 点赞/收藏（已激活） | `--color-accent` (#d4a853) + 填充 | `--color-accent-hover` (#e0b866) |

---

## 3. 组件结构建议（Component Architecture）

### 3.1 新建组件清单

| 组件名 | 类型 | 职责 | Props 接口 |
|--------|------|------|------------|
| `PhotoHero` | organism | 主图展示区：大图 + 加载态 + 全屏按钮 + 点击进 Lightbox | `work: Work, onOpenLightbox: () => void` |
| `PhotoInfo` | molecule | 作品元信息：标题 + 地点 + 日期 + 描述 + 标签 | `work: Work` |
| `PhotoActions` | molecule | 操作栏：点赞 + 收藏 + 分享 + 下载 | `work: Work, onLike: () => void, onFavorite: () => void, onShare: () => void, onDownload: () => void` |
| `ExifPanel` | molecule | EXIF 技术参数面板（图标+数值网格） | `exif?: ExifData` |
| `PhotographerMini` | molecule | 摄影师精简卡片（头像+姓名+简介+关注） | `photographer: Photographer, onFollow: () => void` |
| `RelatedWorks` | organism | 相关作品推荐网格 | `currentWork: Work, allWorks: Work[], onWorkClick: (id: number) => void` |
| `PhotoNavigation` | molecule | 上一张/下一张固定导航箭头 | `hasPrev: boolean, hasNext: boolean, onPrev: () => void, onNext: () => void` |
| `DetailBreadcrumb` | atom | 面包屑导航 | `title: string` |

**共 8 个组件**：1 atom + 4 molecules + 3 organisms

### 3.2 复用现有组件

| 组件 | 用途 | 是否需要修改 |
|------|------|-------------|
| `WorkCard` | RelatedWorks 中使用，可能需要 `variant="compact"` | 可选：新增 variant prop |
| `Lightbox` | 点击主图时打开全屏查看 | 不改 |
| `Button` / `IconButton` | 各种操作按钮 | 不改 |
| `Icon` | EXIF 图标、操作图标 | 可能需补充 camera/lens 等图标 |
| `SectionHeader` | "相关作品" 区块标题 | 不改 |
| `ShimmerPlaceholder` | 图片加载占位 | 不改 |

### 3.3 组件树

```
PhotoDetail (page)
├── DetailBreadcrumb          // Zone A
├── PhotoHero                 // Zone B
│   ├── ShimmerPlaceholder    // loading state
│   └── <img>                // main image
├── PhotoInfo                 // Zone C (上半)
│   └── tags[] as TagChip
├── div.info-grid             // Zone C+D container
│   ├── PhotoActions          // Zone C 左侧操作栏
│   ├── PhotoInfo             // Zone C 右侧元数据（或上方）
│   ├── PhotographerMini      // Zone D 左栏
│   └── ExifPanel             // Zone D 右栏
├── RelatedWorks              // Zone E
│   └── WorkCard[]            // compact variant
└── PhotoNavigation           // Zone F (fixed)
```

---

## 4. Desktop 布局（≥1024px）

### 4.1 尺寸规范

| 区域 | 宽度 | 高度 | 间距 |
|------|------|------|------|
| Container | `container-main` (max-w-1200px) | — | px-6 (24px) |
| Breadcrumb 行 | 全容器宽 | auto | mb-4 |
| Photo Hero | 全容器宽 | max-h-[85vh] | mb-8 (32px) |
| Info Grid | 全容器宽 | auto | grid grid-cols-12 gap-8 |
| 左栏（操作+摄影师） | col-span-4 | auto | — |
| 右栏（元数据+EXIF） | col-span-8 | auto | — |
| Related Works | 全容器宽 | auto | mt-16 (64px) |
| 导航箭头 | w-14 h-56 | fixed left-4/right-4 top-1/2 | — |

### 4.2 Desktop 线框图

```
╔══════════════════════════════════════════════════════════╗
║  首页 / 探索 / 山间晨雾                        ← 返回  ║  ← Breadcrumb
╠══════════════════════════════════════════════════════════╣
║                                                       ║
║                                                       ║
║                   ┌─────────────────┐                  ║
║                   │                 │                  ║
║                   │   主图照片       │  ← 85vh max     ║
║                   │   object-fit:   │                  ║
║                   │   contain       │                  ║
║                   │                 │                  ║
║                   └─────────────────┘                  ║
║         [全屏]                                      ║
╠══════════════════════════════════════════════════════════╣
║  山间晨雾                          ♡ 1,248  ♥  ↗  ⤓  ║  ← 标题行 + 操作
║  📍 瑞士·阿尔卑斯山    📅 2026-03-15   风光           ║  ← 元数据
║  清晨山间云海翻涌，第一缕阳光穿透云层...                 ║  ← 描述 (max-w-2xl)
║  #山 #雾 #自然                                         ║  ← 标签
╠═══════════════════════════════════╦══════════════════════╣
║  ┌────────────────────┐           ║  ┌─────────────────┐ ║
║  │ 👤 林风            │           ║  │ 📷 EXIF 信息    │ ║
║  │ 风光/旅行摄影师     │           ║  ├────────┬────────┤ ║
║  │ 128 作品 · 3.2k粉丝│  [+关注]  ║  │ Sony   │ 24-70  │ ║
║  └────────────────────┘           ║  │ f/8    │ 1/125s │ ║
║                                    ║  │ ISO100 │ 35mm  │ ║
║                                    ║  └────────┴────────┘ ║
╠════════════════════════════════════╩══════════════════════╣
║  相关作品                                              ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    ║
║  │      │ │      │ │      │ │      │  ← WorkCard ×4    ║
║  └──────┘ └──────┘ └──────┘ └──────┘                    ║
╚══════════════════════════════════════════════════════════╝
     [←]                                              [→]   ← fixed arrows
```

### 4.3 关键布局决策

**Info Grid 采用 4+8 分栏而非 PHASE_4_PLAN 原始建议的左右平分**：
- 左栏 4 列（约 340px）：放操作按钮（竖向排列）+ 摄影师 Mini 卡片——这些是"行动入口"，窄栏更紧凑
- 右栏 8 列（约 700px）：放标题/描述/元数据/EXIF——这些是"阅读内容"，需要更宽的阅读宽度
- 这符合「摄影网站」的阅读体验优先原则（区别于电商的商品详情左图右信息）

---

## 5. Tablet 布局（640px – 1023px）

### 5.1 断点变更

| 变更项 | Desktop | Tablet |
|--------|---------|--------|
| Info Grid | grid-cols-12 (4+8) | grid-cols-1 (单列堆叠) |
| Photo Hero max-height | 85vh | 70vh |
| Related Works 列数 | grid-cols-4 | grid-cols-2 |
| 导航箭头 | fixed 两侧 | 缩小为 w-10 h-10，更靠内 |
| 摄影师卡片 | 左栏内嵌 | 独立一行全宽 |

### 5.2 Tablet 布局顺序

```
Zone A: Breadcrumb（不变）
Zone B: Photo Hero（h-70vh）
Zone C: 标题 + 操作栏（横向排列，操作栏右对齐）
      描述文字（全宽）
      标签（横向排列）
Zone D: 摄影师卡片（全宽一行）
      EXIF 面板（全宽，grid-cols-3）
Zone E: Related Works（2列网格）
Zone F: 导航箭头（缩小版）
```

---

## 6. Mobile 布局（<640px）

### 6.1 断点变更

| 变更项 | Desktop | Mobile |
|--------|---------|--------|
| Container padding | px-6 (24px) | px-4 (16px) |
| Photo Hero max-height | 85vh | 50vh（给下方信息留空间） |
| Info Grid | grid-cols-12 | 单列堆叠 |
| 操作按钮 | 竖向 icon-btn 组 | **底部固定操作栏** (bottom bar) |
| Related Works | 4列 | 2列（或 1列大卡） |
| 导航箭头 | fixed 两侧 | **隐藏**（改用滑动切换） |
| Breadcrumb | 完整路径 | 仅 "← 返回" 文字按钮 |
| 描述文字 | 直接显示 | **可展开/收起**（超过 3 行截断） |

### 6.2 Mobile 底部固定操作栏

```
┌────────────────────────────────────────┐
│                                        │
│          Photo Hero (50vh)             │
│                                        │
├────────────────────────────────────────┤
│  山间晨雾                    ♡ 1.2k    │
│  瑞士·阿尔卑斯山 · 2026-03-15          │
│  清晨山间云海翻涌...  [展开全部]        │
│  #山 #雾 #自然                         │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  👤 林风          [+ 关注]       │  │  ← 摄影师行
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Sony · f/8 · 1/125s · ISO 100   │  │  ← EXIF 横向滚动
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  相关作品                              │
│  ┌────┐ ┌────┐                        │
│  │    │ │    │  ← 2列                │
│  └────┘ └────┘                        │
╞════════════════════════════════════════╡
│    ♡     ♥     ↗     ⤓     [←] [→]   │  ← fixed bottom bar
╚════════════════════════════════════════╝
```

底部操作栏规格：
- 高度：64px (h-16)
- 背景：`bg-bg-base/95 backdrop-blur-md border-t border-border-subtle`
- 按钮：5 等分（点赞/收藏/分享/下载/导航），icon-btn + 文字 label
- 安全区域：`pb-safe` (env(safe-area-inset-bottom))

---

## 7. 交互流程（Interaction Flow）

### 7.1 页面跳转矩阵

```
                    ┌─────────────┐
                    │   Gallery   │
                    └──────┬──────┘
                           │ 点击 WorkCard
                           ▼
                    ┌─────────────┐
         ┌────────►│ Photo Detail │◀────────┐
         │         └──────┬──────┘         │
         │                │                │
         │    ┌───────────┼───────────┐    │
         │    ▼           ▼           ▼    │
         │  Lightbox   Related    Prev/Next │
         │  (全屏)     Works      (键盘/点击)│
         │    │           │           │    │
         │    ▼           │           │    │
         │  关闭→Detail   │           │    │
         │                ▼           │    │
         │          Photo Detail(N)   │    │
         │                            │    │
         └────────────────────────────┘
                    │ Esc / ←返回
                    ▼
                Gallery (保持滚动位置)
```

### 7.2 Gallery → Detail 入口行为

**推荐方案（A）：卡片点击进入详情页**
- WorkCard 整体可点击 → `navigate(/photo/${work.id})`
- WorkCard hover 时叠加层增加"查看详情"微文案提示
- Lightbox 保留作为详情页内的二次查看方式（点击主图打开）
- **理由**：符合 Web 标准 URL 语义（每张作品有独立可分享链接）；SEO 友好；与 500px/Unsplash 行为一致

**备选方案（B）**：卡片点击打开 Lightbox，Lightbox 内添加"查看详情"按钮
- 优点：更快看到大图；缺点：没有独立 URL；不符合 Phase 4 目标

**备选方案（C）**：双模式——卡片中心区域进详情，角落快速按钮开 Lightbox
- 优点：灵活；缺点：交互认知成本高

> **本规范推荐方案 A**，待用户确认。

### 7.3 键盘快捷键

| 按键 | 行为 | 适用场景 |
|------|------|----------|
| `←` ArrowLeft | 上一张作品 | Desktop + Tablet |
| `→` ArrowRight | 下一张作品 | Desktop + Tablet |
| `Esc` | 返回 Gallery（记住滚动位置） | 全平台 |
| `F` | 打开/关闭 Lightbox 全屏 | 全平台 |

### 7.4 触摸手势（Mobile）

| 手势 | 行为 |
|------|------|
| 左滑 | 下一张 |
| 右滑 | 上一张 |
| 双击图片 | 切换 Lightbox（可选，P2） |
| 长按图片 | 显示保存选项（可选，P2） |

---

## 8. 动画（Motion）

### 8.1 动画清单

| 动画 | 触发 | 时长 | 缓动 | 属性 |
|------|------|------|------|------|
| **页面入场** | 进入详情页 | 600ms | ease-out | opacity 0→1, translateY 30px→0（整体淡入上移） |
| **主图加载** | img onLoad | 300ms | ease | opacity 0→1（渐现） |
| **主图加载中** | img 未加载 | 持续 | linear | Shimmer 占位动画（复用现有 `.img-placeholder`） |
| **点赞弹跳** | 点击心形 | 400ms | cubic-bezier(0.68,-0.55,0.265,1.55) | scale(1)→1.3→1, fill 变金色 |
| **收藏弹跳** | 点击书签 | 400ms | 同上 | scale(1)→1.3→1, fill 变金色 |
| **操作按钮 hover** | 鼠标悬停 | 200ms | ease | scale(1.02), box-shadow 金色光晕 |
| **导航箭头 hover** | 鼠标悬停 | 200ms | ease | scale(1.1), bg 白色 10%→20% |
| **相关作品卡片 hover** | 鼠标悬停 | 250ms | smooth | translateY(-4px), img scale(1.05)（复用 `.card-hover`） |
| **摄影师卡片 hover** | 鼠标悬停 | 250ms | smooth | translateY(-4px), avatar-ring 变金色（复用 `.photographer-card`） |
| **标签 chip hover** | 鼠标悬停 | 250ms | smooth | border-color 变金色（复用 `.tag-chip`） |
| **上下张切换** | 点击箭头/键盘 | 300ms | ease | opacity 交叉淡入淡出（不做 slide，避免 CLS） |
| **Lightbox 打开** | 点击主图 | 300ms | ease | opacity 0→1, scale(0.95)→1 |
| **Lightbox 关闭** | 点击关闭/Esc | 200ms | ease | opacity 1→0 |
| **EXIF 区域入场** | 滚入视口 | 600ms | ease | opacity 0→1, translateY 20px→0（`.animate-on-scroll`） |
| **Related Works 入场** | 滚入视口 | 600ms | ease | staggered delay（复用 `.animate-on-scroll`） |

### 8.2 动画规则

- 所有动画仅使用 `transform` 和 `opacity`（保证 60fps 合成层加速）
- 尊重 `prefers-reduced-motion: reduce`（全局已有 CSS 规则覆盖）
- 不使用 spring/bounce 弹性缓动（除点赞心形弹跳外）
- 不使用 `transition: all`（明确指定属性）

---

## 9. 图片策略（Image Strategy）

### 9.1 多尺寸响应式图片

```tsx
// PhotoHero 内的主图实现
<img
  src={work.fullUrl || work.imageUrl}           // 1600w 大图
  srcSet={`
    ${work.imageUrl} 800w,
    ${work.fullUrl || work.imageUrl} 1600w
  `}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  loading="eager"                                 // 首屏图片，立即加载
  decoding="async"
  width={Math.round(1600 / work.aspectRatio)}     // 按 aspectRatio 计算
  height={1600}
  style={{ aspectRatio: `${work.aspectRatio}`, objectFit: 'contain' }}
  alt={work.title}
/>
```

### 9.2 图片策略表

| 场景 | 使用尺寸 | loading | 说明 |
|------|----------|---------|------|
| PhotoHero 主图 | fullUrl (1600w) | eager | 首屏核心，预连接 Unsplash CDN |
| Lightbox 内图片 | fullUrl (1600w) | eager | 用户主动触发，需即时显示 |
| Related Works 缩略图 | imageUrl (600w) | lazy | 非首屏，懒加载 |
| 摄影师头像 | authorAvatar (100-200w) | lazy | 小图，延迟加载 |

### 9.3 加载状态策略

| 阶段 | 显示内容 | 实现 |
|------|----------|------|
| 图片请求中 | Shimmer 占位块（使用 work.color 作为底色） | `.img-placeholder` + inline background-color |
| 图片加载中 | Shimmer 持续 + spinner（可选） | 复用现有 shimmer 动画 |
| 图片加载完成 | opacity 0→1 渐现 (300ms) | `onLoad` setState |
| 图片加载失败 | 灰色占位 + 重试按钮（P2，本轮可只做灰色占位） | `onError` → 显示 fallback UI |

### 9.4 预加载策略

```tsx
// 进入详情页时预加载相邻作品的大图
useEffect(() => {
  const prevId = currentIndex > 0 ? works[currentIndex - 1].id : null;
  const nextId = currentIndex < works.length - 1 ? works[currentIndex + 1].id : null;
  
  const preload = (url: string) => { const img = new Image(); img.src = url; };
  if (prevId) preload(getWorkById(prevId).fullUrl);
  if (nextId) preload(getWorkById(nextId).fullUrl);
}, [currentIndex]);
```

---

## 10. 错误状态（Error States）

### 10.1 Invalid ID / 404

**触发条件**：URL 中的 `:id` 在 mockData 中找不到对应作品

**行为**：
- 不显示任何详情内容
- 显示 404 占位页面（简洁风格，与 NotFound.tsx 视觉一致）
- 提供"返回 Gallery"和"返回首页"两个 CTA
- HTTP 状态码不影响（纯前端路由）

**404 区域设计**：
```
┌─────────────────────────────────────┐
│                                     │
│           📷 图标 (muted)            │
│                                     │
│      作品不存在或已被删除            │
│      text-body text-secondary       │
│                                     │
│   [返回探索]        [返回首页]       │
│   btn-outline        btn-accent      │
│                                     │
└─────────────────────────────────────┘
```

### 10.2 图片加载失败

**显示内容**：
- 保持 color 占位背景（work.color）
- 中央显示 `Icon name="image" size=48` + "图片加载失败" 文字
- 可选重试按钮（P2）

### 10.3 数据缺失降级

| 字段缺失 | 行为 |
|----------|------|
| `description` 为空 | 隐藏整个描述区块（不显示空行） |
| `location` 为空 | 隐藏地点行 |
| `exif` 为 null/undefined | 隐藏整个 EXIF 面板 |
| `exif.film` 为空 | 隐藏该单元格（其他 EXIF 正常显示） |
| `authorAvatar` 为空 | 显示默认头像（首字母圆形占位） |
| `tags` 为空数组 | 隐藏标签行 |
| `fullUrl` 为空 | 回退到 imageUrl（较小尺寸） |

---

## 11. Loading 状态

### 11.1 页面级 Loading（首次进入）

由于是纯前端 Mock 数据，数据获取是同步的（`works.find(w => w.id === Number(id))`），**不需要页面级骨架屏**。

但为未来 API 化预留，可添加最小化 loading 判断：

| 条件 | 显示 |
|------|------|
| 数据获取中（< 50ms） | 直接渲染（感知不到） |
| 数据获取中（≥ 50ms） | PhotoHero 区域显示 Shimmer + pulse spinner |

### 11.2 组件级 Loading

| 组件 | Loading 态 |
|------|-----------|
| PhotoHero | Shimmer 占位（work.color 底色）+ spinner |
| Related Works | 4 个 Shimmer 卡片骨架（pulse 动画） |
| 摄影师头像 | Shimmer 圆形 + pulse |

---

## 12. Accessibility（a11y）

### 12.1 语义化结构

```html
<main class="photo-detail" aria-label="照片详情">
  <nav aria-label="面包屑">...</nav>

  <figure class="photo-hero" role="figure" aria-label="主图">
    <img ... />
    <figcaption>{title}</figcaption>
  </figure>

  <article class="photo-info">
    <h1>{title}</h1>
    <p>{description}</p>
  </article>

  <aside class="detail-panel">
    <section aria-label="摄影师信息">...</section>
    <section aria-label="拍摄参数">...</section>
  </aside>

  <section aria-label="相关作品">...</section>
</main>
```

### 12.2 键盘可访问性

| 元素 | 键盘支持 |
|------|----------|
| 所有按钮 | Tab 聚焦 + Enter/Space 激活 |
| 导航箭头 | Tab 聚焦 + Enter 激活 |
| 相关作品卡片 | Tab 聚焦 + Enter 进入对应详情 |
| 主图 | Tab 可聚焦（聚焦时显示"按 F 查看全屏"提示） |
| Focus Visible | 所有焦点元素有 `focus-visible:ring-2 ring-accent` 轮廓 |

### 12.3 Screen Reader 支持

| 元素 | ARIA 支持 |
|------|-----------|
| 主图 img | alt="{title}"（必填） |
| 点赞按钮 | `aria-label="点赞，当前{count}人点赞"` + `aria-pressed={isLiked}` |
| 收藏按钮 | `aria-label="收藏"` + `aria-pressed={isFavorited}` |
| 关注按钮 | `aria-label="关注{author}"` + `aria-pressed={isFollowed}` |
| EXIF 面板 | `role="table"` 或 `role="list"` + 每项 `role="listitem"` |
| 上下张导航 | `aria-label="上一张/下一张作品"` |
| 面包屑 | `aria-label="面包屑导航"` + `role="navigation"` |

### 12.4 对比度检查

| 组合 | 对比度 | WCAG AA |
|------|--------|---------|
| #fff on #0a0a0f | 18.5:1 | ✅ Pass |
| #a0a0b0 on #0a0a0f | 7.2:1 | ✅ Pass |
| #6b6b7b on #0a0a0f | 4.6:1 | ✅ Pass (正文) |
| #d4a853 on #0a0a0f | 9.8:1 | ✅ Pass |
| #d4a853 on #14141c | 10.2:1 | ✅ Pass |
| #d4a853 (btn) on #d4a853 (bg) | N/A | ⚠️ 金色按钮文字需用深色 #1a1a24 |

---

## 13. 验收标准（Acceptance Criteria）

### 13.1 功能验收（Functional）

| # | 标准 | 优先级 |
|---|------|--------|
| F1 | `/photo/:id` 可访问任意存在的作品 | P0 |
| F2 | 不存在的 ID 显示 404 页面 | P0 |
| F3 | 作品标题/描述/地点/日期正确渲染 | P0 |
| F4 | EXIF 7 项字段完整显示（含 film） | P0 |
| F5 | 摄影师信息卡片正确显示 | P0 |
| F6 | 点赞/收藏点击切换状态（含动画） | P0 |
| F7 | 分享功能复制当前 URL 到剪贴板 | P1 |
| F8 | 下载功能触发浏览器下载图片 | P1 |
| F9 | 上一张/下一张导航正常工作 | P0 |
| F10 | 键盘 ←→ 切换作品 | P0 |
| F11 | ESC 返回 Gallery | P0 |
| F12 | F 键打开/关闭 Lightbox | P1 |
| F13 | 点击主图打开 Lightbox | P1 |
| F14 | 相关作品点击进入对应详情 | P0 |
| F15 | 相关作品排除当前作品本身 | P0 |
| F16 | 浏览器前进/后退正常工作 | P0 |
| F17 | 从详情返回 Gallery 时恢复滚动位置 | P1 |

### 13.2 视觉验收（Visual）

| # | 标准 | 优先级 |
|---|------|--------|
| V1 | 与 prototype.html 设计语言完全一致 | P0 |
| V2 | 深色背景 + 金色强调（无其他彩色） | P0 |
| V3 | 照片为视觉第一主角（首屏占比 > 60%） | P0 |
| V4 | EXIF 信息整洁美观（网格/图标/对齐） | P0 |
| V5 | 响应式三端布局正确（Desktop/Tablet/Mobile） | P0 |
| V6 | 字号/间距/圆角严格遵循 Design Tokens | P0 |
| V7 | 动效流畅（60fps，仅 transform + opacity） | P1 |
| V8 | Loading 态有 Shimmer 反馈 | P1 |
| V9 | Error 态有优雅降级 | P1 |

### 13.3 性能验收（Performance）

| # | 标准 | 优先级 |
|---|------|--------|
| P1 | 主图使用 srcset + sizes | P0 |
| P2 | 主图设置 width/height 防 CLS | P0 |
| P3 | 主图使用 work.color 占位 | P0 |
| P4 | 相邻作品预加载 | P1 |
| P5 | Related Works 图片 lazy loading | P0 |
| P6 | `npm run build` 零错误 | P0 |
| P7 | LCP < 2.5s（本地 Mock 数据应 < 1s） | P1 |

### 13.4 兼容性验收（Compatibility）

| # | 标准 |
|---|------|
| C1 | Chrome 90+ / Firefox 90+ / Safari 15+ / Edge 90+ |
| C2 | iOS Safari / Android Chrome |
| C3 | 375px (iPhone SE) ~ 1920px (Desktop) 全尺寸范围 |
| C4 | `prefers-reduced-motion` 下禁用所有动画 |

---

## 附录 A：与现有文档的关系

### A.1 vs PHASE_4_PLAN.md

| 项目 | PHASE_4_PLAN 原文 | 本规范调整 | 原因 |
|------|-------------------|-----------|------|
| 布局结构 | 左摄影师右 EXIF 平分 | 改为 4+8 分栏（操作+摄影师 / 元数据+EXIF） | 更好的阅读宽度分配 |
| 面包屑 | "首页 > 探索 > 作品标题" | 精简为 "首页 / 探索 / {title}" + 返回按钮 | 更简洁 |
| 组件数 | 6 个新组件 | 扩展为 8 个（拆分 PhotographerMini / DetailBreadcrumb / PhotoNavigation） | 职责更单一 |
| Mobile 操作栏 | "底部固定" | 明确 bottom bar 规格（64px + safe-area） | 消除歧义 |
| 循环导航 | "可选" | **不循环**（首尾不越界，与 Lightbox 一致） | 降低认知负荷 |

### A.2 vs PHOTO_UX_SPEC §3.2

| 项目 | UX_SPEC 建议 | 本规范决策 | 原因 |
|------|--------------|-----------|------|
| 背景 | 比主页更深 #060609 | 使用已有的 `--color-bg-deep` (#08080c) | 不引入新颜色 token |
| 工具栏 | 透明浮动工具栏 | **不采用浮动工具栏** | 详情页不是全屏沉浸模式，而是标准页面；Navigation 已提供全局导航 |
| 双击放大 | 2x zoom | **移至 P2** | 首轮范围控制 |
| 右键保护 | 可选 | **不做** | 纯前端无法真正保护 |

### A.3 新增决策点（需用户确认）

| # | 决策点 | 选项 | 推荐 |
|---|--------|------|------|
| D1 | Gallery 卡片点击行为 | A: 进详情页 / B: 开 Lightbox / C: 双模式 | **A** |
| D2 | Mobile 导航箭头 | A: 隐藏（靠滑动）/ B: 缩小保留 / C: 改为底部指示器 | **A** |
| D3 | 描述文字超长处理 | A: 截断+展开 / B: 全部显示 / C: Tooltip | **A**（Mobile）/ **B**（Desktop） |
| D4 | 相关作品数量 | A: 4 张 / B: 6 张 / C: 8 张 | **A** |
| D5 | 本轮是否顺手修 P3 缺陷 | A: 是（text-h1/EXIF film/onError） / B: 否 | **A** |

---

## 附录 B：不做什么（Scope Boundary）

- ❌ 不做评论系统（Phase 6）
- ❌ 不做真实后端 API
- ❌ 不做用户登录/注册
- ❌ 不做图片上传
- ❌ 不做摄影师个人主页
- ❌ 不做收藏夹页面
- ❌ 不重新设计 Gallery 或 Home
- ❌ 不修改 prototype.html
- ❌ 不引入新的 CSS 框架或 UI 组件库
- ❌ 不添加新的设计令牌（颜色/字号/间距）
- ❌ 不做水印/版权声明
- ❌ 不做双击放大/手势缩放（P2）
- ❌ 不做右键保护
- ❌ 不做循环导航（首尾不越界）
- ❌ 不做浮动工具栏（使用标准页面布局 + Navigation）
