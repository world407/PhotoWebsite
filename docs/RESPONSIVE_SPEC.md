# 响应式设计规格

> Phase 0 视觉逆向分析产出 | 基于 prototype.html 响应式行为分析

---

## 1. 断点系统

基于 Tailwind 默认断点，项目实际使用以下断点：

| 断点名 | 宽度 | 设备类型 | 等价 Tailwind |
|---|---|---|---|
| `xs` | < 640px | 小屏手机 | default（无断点前缀） |
| `sm` | ≥ 640px | 大屏手机 | `sm:` |
| `md` | ≥ 768px | 平板 | `md:` |
| `lg` | ≥ 1024px | 小屏笔记本 | `lg:` |
| `xl` | ≥ 1200px | 桌面 | 自定义 media query |

**关键分界点**：
- **767px（md）**：导航形态切换（汉堡 ↔ 桌面菜单）、Hero 布局切换（堆叠 ↔ 左右分栏）、瀑布流列数变化
- **1199px（xl 自定义）**：瀑布流 3 列触发点
- **639px（sm）**：统计网格 2→4 列、Footer 底部栏排列方向

---

## 2. 各组件响应式行为

### 2.1 Navigation（导航栏）

| 特性 | < 768px（移动端） | ≥ 768px（桌面端） |
|---|---|---|
| 菜单显示 | 隐藏，显示汉堡按钮 | flex 显示 4 个链接 |
| 上传按钮 | 隐藏（在抽屉中） | sm 以上显示 |
| 初始态 padding | 16px 20px | 24px 48px |
| 滚动态圆角 | 24px（非完全 pill） | 999px（完全 pill） |
| 滚动态宽度 | calc(100% - 32px) | max-width: 1200px, 居中 |
| 滚动态 transform | none（无水平偏移） | translateX(-50%) 居中 |
| 滚动态 margin | 8px 16px | 无 margin |

**滚动态通用规则**：
- 触发条件：scrollY > 80px（JS 控制）
- 背景：rgba(15,15,22,0.75) + backdrop-blur(16px) saturate(180%)
- 边框：1px solid rgba(255,255,255,0.06)
- 阴影：shadow-nav

### 2.2 Hero Section

| 特性 | < 768px | 768px – 1023px | ≥ 1024px（lg） |
|---|---|---|---|
| 布局方向 | column（!important） | column（默认 flex-col） | row（lg:flex-row） |
| 左右列宽度 | 100% each | 100% each | 左 60% / 右 40% |
| 列间距 | gap-12 (48px) | gap-12 | gap-16 (64px) |
| 顶部 padding | pt-32 (128px) | pt-32 | pt-40 (160px) |
| 底部 padding | pb-20 (80px) | pb-20 | pb-24 (96px) |
| 统计网格列数 | 2 列（!important） | 4 列（sm:grid-cols-4） | 4 列 |
| 前卡片图片高度 | h-[400px] | h-[400px] | h-[460px] |
| 后卡片位置 | -top-4 -right-4 w-[70%] | -top-4 -right-4 w-[70%] | -top-4 -right-4 w-[70%] |

**注意**：移动端 `.hero-layout { flex-direction: column !important }` 使用了 `!important`，工程化时应避免，改用断点类优先级控制。

### 2.3 Waterfall Gallery（瀑布流）

| 断点 | 列数 | column-gap |
|---|---|---|
| < 768px | 1 列 | 无（单列无间距） |
| 768px – 1199px | 2 列 | 20px |
| ≥ 1200px | 3 列 | 20px |

- 卡片间距：margin-bottom: 20px（所有断点一致）
- 卡片圆角：8px（所有断点一致）

### 2.4 Photographer Grid（摄影师网格）

| 断点 | 列数 | gap |
|---|---|---|
| < 640px | 1 列 | gap-5 (20px) |
| 640px – 1023px | 2 列 | gap-5 |
| ≥ 1024px | 4 列 | gap-5 |

### 2.5 Footer

| 特性 | < 640px | 640px – 767px | ≥ 768px |
|---|---|---|---|
| 链接区列数 | 2 列 | 2 列 | 4 列 |
| 品牌列跨列 | col-span-2 | col-span-2 | col-span-1 |
| 底部栏方向 | column | row | row |
| 底部栏对齐 | items-center | justify-between | justify-between |
| 链接区 gap | gap-10 (40px) | gap-10 | gap-10 |

### 2.6 Floating Action Buttons

所有断点位置一致：
- bottom-6 right-6
- 回到顶部：w-12 h-12
- FAB：w-14 h-14
- 间距：gap-3

