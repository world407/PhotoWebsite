# 页面规格文档

> Phase 0 视觉逆向分析产出 | 基于 prototype.html 页面结构分析

---

## 1. 现有页面清单

当前 prototype 为**单页应用（SPA）形态**的首页，通过锚点导航连接各区块。

| 页面标识 | 路由锚点 | 状态 | 说明 |
|---|---|---|---|
| 首页 Home | `#hero` | ✅ 已实现 | 视觉入口，包含品牌展示与核心 CTA |
| 作品探索 Works | `#works` | ✅ 已实现（区块） | 瀑布流画廊 + 分类筛选 |
| 摄影师 Photographers | `#photographers` | ✅ 已实现（区块） | 摄影师卡片网格 |
| 收藏夹 Favorites | `#works` | ⚠️ 仅导航占位 | 与探索共用锚点，待独立页面 |
| 关于 About | — | ❌ 未实现 | 移动端抽屉有入口，无对应内容 |
| 帮助 Help | — | ❌ 未实现 | 仅 Footer/抽屉链接占位 |

---

## 2. 页面整体结构

```
<body>
├── <header id="mainNav">          导航栏（双形态）
├── <div id="mobileDrawer">        移动端抽屉菜单
├── <section id="hero">            Hero 首屏
├── <section id="works">           精选作品
├── <section id="photographers">   热门摄影师
├── <footer>                       页脚
└── <div class="fixed">             悬浮操作按钮组（回到顶部 + FAB）
```

---

## 3. Section 详细规格

### 3.1 Navigation（导航栏）

**位置**：`position: fixed`，始终固定在视口顶部

**双形态**：

| 状态 | 触发条件 | 外观 |
|---|---|---|
| 初始态 | scrollY ≤ 80px | 透明背景、无阴影、全宽、padding 24px 48px、无圆角 |
| 滚动态 | scrollY > 80px | 半透明玻璃态背景、pill 圆角（999px）、居中浮起、max-width 1200px、padding 12px 28px、阴影 shadow-nav、1px 边框 |

**内部结构**（max-width: 1200px, 水平三栏布局）：
- **左栏**：Logo
  - 金色圆点（w-2 h-2 rounded-full bg-accent）
  - 中文品牌名「影·迹」（text-h3 font-semibold）
  - 英文副标「PHOTOGRAPHY」（text-caption tracking-[0.2em] uppercase text-muted）
- **中栏**：桌面导航菜单（md:flex hidden）
  - 4 个链接：首页 / 探索 / 收藏夹 / 摄影师
  - gap-8（32px）
  - active 项：金色 + 底部 2px 金色下划线动画
  - hover 项：文字变金 + 下划线展开
- **右栏**：操作按钮组（flex gap-3）
  - 搜索图标按钮（w-9 h-9 rounded-full，hover:bg-white/5）
  - 上传作品按钮（btn-accent，sm 以上显示，px-5 py-2.5）
  - 用户头像按钮（w-9 h-9 rounded-full bg-bg-card）
  - 汉堡菜单按钮（md:hidden，w-9 h-9 rounded-full）

**移动端适配**（< 768px）：
- 滚动态：全宽 calc(100% - 32px)，圆角 24px，margin 8px 16px，top: 0，无水平居中偏移
- 初始态：padding 16px 20px

---

### 3.2 Mobile Drawer（移动端抽屉）

**触发**：点击汉堡按钮
**动画**：从右侧滑入 `translateX(100%) → 0`，duration 0.4s，cubic-bezier(0.4,0,0.2,1)
**背景**：bg-bg-deep/95 + backdrop-blur-xl
**结构**：
- 顶部栏：标题「菜单」(text-h3) + 关闭按钮（X）
- 导航链接列表（flex-col gap-2 p-6）：
  - 7 个 drawer-item，每个 py-3 px-4 rounded-lg
  - 文字大小 text-h3（注意：抽屉内链接比桌面导航更大）
  - 交错入场动画：delay 0.1s → 0.4s（每项 +0.05s）
- 底部上传按钮（btn-accent，mt-6 py-3）

---

### 3.3 Hero Section（首屏）

**容器**：max-w-1200px mx-auto px-6
**内边距**：pt-32 pb-20 / md:pt-40 pb-24
**装饰**：`grid-texture`（60px 网格纹理），`overflow-hidden`
**布局**：flex flex-col lg:flex-row gap-12 lg:gap-16 items-center
**最下高度**：min-h-[calc(100vh-200px)]

