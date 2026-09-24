# 组件规格文档

> Phase 0 视觉逆向分析产出 | 基于 prototype.html 组件提取

---

## 1. 组件设计原则

1. **影像优先**：所有组件为照片展示服务，不喧宾夺主
2. **暗色兼容**：所有组件基于深色背景设计，不提供浅色变体
3. **微交互克制**：动画柔和（200-400ms），easing 统一为 cubic-bezier(0.4,0,0.2,1) 或 ease
4. **金色引导**：交互焦点（hover/active/focus）统一使用金色系
5. **圆角分层**：大卡片 16px / 按钮 12px / 图片 8px / 胶囊 999px，不混用

---

## 2. 原子组件（Atoms）

### 2.1 Logo

| 属性 | 值 |
|---|---|
| 组成 | 金色圆点 + 中文品牌名 + 英文副标 |
| 圆点尺寸 | w-2 h-2 rounded-full bg-accent |
| 中文字体 | text-h3 font-semibold text-primary |
| 英文字体 | text-caption font-normal tracking-[0.2em] uppercase text-muted |
| 间距 | gap-2 |
| 变体 | 标准（导航）、简洁（Footer 无英文副标） |

### 2.2 Icon Button（图标按钮）

| 属性 | 值 |
|---|---|
| 尺寸 | w-9 h-9（标准）、w-10 h-10（抽屉关闭）、w-12 h-12（回到顶部）、w-14 h-14（FAB） |
| 形状 | rounded-full（全部圆形） |
| 默认背景 | transparent 或 bg-bg-card |
| hover 背景 | bg-white/5 |
| 默认图标色 | text-secondary |
| hover 图标色 | text-primary 或 text-accent |
| 过渡 | transition-colors |
| 图标尺寸 | 16-20px（按容器缩放） |
| 图标描边 | stroke-width 1.5（线性图标）、部分填充图标（心形、社交） |

**图标库**：全部使用内联 SVG（Lucide 风格），stroke-linecap="round" stroke-linejoin="round"。

使用的图标清单：
- 搜索（Search）：circle + path
- 上传（Upload）：arrow-up-from-line
- 用户（User）：circle + person
- 菜单（Menu）：三条横线
- 关闭（X）：两条交叉线
- 右箭头（Chevron Right）：polyline
- 心形（Heart）：填充路径
- 上箭头（Chevron Up）：polyline
- 加号（Plus）：两条线
- 微博/Instagram/Twitter：简化几何形

### 2.3 Accent Button（主按钮）

