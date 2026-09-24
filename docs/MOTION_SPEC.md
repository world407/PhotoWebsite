# 动画与动效规格

> Phase 0 视觉逆向分析产出 | 基于 prototype.html 动画系统提取

---

## 1. 动画设计哲学

**核心原则**：
1. **内容优先**：动效服务于内容引导，不做无意义的装饰动画
2. **柔和克制**：所有动效时长控制在 200-600ms 之间，不使用弹跳/弹性等夸张效果
3. **层次分明**：使用 stagger（交错延迟）构建视觉流，引导用户视线
4. **性能意识**：仅动画 `opacity` 和 `transform` 属性，保证 60fps
5. **尊重用户**：通过 `prefers-reduced-motion` 关闭所有非必要动画

---

## 2. Motion Tokens

### 2.1 时长（Duration）

| Token | 值 | 用途 |
|---|---|---|
| `--duration-fast` | 200ms (0.2s) | 按钮 hover/active、颜色过渡、小图标变化 |
| `--duration-base` | 250ms (0.25s) | 卡片 hover、标签切换、关注按钮 |
| `--duration-normal` | 300ms (0.3s) | 导航形态切换、下划线展开、回到顶部显隐、FAB 旋转 |
| `--duration-slow` | 350ms (0.35s) | 作品 overlay 滑入 |
| `--duration-slower` | 400ms (0.4s) | 图片 scale hover、移动端抽屉滑入 |
| `--duration-entrance` | 600ms (0.6s) | 滚动入场动画（fade + slide up） |
| `--duration-count` | 1800ms (1.8s) | 数字计数动画 |
| `--duration-shimmer` | 1500ms (1.5s) | 骨架屏 shimmer（循环） |
| `--duration-float` | 3000ms (3s) | Hero 卡片浮动（循环） |

### 2.2 缓动函数（Easing）

| Token | 值 | 贝塞尔曲线 | 用途 |
|---|---|---|---|
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 标准 Material 缓动 | 导航切换、下划线、overlay、抽屉 |
| `--ease-default` | `ease` | 等同于 cubic-bezier(0.25, 0.1, 0.25, 1) | 卡片 hover、入场动画 |
| `--ease-in-out` | `ease-in-out` | 对称缓动 | 浮动动画、shimmer |
| `--ease-out-cubic` | JS: `1 - Math.pow(1 - t, 3)` | cubic ease-out | 数字计数动画 |

**推荐统一缓动**：主要交互统一使用 `cubic-bezier(0.4, 0, 0.2, 1)`（Material Standard），与 prototype 中高频使用一致。

### 2.3 延迟（Delay）

| Token | 值 | 用途 |
|---|---|---|
| `--delay-stagger-base` | 80ms | IntersectionObserver 入场交错 |
| `--delay-stagger-work` | 60ms | 瀑布流卡片渲染交错 |
| `--delay-stagger-photographer` | 100ms | 摄影师卡片渲染交错 |
| `--delay-stagger-drawer` | 50ms | 抽屉菜单项交错（0.1s起，每项+0.05s） |
| `--delay-hero-right` | 200ms | Hero 右侧相对于左侧的入场延迟 |
| `--delay-works-filter` | 100ms | 标签栏相对于标题的延迟 |
| `--delay-works-gallery` | 200ms | 瀑布流相对于标签栏的延迟 |
| `--delay-float-card` | 500ms | Hero 后卡片浮动延迟 |

---

## 3. 动画分类详解

### 3.1 滚动入场动画（Scroll Reveal）

**选择器**：`.animate-on-scroll`
**触发**：IntersectionObserver（threshold: 0.1, rootMargin: 0px 0px -50px 0px）

**动画属性**：
```css
/* 初始态 */
opacity: 0;
transform: translateY(30px);

/* 激活态 (.visible) */
opacity: 1;
transform: translateY(0);

/* 过渡 */
transition: opacity 0.6s ease, transform 0.6s ease;
```

**交错策略**：Observer 回调中使用 `setTimeout(() => add visible, i * 80)` 对同时进入视口的元素做 80ms 交错。

**适用元素**：
- Hero 左右两栏
- Section Header（标题区）
- 标签筛选栏（delay 0.1s inline style）
- 瀑布流容器（delay 0.2s inline style）
- 摄影师卡片（动态 delay i*100ms）
- 动态渲染的作品卡片（动态 delay i*60ms）

**注意**：Observer 在添加 visible 类后 `unobserve`，动画只执行一次（不重复触发）。

### 3.2 导航双形态过渡

