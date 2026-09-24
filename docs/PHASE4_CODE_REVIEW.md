# PHASE 4 CODE REVIEW — 生产代码审查报告

## 审查信息

- 审查人：Senior Frontend Code Reviewer
- 审查范围：Phase 4 Photo Detail 全部新增代码 + 被修改的 Phase 0-3 代码
- 审查方式：逐文件实际代码检查（非仅阅读开发报告）
- 构建验证：`npm run build` ✅ 通过（0 TS 错误）
- Lint 验证：`npm run lint` ✅ 通过（0 errors / 0 warnings）
- 审查日期：2026-08-16

---

## 一、30 项审计清单结论

| # | 审计项 | 结论 | 说明 |
|---|--------|------|------|
| 1 | useParams | ✅ | `useParams<{id:string}>()` 类型正确 |
| 2 | invalid ID | ✅ | `parseInt + isNaN + find` 三重校验，渲染 NotFound |
| 3 | Previous / Next | ✅ | 基于全量 works 计算（A1-α 已确认） |
| 4 | 首尾边界 | ✅ | `currentIndex<=0` / `>=length-1` 返回 undefined，不越界 |
| 5 | Keyboard ←→ | ⚠️ | 功能正确，但全局监听无焦点排除（见 P2-6） |
| 6 | ESC | ✅ | Lightbox 打开时隔离正确，关闭后返回 Gallery |
| 7 | F | ⚠️ | 详情页正确；但 404 页也会触发（见 P3-4） |
| 8 | Swipe | ⚠️ | 功能正确，preventDefault 阈值过小（见 P2-5） |
| 9 | Event cleanup | ⚠️ | keydown/touch 已 cleanup；setTimeout 未清理（见 P3-2） |
| 10 | Related Works | ✅ | 同 tag + 同 author + 其他，取 4 张 |
| 11 | 当前作品排除 | ✅ | `w.id !== currentWork.id` 三处均排除 |
| 12 | Related 排序 | ⚠️ | 同 tag 内部无相关度排序（数据顺序），P3 |
| 13 | Clipboard | ✅ | navigator.clipboard + execCommand 双 fallback |
| 14 | Download | ✅ | fetch→blob→createObjectURL，失败降级 |
| 15 | Image preload | ⚠️ | 功能在，但 Image 无引用可被 GC（P3-3） |
| 16 | srcset | ⚠️ | 详情页仅 2 档（600w/1600w），P3 |
| 17 | sizes | ✅ | 分端 sizes 正确 |
| 18 | width / height | ✅ | PhotoHero 已设置，防 CLS |
| 19 | CLS | ⚠️ | PhotoHero aspect-ratio 已防，但 max-h 约束失效（P1-2） |
| 20 | lazy | ✅ | Related/摄影师头像 lazy |
| 21 | eager | ✅ | 主图 eager |
| 22 | Like/Favorite state | ⚠️ | 跨作品切换不重置（P2-2） |
| 23 | Router navigation | ⚠️ | goToWork 正常；滚动恢复逻辑错误（P1-1） |
| 24 | Gallery scroll restoration | ❌ | **实现方向错误（P1-1）** |
| 25 | Browser Back/Forward | ⚠️ | 路由可回退；scroll 恢复依赖 sessionStorage，与浏览器历史栈不同步 |
| 26 | TypeScript any | ✅ | 全项目 0 处 |
| 27 | Effect dependency | ✅ | lint exhaustive-deps 通过 |
| 28 | Unnecessary rerender | ⚠️ | Home handleWorkClick 无 useCallback（P3-6） |
| 29 | Mobile overflow | ✅ | 底部栏 + pb-safe；未发现横向溢出 |
| 30 | Accessibility | ⚠️ | 按钮均带 aria-label；WorkCard div 无键盘可达（P2-4） |

---

## 二、问题分级清单

### P0（阻断级）— 无

构建、Lint、运行均无阻断性错误。

---

### P1（必须修复，共 2 项）

#### P1-1 滚动位置恢复逻辑方向错误