#### 左侧（hero-left）：w-full lg:w-[60%]

1. **公告条**（Announcement Badge）
   - inline-flex items-center gap-2
   - px-4 py-2 rounded-full
   - border border-border-subtle bg-bg-card/50
   - 金色脉冲圆点（w-2 h-2 rounded-full bg-accent animate-pulse）
   - 文字：「精选摄影作品持续更新中」（text-caption text-secondary）
   - hover：border-accent/50
   - mb-8

2. **主标题**（Display）
   - `text-display`（64px / 1.1 / 700 / -0.02em）
   - 文案：「记录光影 · <金色渐变>发现美好</金色渐变>」
   - 「发现美好」四字使用金色渐变文字效果

3. **副标题**
   - text-body text-secondary
   - mt-6 max-w-lg
   - 文案：「为摄影师打造的视觉叙事空间，分享每一个值得铭记的瞬间」

4. **数据指标网格**（hero-stats）
   - grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4
   - mt-10
   - 4 个指标：
     - 12,800+ 作品
     - 56,300+ 获赞
     - 3,200+ 摄影师
     - 180+ 标签
   - 数字样式：text-stat（28px/1/700）text-accent
   - 标签样式：text-caption text-muted mt-1
   - 数字有计数动画（见 Motion Spec）

5. **CTA 按钮组**
   - flex flex-wrap gap-4 mt-10
   - 主按钮：「探索作品」+ 右箭头图标（btn-accent, px-7 py-3.5）
   - 次按钮：「上传作品」（btn-outline, px-7 py-3.5）

#### 右侧（hero-right）：w-full lg:w-[40%]，relative

双卡片叠加布局：
1. **后卡片**（z-0）
   - 位置：absolute -top-4 -right-4 w-[70%]
   - 旋转：rotate(4deg)
   - 圆角：rounded-card，阴影 shadow-card
   - 图片：山景风景（h-48 object-cover）
   - 浮动动画：float 3s ease-in-out infinite
2. **前卡片**（z-10）
   - 位置：relative
   - 圆角：rounded-card，阴影 shadow-card
   - 图片：「山间晨雾」（h-400px lg:h-460px object-cover）
   - 遮罩：gradient-to-t from-black/80 via-black/20 to-transparent
   - 底部信息区（p-5 absolute bottom-0）：
     - 标题「山间晨雾」（text-h3 font-semibold）
     - 作者「@林风」+ 心形图标 + 「1,248」
   - 浮动动画：float-delay 3s（delay 0.5s）

---

### 3.4 Works Section（精选作品）

**容器**：max-w-1200px mx-auto px-6
**内边距**：py-20 / lg:py-24

#### 区块头（Section Header）
- flex items-end justify-between mb-8
- 左侧：
  - h2「精选作品」（text-h2 font-semibold）
  - p「发现摄影师的视觉叙事」（text-caption text-secondary mt-2）
- 右侧：
  - 「查看全部」链接（text-accent + 右箭头图标）
  - hover: text-accent-hover

#### 分类标签（Tag Filter Bar）
- flex flex-wrap gap-2 mb-10
- 6 个 tag-chip：全部 / 人像 / 风景 / 街拍 / 建筑 / 静物
- 样式：px-4 py-1.5 rounded-full text-caption font-medium border border-border-subtle bg-bg-card
- 默认态：text-secondary
- 选中态（active）：bg-accent text-dark border-accent
- hover 态：border-accent/50 text-accent
- 点击切换筛选（JS 重新渲染瀑布流）

#### 瀑布流画廊（Waterfall Gallery）
- CSS columns 实现（column-count）
- column-gap: 20px
- 响应式列数：
  - ≥1200px：3 列
  - 768–1199px：2 列
  - <768px：1 列
- 每张作品卡片（work-card）：
  - break-inside: avoid
  - margin-bottom: 20px
  - border-radius: 8px
  - overflow: hidden
  - 图片宽 100%，高度由 aspect-ratio 600/h 动态决定
  - 懒加载占位（shimmer 效果）
  - 图片加载完成后隐藏 placeholder
  - hover 效果：translateY(-4px) + img scale(1.05)
  - 悬浮信息层（work-overlay）：
    - 初始：translateY(100%)（隐藏在底部）
    - hover：translateY(0)（从底部滑入）
    - 背景：from-black/90 via-black/50 to-transparent
    - 内容：标题（text-body-sm font-semibold）+ 作者 @xxx + 点赞数

**当前作品数据**：9 张，涵盖 landscape / street / portrait / architecture / still 五个分类。