**选择器**：`.nav-header`
**触发**：scrollY > 80px（rAF 节流）
**过渡属性**：`all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**变化的属性**：
- position: static → fixed
- top: 0 → 12px
- left/right: 0 → 50% + translateX(-50%)
- max-width: none → 1200px
- width: 100% → calc(100% - 32px)
- background: transparent → rgba(15,15,22,0.75)
- backdrop-filter: none → blur(16px) saturate(180%)
- border-radius: 0 → 999px
- padding: 24px 48px → 12px 28px
- box-shadow: none → shadow-nav
- border: none → 1px solid rgba(255,255,255,0.06)

### 3.3 导航链接下划线动画

**选择器**：`.nav-link::after`
**触发**：hover / .active 类
**过渡**：width 0.3s cubic-bezier(0.4,0,0.2,1)
**动画方向**：width 0 → 100%（从左向右展开）
**颜色**：bg-accent (#d4a853)
**尺寸**：height 2px，bottom -4px

### 3.4 移动端抽屉动画

**选择器**：`.mobile-drawer`
**触发**：添加/移除 `.open` 类
**主容器动画**：
```css
/* 关闭态 */
transform: translateX(100%);
/* 打开态 */
transform: translateX(0);
/* 过渡 */
transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

**菜单项交错入场**：
```css
/* 初始态 */
opacity: 0;
transform: translateX(20px);
/* 打开态 */
opacity: 1;
transform: translateX(0);
/* 过渡 */
transition: opacity 0.4s ease, transform 0.4s ease;
/* 交错 */
nth-child(1) { transition-delay: 0.1s; }
nth-child(2) { transition-delay: 0.15s; }
/* ...每项 +0.05s，至 0.4s */
```

**方向**：从右侧滑入（X 轴正方向→0），菜单项同样从右侧轻微偏移入场。

### 3.5 数字计数动画

**选择器**：`[data-count]` 元素
**触发**：IntersectionObserver（threshold: 0.5）
**时长**：1800ms
**缓动**：JS cubic ease-out `1 - (1-t)^3`
**动画方式**：requestAnimationFrame 逐帧更新 textContent
**格式化**：`value.toLocaleString()` 添加千分位分隔符
**结束符**：数字 ≥ 1000 时末尾添加 `+` 号

### 3.6 Hero 卡片浮动动画

**选择器**：`.float-card` / `.float-card-delay`
**动画**：`float` keyframe 3s ease-in-out infinite
**关键帧**：
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```
**延迟**：`.float-card-delay` 延迟 0.5s，形成两张卡片的错落浮动。
**注意**：浮动幅度仅 4px，极其克制。

### 3.7 卡片悬浮效果

**通用卡片**（`.card-hover`）：
```css
transition: all 0.25s ease;
hover: translateY(-4px) + shadow-card
```

**作品卡片**（`.work-card`）：
```css
transition: all 0.25s ease;
hover:
  1. 卡片本身 translateY(-4px)
  2. 内部图片 scale(1.05)（transition: transform 0.4s ease）
  3. overlay translateY(0)（从底部滑入，0.35s smooth）
```

**摄影师卡片**（`.photographer-card`）：
```css
transition: all 0.25s ease;
hover:
  1. translateY(-4px)
  2. 背景 bg-bg-card-hover
  3. .avatar-ring border-color → accent
```

**统一上浮距离**：所有卡片 hover 上浮均为 `-4px`，保持一致的微交互语言。

### 3.8 图片缩放效果

**选择器**：`.work-card img`
**初始态**：scale(1)
**hover 态**：scale(1.05)（5% 放大）
**过渡**：transform 0.4s ease
**裁切**：父容器 overflow: hidden 保证缩放不溢出

### 3.9 Overlay 滑入效果

**选择器**：`.work-overlay`
**初始态**：transform: translateY(100%)（完全隐藏在底部外）
**hover 态**：transform: translateY(0)（完全显示）
**过渡**：transform 0.35s cubic-bezier(0.4,0,0.2,1)
**遮罩背景**：gradient-to-t from-black/90 via-black/50 to-transparent

### 3.10 按钮交互动画

**主按钮**（`.btn-accent`）：
```css
transition: all 0.2s ease;
hover:
  background → accent-hover
  transform: scale(1.02)
  box-shadow: 0 4px 20px rgba(212,168,83,0.4)（金色发光）
active:
  transform: scale(0.98)（按压反馈）
```

**次按钮**（`.btn-outline`）：
```css
transition: all 0.2s ease;
hover:
  border-color → accent
  text-color → accent
  transform: scale(1.02)