- **文件**：`src/pages/PhotoDetail.tsx:63-69`、`src/pages/Gallery.tsx:62-65`、`src/pages/Home.tsx:10-13`
- **问题**：滚动恢复被错误地实现为「进入详情页时恢复」，而正确的时机是「返回 Gallery/Home 时恢复」。
- **原因**：Gallery/Home 的 `handleWorkClick` 调用 `saveScrollPosition()` 保存 scrollY（如 1500px），随后 navigate 到 `/photo/:id`；PhotoDetail 在 mount 时执行 `restoreScrollPosition()` 读取该值并 `window.scrollTo(1500)`。用户从列表点击进入详情页时，**页面会直接跳转到 1500px 处**，而非从顶部开始浏览。
- **风险**：核心 UX 缺陷——每次从列表进入详情页都会停留在页面中部，主图（顶部）不可见，需要用户手动滚回顶部。属于高频路径的明显功能错误。
- **建议**：
  1. PhotoDetail mount 时**不**执行 restore（或直接清除存储值）；详情页始终从顶部开始。
  2. 将恢复逻辑移到 Gallery/Home 的 mount effect：`useEffect(() => { restoreScrollPosition(); }, [])`。
  3. 可选更优方案：用 `sessionStorage` 记录「来源路径」，仅在确实从详情返回时恢复。
- **是否必须修复**：✅ 必须

#### P1-2 PhotoHero 最大高度约束（max-h 85vh/70vh/50vh）未真正生效

- **文件**：`src/pages/PhotoDetail.tsx:138`、`src/components/organisms/PhotoHero.tsx:21-23`
- **问题**：外层 `<div className="max-h-[50vh] sm:max-h-[70vh] lg:max-h-[85vh]">` 包裹了固定 `aspect-ratio` 的 PhotoHero section。`max-height` 只约束容器自身，**子元素（section/img）溢出时不会被裁剪**（外层无 `overflow-hidden`）。竖图（如 work id=1，ratio 0.75，容器宽 1200px）实际高度 1600px，远超 85vh（约 800px），图片完整撑出视口。
- **原因**：aspect-ratio 固定宽度→高度，max-h 无法压缩；`overflow-hidden` 缺失导致溢出可见。
- **风险**：主图高度失控，破坏「照片是主角但受限 85vh」的设计约束；不同比例图片在页面中的占位高度差异巨大，影响浏览节奏与 LCP 表现。
- **建议**：
  1. 在 PhotoHero 内部实现约束：`section` 加 `max-h-[85vh]` + `overflow-hidden`，图片 `object-cover`（当前设计）或 `object-contain`（PHOTO_UX_SPEC 建议，需与原型确认）。
  2. 或外层容器加 `overflow-hidden` + `max-h`，使图片按比例裁剪进 85vh。
  3. 注意同步 `width/height` 与 aspect-ratio 的一致性。
- **是否必须修复**：✅ 必须

---

### P2（建议修复，共 6 项）

#### P2-1 PhotoHero loaded/error 状态跨作品切换未重置

- **文件**：`src/components/organisms/PhotoHero.tsx:12-13`
- **问题**：通过 ←→/Swipe 切换作品时（React Router 复用同一 `PhotoDetail` 组件实例），`PhotoHero` 不重新挂载，`loaded`/`error` 状态保留。新图加载期间 `loaded=true` 导致无占位反馈（旧图消失、新图未到→空白），且某张图失败后 `error=true` 会错误地延续到下一张。
- **原因**：组件实例复用 + 状态未随 `work.id` 重置。
- **风险**：切换导航时的视觉反馈缺失；错误状态污染。
- **建议**：在 `PhotoHero` 中 `useEffect(() => { setLoaded(false); setError(false); }, [work.id])`；或调用处传 `key={currentWork.id}` 强制重建（更简单可靠）。
- **是否必须修复**：✅ 建议（高频路径视觉问题）

#### P2-2 PhotoActions 点赞/收藏状态跨作品共享

