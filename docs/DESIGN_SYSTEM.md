# 影·迹 PHOTOGRAPHY — 设计系统规范

> Phase 0 视觉逆向分析产出 | 基于 prototype.html 提取

---

## 1. 核心视觉语言

**设计气质**：深色沉浸式摄影画廊，金色点缀的高端质感。
关键词：`暗调`、`沉浸`、`金色高光`、`玻璃态`、`呼吸感`、`电影感`。

**视觉哲学**：
- 以近黑色背景（#0a0a0f）为画布，让照片本身成为视觉主角
- 金色（#d4a853）作为唯一强调色，承担所有交互引导与品牌识别
- 大量留白与微妙的径向渐变营造深度感，不干扰影像内容
- 玻璃态导航 + 柔和阴影构建现代感层次
- 所有圆角克制（8px–16px），避免过度圆润的"可爱感"，保持专业摄影调性

---

## 2. Color Tokens

### 2.1 语义色板

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `--color-bg-base` | `#0a0a0f` | 页面主背景（含蓝调的近黑） |
| `--color-bg-deep` | `#08080c` | 更深层背景（Footer / 抽屉） |
| `--color-bg-card` | `#14141c` | 卡片/表面背景 |
| `--color-bg-card-hover` | `#1a1a24` | 卡片悬浮态 |
| `--color-accent` | `#d4a853` | 主强调色（品牌金） |
| `--color-accent-hover` | `#e0b866` | 强调色悬浮态 |
| `--color-text-primary` | `#ffffff` | 主文字 |
| `--color-text-secondary` | `#a0a0b0` | 次要文字 |
| `--color-text-muted` | `#6b6b7b` | 弱化文字/辅助说明 |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | 细分隔线 |

### 2.2 衍生色（CSS 中实际使用）

| Token 名称 | 色值 | 用途 |
|---|---|---|
| `--color-bg-gradient` | `radial-gradient(ellipse at 50% 0%, #12121a 0%, #0a0a0f 70%)` | 页面背景渐变 |
| `--color-accent-gradient` | `linear-gradient(135deg, #d4a853 0%, #f0d080 50%, #d4a853 100%)` | 金色渐变文字 |
| `--color-gold-glow` | `rgba(212, 168, 83, 0.4)` | 金色发光阴影（按钮） |
| `--color-gold-glow-soft` | `rgba(212, 168, 83, 0.3)` | 金色发光阴影（FAB） |
| `--color-overlay-image` | `from-black/80 via-black/20 to-transparent` | 图片底部遮罩 |
| `--color-overlay-work` | `from-black/90 via-black/50 to-transparent` | 作品卡片悬浮遮罩 |
| `--color-shimmer-start` | `#1a1a24` | 骨架屏起始 |
| `--color-shimmer-mid` | `#22222e` | 骨架屏中段 |
| `--color-nav-scrolled` | `rgba(15, 15, 22, 0.75)` | 滚动后导航背景 |
| `--color-white-5` | `rgba(255,255,255,0.05)` | 极弱白色（hover 背景） |
| `--color-white-6` | `rgba(255,255,255,0.06)` | 极弱白色（导航边框） |
| `--color-white-20` | `rgba(255,255,255,0.2)` | 白色边框（outline 按钮） |
| `--color-scrollbar-track` | `#0a0a0f` | 滚动条轨道 |
| `--color-scrollbar-thumb` | `#2a2a36` | 滚动条滑块 |
| `--color-scrollbar-thumb-hover` | `#3a3a48` | 滚动条滑块悬浮 |
| `--color-grid-texture` | `rgba(255,255,255,0.03)` | 网格纹理线 |
| `--color-selection` | `rgba(212, 168, 83, 0.3)` | 文字选中色 |

### 2.3 色彩使用原则

1. **背景层级**：bg-deep < bg-base < bg-card < bg-card-hover，通过明度微差构建深度
2. **文字层级**：primary > secondary > muted，三级对比度清晰
3. **强调色唯一**：金色仅用于品牌标识、交互焦点、数据高亮、CTA，不可用于装饰性填充
4. **透明度系统**：大量使用 white/alpha 而非实色，保证深色模式下的层次感
5. **禁止引入**：紫色、蓝色、绿色等彩色色相，避免破坏暗金调性

---

## 3. Typography Tokens

### 3.1 字体栈