### 2.7 Section Padding

| Section | < 768px | ≥ 768px（md）/ ≥ 1024px（lg） |
|---|---|---|
| Hero | pt-32 pb-20 | md:pt-40 md:pb-24 |
| Works | py-20 | lg:py-24 |
| Photographers | py-20 | lg:py-24 |
| Footer | py-16 | py-16（无变化） |

---

## 3. 内容宽度与边距

### 3.1 容器最大宽度

所有区块统一使用：
```
max-w-[1200px] mx-auto px-6
```

- `max-width: 1200px` — 全局内容最大宽度
- `margin-left/right: auto` — 水平居中
- `padding-left/right: 24px`（px-6）— 所有断点统一左右内边距

### 3.2 导航特殊宽度

- 初始态：全宽（100%）
- 滚动态（桌面）：max-width: 1200px, width: calc(100% - 32px)，居中
- 滚动态（移动）：width: calc(100% - 32px)，margin: 8px 16px

---

## 4. 移动端专项设计

### 4.1 Drawer 覆盖层

- 全屏覆盖（fixed inset-0）
- z-index: 60（高于导航的 50）
- 背景：bg-bg-deep/95 + backdrop-blur-xl
- 无圆角（全屏覆盖）
- 从右侧滑入（translateX 100% → 0）

### 4.2 Drawer 菜单项

- 字号：text-h3（24px）—— 大于桌面导航的 text-body（16px）
- 内距：py-3 px-4
- 圆角：rounded-lg（8px）
- 背景透明，hover: bg-white/5
- 交错入场动画（stagger 0.05s 递增）

### 4.3 触摸目标

所有可点击元素确保最小 44×44px 触摸区域：
- 图标按钮：w-9 h-9（36px，偏小，建议提升至 w-10 h-10 或 w-11 h-11）
- 标签芯片：px-4 py-1.5（高度约 30px，偏小，建议 py-2）
- 按钮：py-3.5（约 46px，合适）
- 抽屉菜单项：py-3（约 44px，合适）

---

## 5. 图片响应式策略

### 5.1 当前方案

- 所有图片使用 Unsplash CDN，URL 参数控制尺寸 `?w=600&h=XXX&fit=crop`
- `width`/`height` HTML 属性设置
- `loading="lazy"`（Hero 主图 eager，其余 lazy）
- `object-fit: cover` 保证裁切一致性

### 5.2 建议优化

1. **srcset 响应式图片**：为不同断点提供不同分辨率的图片源
   - 瀑布流：1x 列宽约 380px（3列）→ 建议提供 w=400/800 两档
   - Hero 主图：建议提供 w=600/1200 两档
2. **WebP/AVIF 格式**：通过 Unsplash `&fm=webp` 参数启用
3. **Hero LCP 优化**：前卡片图片设为 `fetchpriority="high"`
4. **图片预加载**：Hero 主图可添加 `<link rel="preload">`

---

## 6. 响应式断点使用规范

工程化后推荐遵循：

| 断点 | 命名 (CSS) | 命名 (JS) | 主要用途 |
|---|---|---|---|
| 0 – 639px | `--bp-sm` | `bp.sm` | 手机纵向 |
| 640 – 767px | `--bp-md` | `bp.md` | 手机横向 / 小平板 |
| 768 – 1023px | `--bp-lg` | `bp.lg` | 平板 |
| 1024 – 1199px | `--bp-xl` | `bp.xl` | 小屏桌面 |
| ≥ 1200px | `--bp-2xl` | `bp.2xl` | 标准桌面 |

CSS 变量建议：
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1200px;
  --container-max: 1200px;
  --container-padding: 24px;
}
```

---

## 7. 现有响应式问题与风险

| 问题 | 位置 | 风险等级 | 建议 |
|---|---|---|---|
| `!important` 覆盖 | `.hero-layout` flex-direction | 中 | 重构为断点类控制，移除 important |
| 触摸目标过小 | 图标按钮 w-9 h-9 (36px) | 低 | 移动端提升至 44px |
| 标签芯片触摸区偏小 | py-1.5 (约 30px 高) | 低 | 移动端增加 py-2 |
| 无横屏/超小屏适配 | < 360px 设备未测试 | 低 | 验证 iPhone SE (375px) 表现 |
| 导航初始态透明无边界 | 页面顶部时文字与 Hero 图片叠加 | 中 | 确认文字在各 Hero 图上的可读性 |
| 后卡片在窄屏溢出 | -right-4 在 320px 屏可能横向滚动 | 中 | 添加 overflow 隐藏或减小偏移 |