- **文件**：`src/components/molecules/PhotoActions.tsx:30-31`
- **问题**：`isLiked`/`isFavorited` 状态与 `work.id` 无关联。点赞作品 A 后切换到作品 B，B 仍显示「已赞」。
- **原因**：状态提升在组件内且组件实例复用。
- **风险**：用户状态串扰，数据正确性受损。
- **建议**：状态随 `work.id` 重置（useEffect 依赖 work.id），或状态提升到 PhotoDetail 并以 `{ [workId]: boolean }` 存储，或后续接后端时以 workId 为键。
- **是否必须修复**：✅ 建议

#### P2-3 `transition-all` 违反 AGENTS.md 动效规则

- **文件**：`src/components/molecules/PhotoActions.tsx:93`、`src/components/molecules/PhotoNavigation.tsx:24,34`
- **问题**：使用 `transition-all duration-200`，而 AGENTS.md 明确规定「禁止 transition: all」「动画只用 transform 和 opacity（保证 60fps）」。
- **原因**：开发时未遵守既有动效规范。
- **风险**：transition-all 会动画所有可变属性（含 layout 属性），可能造成性能抖动；违反项目规范。
- **建议**：改为 `transition-transform` / `transition-opacity` / `transition-colors`（颜色变化为合成器友好属性，AGENTS.md 原意是排除 layout 动画）。
- **是否必须修复**：✅ 建议（规范合规）

#### P2-4 WorkCard 卡片为 div + onClick，无键盘可访问性

- **文件**：`src/components/molecules/WorkCard.tsx:37-41`（Phase 3 遗留，Phase 4 复用放大）
- **问题**：整个卡片是 `<div onClick>`，无法 Tab 聚焦、无 `role="button"`、无 Enter/Space 键盘触发。Phase 4 后 WorkCard 成为 Gallery/Home→Detail 的**唯一入口**，纯键盘用户无法进入任何照片详情页。
- **原因**：Phase 3 遗留；Phase 4 未在复用时补足。
- **风险**：WCAG 2.1 2.1.1 键盘可操作性违规；屏幕阅读器用户无法使用核心导航。
- **建议**：卡片加 `role="button"` + `tabIndex={0}` + `onKeyDown`（Enter/Space），或内部包一层 `<Link>`（更优：语义 + 路由）。属 Phase 4 直接相关的既有缺陷，D5 范围内可修。
- **是否必须修复**：✅ 建议（a11y 合规）

#### P2-5 useSwipe 全页监听且 preventDefault 阈值过小

- **文件**：`src/lib/hooks/useSwipe.ts:46`
- **问题**：① 监听绑定在整个 `<main>`（含信息区、EXIF 区），用户在阅读区域水平滑动会触发切换照片；② `Math.abs(dx) > 10` 即 `preventDefault()`，阈值过小，容易与 iOS Safari 边缘滑动返回手势冲突，且轻微横向位移即中断垂直滚动。
- **原因**：实现时未限定触发区域与更稳健的判定。
- **风险**：移动端误触切换、浏览器手势冲突。
- **建议**：仅在主图区域启用 swipe（ref 绑到 PhotoHero）；preventDefault 阈值提升至 30-50px 且要求 `dx > 1.5 * dy`；或先检测 `touch-action` 支持。
- **是否必须修复**：✅ 建议

#### P2-6 键盘 ←→/F 全局触发无焦点排除

- **文件**：`src/pages/PhotoDetail.tsx:75-96`
- **问题**：`window` 级 keydown 监听，当焦点在按钮/输入框上时按 ←→ 仍会切换作品。当前页面无文本输入框，风险有限，但底部操作栏按钮聚焦时按 ← 会意外跳页。
- **原因**：未检查 `e.target` 是否为可交互元素。
- **风险**：误操作导航；与未来的表单控件冲突。
- **建议**：在 handler 开头排除 `e.target instanceof HTMLElement && (tagName 为 INPUT/TEXTAREA/SELECT/BUTTON)` 时 return；或改为在 `<main>` 上监听（focus 不在 main 时天然不触发）。
- **是否必须修复**：✅ 建议

---

### P3（可选优化，共 7 项）