| 属性 | 值 |
|---|---|
| class | `.btn-accent` |
| 背景 | bg-accent (#d4a853) |
| 文字色 | #1a1a24（深色文字在金色上） |
| 字重 | 600 (font-semibold) |
| 圆角 | rounded-btn (12px) |
| 内距 | px-7 py-3.5（大/CTA）、px-5 py-2.5（导航）、py-3 px-6（抽屉）、py-2 w-full（关注-已关注态） |
| hover | bg-accent-hover (#e0b866) + scale(1.02) + shadow 金色发光 |
| active | scale(0.98) |
| 过渡 | all 0.2s ease |
| 图标 | 可选右箭头/上传图标，gap-2 |

### 2.4 Outline Button（次按钮）

| 属性 | 值 |
|---|---|
| class | `.btn-outline` |
| 背景 | transparent |
| 边框 | 1px solid rgba(255,255,255,0.2) |
| 文字色 | text-primary |
| 圆角 | rounded-btn (12px) |
| 内距 | px-7 py-3.5（与主按钮对齐） |
| hover | border-accent + text-accent + scale(1.02) |
| 过渡 | all 0.2s ease |

### 2.5 Follow Button（关注按钮）

| 属性 | 值 |
|---|---|
| class | `.btn-follow` |
| 默认态 | border white/20 text-secondary bg-transparent |
| hover | border-accent text-accent |
| 已关注态 (`.followed`) | bg-accent text-dark border-accent |
| 尺寸 | w-full py-2 rounded-btn text-body-sm font-medium |
| 过渡 | all 0.25s ease |

### 2.6 Tag Chip（标签芯片）

| 属性 | 值 |
|---|---|
| class | `.tag-chip` |
| 形状 | rounded-full |
| 内距 | px-4 py-1.5 |
| 字号 | text-caption font-medium |
| 默认态 | bg-bg-card text-secondary border border-subtle |
| 选中态 (`.active`) | bg-accent text-dark border-accent |
| hover（非选中） | border-accent/50 text-accent |
| 过渡 | all 0.25s ease |
| 行为 | 单选筛选组（点击切换 active，同时渲染瀑布流） |

### 2.7 Text Link（文字链接）

| 属性 | 值 |
|---|---|
| 默认色 | text-muted（Footer）/ text-secondary（导航）/ text-accent（区块头"查看全部"） |
| hover 色 | text-accent |
| 过渡 | transition-colors |
| 后缀图标 | 可选右箭头（gap-1） |

---

## 3. 分子组件（Molecules）

### 3.1 Nav Link（导航链接）

| 属性 | 值 |
|---|---|
| class | `.nav-link` |
| 字号 | text-body（桌面）/ text-h3（抽屉） |
| 默认色 | text-secondary |
| hover/active 色 | text-accent |
| 下划线 | ::after 伪元素，bottom: -4px，height: 2px，bg-accent |
| 下划线动画 | width 0→100%，0.3s cubic-bezier(0.4,0,0.2,1) |
| active 类 | `.active` 保持金色+下划线全宽 |

### 3.2 Announcement Badge（公告条）

| 属性 | 值 |
|---|---|
| 形状 | inline-flex rounded-full |
| 内距 | px-4 py-2 |
| 边框 | border border-subtle |
| 背景 | bg-bg-card/50 |
| 文字 | text-caption text-secondary |
| 脉冲点 | w-2 h-2 rounded-full bg-accent animate-pulse |
| hover | border-accent/50 |
| 过渡 | transition-colors |

### 3.3 Stats Grid（数据指标网格）

| 属性 | 值 |
|---|---|
| 布局 | grid grid-cols-2 sm:grid-cols-4 |
| 间距 | gap-x-8 gap-y-4 |
| 数字样式 | text-stat (28px/1/700) text-accent |
| 标签样式 | text-caption text-muted mt-1 |
| 数字后缀 | `+` 号（JS 计数动画结束后附加） |

### 3.4 Work Card（作品卡片）

| 属性 | 值 |
|---|---|
| class | `.work-card` |
| 布局 | break-inside: avoid（瀑布流） |
| 圆角 | rounded-img (8px) |
| 溢出 | overflow: hidden |
| 下边距 | mb-5 (20px) |
| hover | translateY(-4px) |
| 过渡 | all 0.25s ease |

**内部结构**：
```
.work-card
├── .work-img (relative, overflow hidden)
│   ├── .img-placeholder (absolute inset-0, shimmer动画)
│   └── img (relative z-10, w-full, onload隐藏placeholder)
└── .work-overlay (absolute bottom-0 inset-x-0)
    ├── h3 标题 (text-body-sm font-semibold white)
    └── .flex 元信息
        ├── span @作者 (text-caption white/70)
        └── span 点赞数 (text-caption white/70 + heart icon)
```

**图片规格**：
- 宽度：100%（自适应列宽）
- 高度：通过 `aspect-ratio: 600/{h}` 动态设定
- object-fit: cover（实际通过 width:100% + aspect-ratio 自然裁切）
- loading="lazy"
- 占位符：shimmer 渐变动画

**Overlay 规格**：
- 初始：translateY(100%)（隐藏于底部）
- hover：translateY(0)（滑入显示）
- 动画：0.35s cubic-bezier(0.4,0,0.2,1)
- 背景：gradient-to-t from-black/90 via-black/50 to-transparent
- 内距：p-4

### 3.5 Photographer Card（摄影师卡片）

| 属性 | 值 |
|---|---|
| class | `.photographer-card` |
| 背景 | bg-bg-card |
| 圆角 | rounded-card (16px) |
| 内距 | p-6 |
| hover | translateY(-4px) + bg-bg-card-hover |
| 过渡 | all 0.25s ease |

**内部结构**：
```
.photographer-card
├── .avatar-ring (w-20 h-20 rounded-full border-2 border-transparent p-0.5 mx-auto)
│   └── img (w-full h-full rounded-full object-cover)
├── h3 姓名 (text-h3 text-center mt-4)
├── p 简介 (text-caption text-muted text-center mt-1)
├── .flex 数据 (justify-center gap-6 mt-4)
│   ├── span 作品数 (text-accent font-semibold)
│   └── span 粉丝数 (text-accent font-semibold)
└── button.btn-follow (w-full mt-5 py-2)
```

**头像环交互**：hover 时 `.avatar-ring` border-color 变为 accent。

### 3.6 Image Placeholder（图片占位符）

| 属性 | 值 |
|---|---|
| class | `.img-placeholder` |
| 位置 | absolute inset-0（绝对定位覆盖图片区域） |
| 背景 | linear-gradient(135deg, #1a1a24 25%, #22222e 50%, #1a1a24 75%) |
| 背景尺寸 | 200% 100% |
| 动画 | shimmer 1.5s infinite（background-position 从 200%→-200%） |
| 隐藏时机 | 图片 `onload` 时 display:none |

### 3.7 Section Header（区块标题）

| 变体 | 布局 |
|---|---|
| 带"查看全部" | flex items-end justify-between（Works 区） |
| 纯标题 | 块级（Photographers 区） |
| 组成 | h2 text-h2 + p text-caption text-secondary mt-2 |
| 下边距 | mb-8（Works）/ mb-10（Photographers） |

---

## 4. 布局组件（Organisms）

### 4.1 Dual-State Navigation（双形态导航）

**Props（未来实现时）**：
- `scrolled`：Boolean（由 scrollY > 80 控制）
- `activeLink`：String（当前活跃链接 href）

**行为**：
1. 监听 scroll 事件，requestAnimationFrame 节流
2. scrollY > 80 时添加 `.scrolled` 类
3. `.scrolled` 类改变：position → fixed centered, background → 玻璃态, radius → pill, padding → compact, shadow → nav
4. 移动端独立样式覆盖

### 4.2 Mobile Drawer（移动抽屉）

**Props**：
- `isOpen`：Boolean

**行为**：
1. 汉堡按钮点击 → 添加 `.open` 类
2. 关闭按钮/链接点击 → 移除 `.open` 类
3. `.open` 类：translateX(0) + 子项交错 opacity/translateY 入场
4. 遮罩：bg-bg-deep/95 + backdrop-blur-xl（全屏覆盖）
5. 菜单项 stagger delay：每项 +0.05s（0.1s → 0.4s）

### 4.3 Hero Section

**组成**：
- Announcement Badge
- Display 标题（含金色渐变文字片段）
- 副标题
- Stats Grid（带动画计数）
- CTA Button Group
- Floating Image Cards（双层旋转叠加 + float 动画）

**布局比例**：
- 桌面（lg+）：左 60% / 右 40%
- 平板/移动：上下堆叠 100% / 100%

### 4.4 Waterfall Gallery（瀑布流画廊）

**技术方案**：CSS Multi-column（column-count + column-gap）
**列数**：3 / 2 / 1（lg / md / sm）
**间距**：column-gap: 20px
**项间距**：mb-5 (20px)
**子项**：break-inside: avoid

**筛选行为**：
1. 点击 tag-chip → 移除其他 chip 的 active → 当前添加 active
2. 调用 renderWorks(tag) 重新生成 innerHTML
3. 新生成的 .animate-on-scroll 重新注册 IntersectionObserver

### 4.5 Photographer Grid（摄影师网格）

**技术方案**：CSS Grid
**列数**：4(lg) / 2(sm) / 1(default)
**间距**：gap-5
**渲染**：JS 数据驱动，innerHTML 批量生成

### 4.6 Footer

**布局**：
- 上部分：grid 4 列（md）/ 2 列（default）/ 品牌列跨 2 列（移动端）
- 下部分：flex，左版权右社交，移动端上下堆叠
- 分隔线：border-t border-subtle

### 4.7 Floating Action Group

**固定定位**：bottom-6 right-6 z-40
**方向**：flex-col items-center gap-3
**组件**：BackToTop（条件显示）+ Upload FAB（始终显示）

---

## 5. 可复用组件清单（工程化建议）

未来 React/Vue 组件化时，建议拆分如下：

```
components/
├── atoms/
│   ├── Logo.tsx                 (Logo，variant: 'full' | 'minimal')
│   ├── IconButton.tsx           (图标按钮，size: 'sm' | 'md' | 'lg' | 'xl')
│   ├── Button.tsx               (按钮，variant: 'accent' | 'outline' | 'follow' | 'ghost')
│   ├── TagChip.tsx              (标签芯片)
│   ├── Icon/                    (SVG 图标集合)
│   │   ├── Search.tsx
│   │   ├── Upload.tsx
│   │   ├── User.tsx
│   │   ├── Menu.tsx
│   │   ├── Close.tsx
│   │   ├── ChevronRight.tsx
│   │   ├── ChevronUp.tsx
│   │   ├── Heart.tsx
│   │   ├── Plus.tsx
│   │   └── Social/ (Weibo, Instagram, Twitter)
│   └── ShimmerPlaceholder.tsx   (图片加载骨架)
│
├── molecules/
│   ├── NavLink.tsx              (导航链接，含下划线动画)
│   ├── AnnouncementBadge.tsx    (公告条)
│   ├── StatItem.tsx             (单个数据指标)
│   ├── WorkCard.tsx             (作品卡片)
│   ├── PhotographerCard.tsx     (摄影师卡片)
│   ├── SectionHeader.tsx        (区块标题，withAction 可选)
│   └── SocialIcon.tsx           (社交图标按钮)
│
├── organisms/
│   ├── Navigation.tsx           (双形态导航)
│   ├── MobileDrawer.tsx         (移动抽屉)
│   ├── HeroSection.tsx          (首屏)
│   ├── TagFilterBar.tsx         (标签筛选栏)
│   ├── WaterfallGallery.tsx     (瀑布流画廊)
│   ├── PhotographerGrid.tsx     (摄影师网格)
│   ├── Footer.tsx               (页脚)
│   └── FloatingActions.tsx      (悬浮按钮组)
│
└── layouts/
    └── MainLayout.tsx           (主布局：Nav + Slot + Footer + FAB)
```

---

## 6. 组件交互状态矩阵

| 组件 | Default | Hover | Active/Focus | Selected/Followed | Disabled |
|---|---|---|---|---|---|
| NavLink | text-secondary | text-accent + underline-grow | — | text-accent + underline-full | — |
| Accent Button | bg-accent text-dark | bg-accent-hover + scale(1.02) + glow | scale(0.98) | — | opacity-50 |
| Outline Button | border-white/20 text-white | border-accent text-accent + scale(1.02) | scale(0.98) | — | opacity-50 |
| TagChip | bg-card text-secondary border-subtle | border-accent/50 text-accent | — | bg-accent text-dark border-accent | — |
| WorkCard | — | translateY(-4px) + img scale(1.05) + overlay slide-up | — | — | — |
| PhotographerCard | bg-card | translateY(-4px) bg-card-hover + avatar-ring-accent | — | — | — |
| Follow Button | border-white/20 text-secondary | border-accent text-accent | — | bg-accent text-dark | — |
| IconButton | bg-transparent text-secondary | bg-white/5 text-accent/primary | — | — | — |
| FAB | bg-accent | rotate(45deg) | scale(0.95) | — | — |
