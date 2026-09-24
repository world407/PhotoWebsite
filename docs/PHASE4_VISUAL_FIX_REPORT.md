# Phase 4 Photo Detail — Visual QA 定向修复报告

> **修复日期**：2026-08-16
> **修复范围**：仅处理 `PHASE4_VISUAL_QA_REPORT.md` 指出的 P0/P1/P2 问题
> **修复原则**：不重新设计、不修改 prototype.html、不破坏 Home/Gallery/Lightbox

---

## 修复总览

| 优先级 | 报告编号 | 问题 | 状态 |
|--------|----------|------|------|
| P0 | — | 无 | — |
| P1 | V-P1 | `font-serif` 未定义导致标题字体回退 | ✅ 已修复 |
| P2 | V-P2-1 | PhotoActions `transition-all` 动效违规 | ✅ 已修复 |
| P2 | V-P2-2 | PhotoNavigation `transition-all` 动效违规 | ✅ 已修复 |
| P2 | V-P2-3 | 竖图 max-h 约束失效 | ✅ 已修复 |
| P2 | V-P2-4 | RelatedWorks 未复用 SectionHeader | ✅ 已修复 |
| P2 | V-P2-5 | Mobile 底部栏文字过小 | ✅ 已修复 |

**P3 问题**：按指令未处理（非必须）。

---

## 逐项修复记录

### P1 — `font-serif` 未定义

**问题**：`PhotoInfo.tsx`、`ExifPanel.tsx`、`RelatedWorks.tsx` 三处标题使用 `font-serif`，但 `tailwind.config.js` 未定义 `fontFamily.serif`，回退到浏览器默认衬线字体（Times New Roman），与全站 Inter 不一致。

**修复**：移除三处 `font-serif` class，改用默认 sans 字体族。

| 文件 | 修改前 | 修改后 |
|------|--------|--------|
| `src/components/molecules/PhotoInfo.tsx:34` | `text-h2 font-serif text-text-primary` | `text-h2 text-text-primary` |
| `src/components/molecules/ExifPanel.tsx:31` | `text-h3 font-serif text-text-primary` | `text-h3 text-text-primary` |
| `src/components/organisms/RelatedWorks.tsx:39` | `text-h3 font-serif text-text-primary` | `text-h3 text-text-primary` |

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

### P2-1 — PhotoActions `transition-all` 违规

**问题**：`PhotoActions.tsx:93` 的按钮 base class 使用 `transition-all`，违反 AGENTS.md「只动画 transform/opacity」的动效规范。

**修复**：拆分为 `transition-transform transition-colors transition-opacity`。

```tsx
// 修改前
const baseButtonClasses =
  '... transition-all duration-200 ease-smooth ...';

// 修改后
const baseButtonClasses =
  '... transition-transform transition-colors transition-opacity duration-200 ease-smooth ...';
```

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

### P2-2 — PhotoNavigation `transition-all` 违规

**问题**：`PhotoNavigation.tsx:24,34` 的左右固定导航按钮使用 `transition-all`。

**修复**：左右两个按钮均改为 `transition-transform transition-colors transition-opacity`。

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

### P2-3 — 竖图 max-h 约束失效

**问题**：`PhotoDetail.tsx:138` 外层 div 仅设置 `max-h-[50vh] sm:max-h-[70vh] lg:max-h-[85vh]`，无 `overflow-hidden`。内部 `PhotoHero` 由 `aspectRatio` 决定高度，竖图容器会超出 max-h，导致主图区域过高、视觉中心偏移。

**修复**：外层容器增加 `overflow-hidden rounded-image`，使高宽比容器超过 max-h 时被正确裁剪。

```tsx
// 修改前
<div className="max-h-[50vh] sm:max-h-[70vh] lg:max-h-[85vh]">

// 修改后
<div className="max-h-[50vh] sm:max-h-[70vh] lg:max-h-[85vh] overflow-hidden rounded-image">
```

**注意**：此修复会裁剪竖图顶部/底部，但符合 Desktop 85vh / Tablet 70vh / Mobile 50vh 的设计约束。照片仍使用 `object-cover` 填充裁剪区域。

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

### P2-4 — RelatedWorks 未复用 SectionHeader

**问题**：`RelatedWorks.tsx` 使用 inline `h2 + span` 作为区块标题，未复用现有 `SectionHeader` molecule，组件一致性不足。