| # | 文件:行号 | 问题 | 建议 | 必须修复 |
|---|-----------|------|------|----------|
| P3-1 | `src/lib/hooks/useScrollRestore.ts` 全文件 | `useScrollRestore` hook 被导出但从未使用（PhotoDetail 直接调用 save/restore 函数），死代码 | 删除 hook 或让 PhotoDetail 使用它 | 否 |
| P3-2 | `PhotoActions.tsx:38,63,66,83,85` | 多个 `setTimeout` 在组件卸载后仍可能执行 `setState`（React 18 不警告但属潜在泄漏）；`URL.revokeObjectURL` 的 setTimeout 亦未清理 | 用 ref 保存 timer id，cleanup 时 clearTimeout | 否 |
| P3-3 | `PhotoDetail.tsx:106-110` | `new Image()` 预加载无引用，极端情况下可被 GC 中断 | 用数组持有引用（或依赖浏览器已缓存行为，可接受） | 否 |
| P3-4 | `PhotoDetail.tsx:89-92` | 404 页（currentWork undefined）时 F 键仍会 `setLightboxOpen(true)`（Lightbox 内部 return null，无害但语义混乱） | 在 handler 开头 `if (!currentWork) return` | 否 |
| P3-5 | `PhotoNavigation.tsx:13,24` | `isMobile`（JS，<640px return null）与 CSS `hidden md:flex`（<768px 隐藏）判定不一致：640-767px 区间箭头被 CSS 隐藏，与 spec「Tablet 显示缩小箭头」有出入 | 统一为 CSS 断点或 JS 断点（建议 sm+ 显示） | 否 |
| P3-6 | `Home.tsx:10-13` | `handleWorkClick` 每次渲染重建，传入 WaterfallGallery→WorkCard，轻微无效重渲染 | 用 useCallback | 否 |
| P3-7 | `PhotoInfo.tsx:14-29` | `formatDate` 每次渲染执行（含 try/catch），无 useMemo | work.createdAt 稳定，可缓存 | 否 |
| P3-8 | `PhotoHero.tsx:18` | srcset 仅 2 档（600w/1600w），缺 400w/800w/1200w，与 WorkCard 的 4 档不一致 | 对齐 4 档或按 LCP 资源精简为 1-2 档后统一 | 否 |

---

## 三、30 项清单之外的补充发现

1. **PhotoInfo 展开状态跨作品保留**（P3）：`expanded` 在切换作品后保留，切到短描述作品时「展开/收起」按钮仍出现（已无 3 行截断需求）。建议 `useEffect` 依赖 `work.id` 重置。
2. **Related Works 同 tag 内部排序**（P3）：无相关度排序（likes/views），返回数据顺序。可接受，但可加 `sort((a,b)=>b.likes-a.likes)` 提升质量。
3. **Date 显示格式不一致**：PhotoDetail 用 `toLocaleDateString('zh-CN')`（如「2026年3月15日」），Lightbox 底部直接显示原始字符串（`2026-03-15`）。视觉语言不统一，建议统一格式化。
4. **Download 扩展名**：`link.download = '${title}.jpg'`，但 fullUrl 可能是 WebP/其他格式（Unsplash auto=format），文件名后缀与真实格式可能不符。建议从 Content-Type 推断。
5. **Mobile 底部栏 `pb-safe` 与 `h-16` 并存**：safe-area 通过 padding 增加高度，总高度会超过 64px（h-16 + safe-area）。符合「考虑 safe-area」要求，但严格 64px 约束在 iPhone 上会变 64+safe-area，需确认是否符合预期。

---

## 四、结论

### 整体评价

代码质量总体良好：TypeScript Strict 零 `any`、Hooks 依赖正确、事件监听均 cleanup、Clipboard/Download 双 fallback 完善、构建与 Lint 全部通过、Atomic Design 分层清晰、未破坏 Phase 0-3。

### 但存在 2 项 P1 级功能缺陷，建议修复后再进入下一阶段

1. **滚动恢复方向错误**（P1-1）——进入详情页时错误跳到列表滚动位置，属高频路径明显缺陷。
2. **主图 max-h 约束失效**（P1-2）——竖图超出视口，违反 UX 设计约束。

其余 P2 问题（状态串扰、transition-all 规范违例、a11y、swipe 误触）建议在后续迭代中安排修复；P3 项可择机处理。

**审查过程中未修改任何代码。**