```css
--font-sans: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

- 英文/数字：**Inter**（无衬线，几何感，现代）
- 中文回退：`PingFang SC`（macOS/iOS）→ `Microsoft YaHei`（Windows）
- 系统回退：`-apple-system` → `sans-serif`
- **未引入外部字体文件**，依赖系统/CDN 字体

### 3.2 字号体系

| Token | 字号 | 行高 | 字重 | 字间距 | 用途 |
|---|---|---|---|---|---|
| `--text-display` | 64px / 4rem | 1.1 | 700 | -0.02em | Hero 主标题 |
| `--text-h2` | 32px / 2rem | 1.25 | 600 | 0 | Section 标题 |
| `--text-h3` | 24px / 1.5rem | 1.3 | 600 | 0 | 卡片标题/导航Logo |
| `--text-body` | 16px / 1rem | 1.7 | 400 | 0 | 正文/导航链接/按钮 |
| `--text-body-sm` | 14px | 1.5 | 500/600 | 0 | 小按钮/链接 |
| `--text-caption` | 14px | 1.5 | 400 | 0 | 辅助文字/标签/元数据 |
| `--text-stat` | 28px / 1.75rem | 1.0 | 700 | 0 | 数据指标数字 |
| `--text-logo-en` | 14px | 1.0 | 400 | 0.2em (uppercase) | Logo 英文副标 |

### 3.3 排版规则

1. **中文排版**：正文字号 16px、行高 1.7，保证中文长文可读性
2. **标题负字距**：Display 级使用 -0.02em 紧排，增强视觉密度
3. **英文小字大写**：Logo 英文副标 `PHOTOGRAPHY` 使用 `tracking-[0.2em]` + `uppercase`
4. **数字字体**：stat 级数字使用 700 字重、行高 1.0（紧凑排列）
5. **行高梯度**：标题行高 1.1–1.3（紧凑），正文 1.5–1.7（舒适）
6. **字重使用**：仅使用 400（常规）、500（中小按钮）、600（标题）、700（Display/数字）四档

---

## 4. Spacing Tokens

基于 Tailwind 默认 4px 基数体系：

| Token | 值 | 实际用途 |
|---|---|---|
| `--space-1` | 4px | 图标与文字间距 |
| `--space-2` | 8px | 徽标内距、紧密间距 |
| `--space-3` | 12px | 按钮内距（紧凑）、导航内距（滚动态） |
| `--space-4` | 16px | 卡片内距、标准间距基准 |
| `--space-5` | 20px | 瀑布流列间距、卡片间距 |
| `--space-6` | 24px | 抽屉内距、区块内距 |
| `--space-8` | 32px | 导航菜单间距、桌面左右内距 |
| `--space-10` | 40px | CTA 与统计区上边距、Footer 栏间距 |
| `--space-12` | 48px | Hero 左右列间距（lg） |
| `--space-16` | 64px | Hero 左右列间距最大 |

### Section 间距规范

| 区域 | 垂直 padding |
|---|---|
| Hero | pt-32(128px) pb-20(80px) / md:pt-40(160px) md:pb-24(96px) |
| 精选作品 | py-20(80px) / lg:py-24(96px) |
| 摄影师 | py-20(80px) / lg:py-24(96px) |
| Footer | py-16(64px) |
| Section 间分隔 | border-t + mt-10(40px)（摄影师区顶部） |

### 内容宽度

| Token | 值 | 用途 |
|---|---|---|
| `--max-width` | 1200px | 所有内容区最大宽度 |
| `--content-padding-x` | 24px (px-6) | 移动端左右内边距 |
| `--nav-scrolled-width` | calc(100% - 32px) | 滚动态导航宽度 |

---

## 5. Radius Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--radius-pill` | 999px | 导航栏（滚动态）、标签芯片、圆形按钮、FAB、回到顶部 |
| `--radius-card` | 16px | 大卡片（Hero 图片卡、摄影师卡） |
| `--radius-btn` | 12px | 按钮（CTA、上传、关注） |
| `--radius-img` | 8px | 作品瀑布流卡片、抽屉菜单项 |
| `--radius-avatar` | 999px (full) | 头像圆形 |
| `--radius-drawer-mobile` | 24px | 移动端滚动导航圆角 |

---

## 6. Shadow Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.3)` | 卡片悬浮阴影、作品卡 hover |
| `--shadow-nav` | `0 8px 32px rgba(0,0,0,0.4)` | 滚动态导航阴影 |
| `--shadow-modal` | `0 16px 48px rgba(0,0,0,0.5)` | 模态/抽屉（保留扩展） |
| `--shadow-btn-glow` | `0 4px 20px rgba(212,168,83,0.4)` | 金色按钮发光 |
| `--shadow-fab` | `shadow-lg shadow-accent/30` (≈`0 10px 15px -3px rgba(212,168,83,0.3)`) | FAB 悬浮按钮 |

---

## 7. Z-Index 层级

| Token | 值 | 用途 |
|---|---|---|
| `--z-base` | 0 | 默认 |
| `--z-fab` | 40 | 悬浮操作按钮 |
| `--z-nav` | 50 | 导航栏 |
| `--z-drawer` | 60 | 移动端抽屉 |

---

## 8. 纹理与装饰

| 元素 | 实现 | 参数 |
|---|---|---|
| 径向渐变背景 | `radial-gradient(ellipse at 50% 0%, #12121a, #0a0a0f 70%)` | 顶部光源感 |
| 网格纹理 | `::before` 伪元素双重 linear-gradient | 60px × 60px 网格，线 1px，opacity 0.03 |
| 玻璃态 | `backdrop-filter: blur(16px) saturate(180%)` | 滚动态导航、移动端抽屉 |
| 金色渐变文字 | `background-clip: text` + 三色渐变 | 强调标题词 |
| 图片遮罩 | `bg-gradient-to-t from-black/80 via-black/20 to-transparent` | 图片底部文字可读性 |