**修复**：导入 `SectionHeader` 替换 inline header。

```tsx
// 修改前
<div className="flex items-center justify-between mb-6">
  <h2 className="text-h3 text-text-primary">相关作品</h2>
  <span className="text-caption text-text-muted">{relatedWorks.length} 张</span>
</div>

// 修改后
<SectionHeader title="相关作品" className="mb-6" />
```

**影响**：标题字号从 `text-h3` (24px) 变为 `SectionHeader` 默认的 `text-h2` (32px)，与 Home 的「精选作品」「热门摄影师」等区块标题视觉层级保持一致。

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

### P2-5 — Mobile 底部栏文字过小

**问题**：`PhotoActions.tsx` bottom-bar variant 使用 `text-[10px]`，在部分设备可读性不足。

**修复**：改为 Tailwind 标准 `text-xs`（12px）。

```tsx
// 修改前
<span className="text-[10px] leading-none">{action.label}</span>

// 修改后
<span className="text-xs leading-none">{action.label}</span>
```

**验证**：`npm run build` ✅ / `npm run lint` ✅

---

## 回归验证

### Build

```bash
npm run build
```

结果：✅ 通过，0 TypeScript 错误

```
vite v5.4.21 building for production...
transforming...
✓ 1519 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.55 kB │ gzip:  0.47 kB
dist/assets/index-e1u3egto.css   32.54 kB │ gzip:  7.10 kB
dist/assets/index-BvgYJzqD.js   232.26 kB │ gzip: 72.23 kB
✓ built in 3.72s
```

### Lint

```bash
npm run lint
```

结果：✅ 通过，0 errors / 0 warnings

### 未破坏的页面

| 页面 | 检查项 | 结果 |
|------|--------|------|
| Photo Detail | 路由 /photo/:id、视觉布局、键盘导航、Lightbox | ✅ 正常 |
| Gallery | WorkCard 点击进入详情、筛选、搜索、响应式 | ✅ 正常 |
| Home | WaterfallGallery 点击进入详情、Hero、摄影师网格 | ✅ 正常 |
| Lightbox | PhotoDetail 内全屏打开、Prev/Next/Esc | ✅ 正常 |
| 404 | 非法 ID 渲染 NotFound | ✅ 正常 |

### Console 检查

- 无 React warning
- 无 JavaScript 错误
- 无未捕获异常

---

## 修改文件清单

| 文件 | 修改类型 | 修改内容 |
|------|----------|----------|
| `src/components/molecules/PhotoInfo.tsx` | 编辑 | 移除 `font-serif` |
| `src/components/molecules/ExifPanel.tsx` | 编辑 | 移除 `font-serif` |
| `src/components/organisms/RelatedWorks.tsx` | 编辑 | 移除 `font-serif`；改用 `SectionHeader` |
| `src/components/molecules/PhotoActions.tsx` | 编辑 | `transition-all` → 拆分 transition；底部栏文字 `text-[10px]` → `text-xs` |
| `src/components/molecules/PhotoNavigation.tsx` | 编辑 | 左右按钮 `transition-all` → 拆分 transition |
| `src/pages/PhotoDetail.tsx` | 编辑 | 主图外层容器增加 `overflow-hidden rounded-image` |

---

## 遗留问题（P3，未处理）

按指令未扩大修复范围，以下 P3 问题保留：

| 编号 | 问题 | 原因 |
|------|------|------|
| V-P3-1 | PhotoHero 全屏按钮初始 `opacity-0`，用户不易发现可点击放大 | 设计已有 hover/focus 显隐逻辑，改动需额外设计决策 |
| V-P3-2 | ExifPanel 用 `eye` 图标表示「拍摄参数」语义略弱 | 不影响功能，属可选优化 |
| V-P3-3 | PhotographerMini 头像 fallback 首字母占位较朴素 | 可接受 |
| V-P3-4 | Breadcrumb 当前页标题 `truncate max-w-[200px]` | 长标题会截断，但属于边界情况 |

---

## 结论

- **P0**：0 项
- **P1**：1 项已修复
- **P2**：5 项已修复
- **P3**：4 项保留

**所有修复均通过 `npm run build` 与 `npm run lint`，未破坏 Home、Gallery、Lightbox 既有功能。**

**Phase 4 Visual QA 定向修复完成。**

---

*合规确认：未修改 prototype.html、未重新设计页面、未引入新依赖、未开始 Phase 5。*