---

### 3.5 Photographers Section（热门摄影师）

**容器**：max-w-1200px mx-auto px-6
**内边距**：py-20 / lg:py-24
**顶部边框**：border-t border-border-subtle

#### 区块头
- mb-10
- h2「热门摄影师」（text-h2）
- p「关注你喜欢的创作者」（text-caption text-secondary mt-2）

#### 摄影师网格
- grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5
- 4 位摄影师卡片：林风 / 云溪 / 山野 / 星辰

每张摄影师卡片（photographer-card）：
- bg-bg-card rounded-card p-6
- hover：translateY(-4px) + bg-bg-card-hover + 头像环变金色
- 头像：
  - 容器 w-20 h-20 rounded-full mx-auto
  - border-2 border-transparent p-0.5（avatar-ring）
  - 内部图片 rounded-full object-cover
- 姓名：text-h3 text-center mt-4
- 简介：text-caption text-muted text-center mt-1
- 数据：flex justify-center gap-6 mt-4
  - 作品数（accent font-semibold）+ 粉丝数（accent font-semibold）
- 关注按钮：btn-follow w-full mt-5 py-2 rounded-btn
  - 默认：border white/20 text-secondary bg-transparent
  - hover：border-accent text-accent
  - 已关注（followed）：bg-accent text-dark border-accent

---

### 3.6 Footer（页脚）

**背景**：bg-bg-deep
**顶部边框**：border-t border-border-subtle
**外边距**：mt-10
**内边距**：py-16 px-6（max-w-1200px mx-auto）

#### 链接区
- grid grid-cols-2 md:grid-cols-4 gap-10
- **品牌列**（col-span-2 md:col-span-1）：
  - Logo（金点 + 「影·迹」）
  - 品牌描述（text-caption text-muted leading-relaxed）
- **快速链接列**：首页/探索/摄影师/关于
- **作品分类列**：人像/风景/街拍/建筑
- **联系我们列**：帮助中心/意见反馈/合作洽谈/隐私政策
- 所有链接：text-caption text-muted → hover:text-accent

#### 底部栏
- mt-12 pt-8 border-t border-border-subtle
- flex flex-col sm:flex-row items-center justify-between gap-4
- 左侧：版权文字「© 2026 影·迹 PHOTOGRAPHY. All rights reserved.」
- 右侧：社交图标组（flex gap-3）
  - 微博 / Instagram / Twitter
  - 每个图标：w-9 h-9 rounded-full，hover:text-accent hover:bg-white/5

---

### 3.7 Floating Action Buttons（悬浮按钮组）

**位置**：fixed bottom-6 right-6 z-40
**方向**：flex flex-col gap-3

1. **回到顶部**（back-to-top）
   - w-12 h-12 rounded-full bg-bg-card border border-border-subtle
   - 初始：opacity:0 pointer-events:none
   - scrollY > 500px 时：opacity:1 pointer-events:auto
   - hover: text-accent border-accent
   - 图标：上箭头 chevron
2. **上传 FAB**
   - w-14 h-14 rounded-full btn-accent
   - shadow-lg shadow-accent/30
   - hover：rotate(45deg)（加号→×），duration 0.3s
   - 图标：加号 +

---

## 4. 信息架构总结

### 4.1 导航层级

```
首页 (#hero)
├── 公告/更新提示
├── 品牌主张（主标题 + 副标题）
├── 数据信任（4 个核心指标）
└── 核心行动（探索作品 / 上传作品）

作品探索 (#works)
├── 分类筛选（6 个标签）
└── 瀑布流画廊（9+ 作品卡）
    └── 作品卡 → 未来可跳转 Photo Detail

摄影师 (#photographers)
└── 摄影师网格（4 张卡片）
    └── 摄影师卡 → 未来可跳转 Photographer Profile

Footer
├── 品牌信息
├── 快速链接
├── 作品分类
└── 联系/法律
```

### 4.2 CTA 层级

| CTA | 类型 | 位置 | 视觉权重 |
|---|---|---|---|
| 探索作品 | 主按钮（accent） | Hero CTA 区 | ★★★★★ |
| 上传作品 | 主按钮（accent） | 导航栏 + Hero + FAB + 抽屉 | ★★★★★ |
| 查看全部 | 文字链接 | Works 区块头 | ★★★ |
| 关注 | 次按钮（outline/filled） | 摄影师卡片 | ★★★ |
| 搜索 | 图标按钮 | 导航栏 | ★★ |