```

**关注按钮**（`.btn-follow`）：
```css
transition: all 0.25s ease;
hover: border-color → accent, text-color → accent
.followed 态: bg-accent + text-dark + border-accent（无缩放）
```

**FAB 旋转**（`.fab-rotate`）：
```css
hover: transform: rotate(45deg)（加号变叉号）
transition: transform 0.3s ease
```

### 3.11 骨架屏 Shimmer 动画

**选择器**：`.img-placeholder`
**动画**：`shimmer` keyframe 1.5s infinite linear
**关键帧**：
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
**背景**：linear-gradient(135deg, #1a1a24 25%, #22222e 50%, #1a1a24 75%)
**背景尺寸**：200% 100%

### 3.12 回到顶部显隐

**选择器**：`.back-to-top`
**触发**：scrollY > 500px
**初始态**：opacity: 0; pointer-events: none;
**显示态**：opacity: 1; pointer-events: auto;
**过渡**：opacity 0.3s ease

### 3.13 标签选中切换

**选择器**：`.tag-chip`
**过渡**：all 0.25s ease
**切换逻辑**（JS）：
1. 所有 chip 移除 active 类，添加 text-secondary，移除 text-primary
2. 当前 chip 添加 active 类，移除 text-secondary，添加 text-primary
3. 调用 renderWorks() 重新渲染瀑布流

### 3.14 脉冲动画（公告条）

**选择器**：公告条内金色圆点
**动画**：Tailwind 内置 `animate-pulse`
**效果**：opacity 周期性变化（1 → 0.5 → 1），2s cubic-bezier(0.4,0,0.6,1) infinite

---

## 4. 动画性能规范

### 4.1 仅动画高性能属性

✅ **推荐动画的属性**（GPU 加速）：
- `opacity`
- `transform: translate()`
- `transform: scale()`
- `transform: rotate()`

❌ **避免动画的属性**（触发 reflow/repaint）：
- `width` / `height` / `padding` / `margin`（导航切换是特例，因为有 rAF 节流且非连续动画）
- `top` / `left` / `right` / `bottom`
- `background-color`（颜色变化成本较低，可接受）
- `border-color`（可接受）

### 4.2 现有性能问题

| 问题 | 位置 | 建议 |
|---|---|---|
| `transition: all` | 多处使用 | 明确指定动画属性，避免意外属性动画消耗 |
| 导航动画 `all` 属性 | `.nav-header` | 明确列出 transform, background, box-shadow 等 |
| 卡片动画 `all` | `.card-hover` | 改为 transform, box-shadow |

### 4.3 滚动性能

- 导航滚动监听使用 `requestAnimationFrame` 节流（ticking 标志），正确
- IntersectionObserver 替代 scroll 监听入场动画，正确
- 回到顶部监听无节流（简单类切换，影响小）

---

## 5. 无障碍动画

### 5.1 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

已实现全局动画时长压缩，符合无障碍标准。

### 5.2 建议增强

1. 浮动动画（float）在 reduced-motion 下应完全停止（而非压缩到 0.01ms 后仍循环）
2. 抽屉 stagger 动画在 reduced-motion 下应同时显示
3. shimmer 动画在 reduced-motion 下应显示静态占位色

---

## 6. 动画时序总览图

```
页面加载
  ├─ 导航初始态（透明）
  ├─ Hero 公告条 pulse 开始（循环）
  ├─ Hero 卡片 float 开始（3s 循环，+0.5s 延迟）
  │
  ├─ IntersectionObserver 触发 Hero 入场
  │   ├─ 左侧文字: opacity+translateY 0.6s ease
  │   └─ 右侧视觉: 同上 +0.2s delay
  │       └─ 数字计数动画: 1.8s ease-out（进入时触发）
  │
  ├─ 滚动 > 80px
  │   └─ 导航形态过渡 0.3s smooth
  │
  ├─ 滚动到 Works 区
  │   ├─ Section Header: 入场 0.6s
  │   ├─ 标签栏: 入场 0.6s +0.1s
  │   └─ 瀑布流: 入场 0.6s +0.2s
  │       └─ 每张卡片 stagger +60ms
  │
  ├─ 滚动 > 500px
  │   └─ 回到顶部 opacity 0.3s
  │
  ├─ Hover 交互
  │   ├─ 按钮: scale+glow/color 0.2s
  │   ├─ 卡片: translateY(-4px) 0.25s
  │   ├─ 作品图: scale(1.05) 0.4s
  │   └─ Overlay: slide-up 0.35s smooth
  │
  └─ 点击交互
      ├─ 标签切换: color 0.25s → 内容重新渲染
      ├─ 抽屉打开: slide-in 0.4s smooth + stagger 0.05s
      └─ 关注切换: color/bg 0.25s
```
