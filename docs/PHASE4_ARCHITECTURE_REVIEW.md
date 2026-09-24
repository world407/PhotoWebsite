# PHASE 4 ARCHITECTURE REVIEW — 项目级架构复盘

## 复盘信息

- 角色：项目技术负责人（Project Tech Lead）
- 复盘对象：影·迹 PHOTOGRAPHY 在 Phase 4 Photo Detail 合入后的整体架构健康度
- 复盘依据：`WORKBUDDY_TAKEOVER.md` / `PHASE4_VISUAL_UX_SPEC.md` / `PHASE4_DEVELOPMENT_REPORT.md` / `PHASE4_CODE_REVIEW.md` / 当前源码 / `prototype.html`
- 复盘日期：2026-08-16
- 复盘方式：只读分析，未修改任何代码

---

## 一、14 项架构健康度检查

### 1. Phase 0（视觉分析）是否保持 ✅

- `prototype.html` 修改时间 **8 月 15 日 12:02**（早于 Phase 4 开发的 8 月 16 日），文件 35402 字节 / 833 行，关键设计 token（`#d4a853` / `#0a0a0f` / `var(--color-accent)`）19 处匹配。
- Tailwind 设计令牌（colors / fontSize / borderRadius / boxShadow / timingFunction）未变更。
- `globals.css` 仅追加 `.line-clamp-3` / `.pb-safe` / `.animate-page-enter` 三个工具类与 `page-enter` keyframes，未触动既有 token 与组件样式。
- **结论**：Phase 0 视觉真实来源完整保留。

### 2. Phase 1（基础架构）是否保持 ✅

- Atomic Design 目录结构扩展但未破坏：atoms 9→10、molecules 8→13、organisms 8→10、hooks 1→3。
- 类型系统扩展（`IconName` 新增 4 个图标）而非重写，`Work` / `ExifData` / `Photographer` 核心类型未动。
- TypeScript Strict 保持，全项目 `any` 仍为 0 处。
- 路由表 `App.tsx` 零改动（`/photo/:id` 在 Phase 1 已配置）。
- **结论**：基础架构稳固，扩展方式符合既有约定。

### 3. Home 是否保持 ✅

- `Home.tsx` 仅新增 `useNavigate` + `handleWorkClick`（4 行逻辑），传 `onWorkClick` 给 `WaterfallGallery`。
- HeroSection / PhotographerGrid 未触碰。
- 视觉布局、组件结构、动效完全保持。
- **结论**：Home 封档状态未受影响。

### 4. Gallery 是否保持 ⚠️（轻微）

- `Gallery.tsx` 改动：WorkCard `onClick` 从「打开 Lightbox」改为「导航到详情页」；移除 Gallery 内的 `<Lightbox>` 使用与相关 state。
- 视觉布局、筛选、搜索、排序、布局切换全部保持。
- **影响**：Gallery 的 Lightbox 入口被移除——这是 Phase 4 设计决策 D1 的直接结果，**非破坏**，但 Lightbox 在 Gallery 场景的代码路径从此闲置（Lightbox 组件本身仍被 PhotoDetail 复用，未死代码）。
- **结论**：Gallery 视觉与功能封档保持，交互入口按设计变更。可接受。

### 5. prototype.html 是否未修改 ✅

- 见第 1 项，文件时间戳与内容均未变动。**Source of Truth 完好。**

### 6. Atomic Design 是否仍然合理 ✅

- 新增组件分层全部正确：
  - `DetailBreadcrumb` → atom（单一职责，无组合）
  - `PhotoInfo` / `PhotoActions` / `ExifPanel` / `PhotographerMini` / `PhotoNavigation` → molecule（原子组合）
  - `PhotoHero` / `RelatedWorks` → organism（含状态、复杂交互）
- 无跨层错放、无「为塞组件而造层」。
- 复用既有 atom（Button / IconButton / Icon / TagChip / ShimmerPlaceholder）符合「优先复用」原则。
- **结论**：分层健康，扩展有机。

### 7. PhotoDetail 是否过度复杂 ⚠️（边界可接受）

- `PhotoDetail.tsx` 209 行，承担：路由参数解析、404、键盘、swipe、预加载、Lightbox 状态、布局组装、Mobile 底部栏。
- 复杂度集中在「协调」职责，符合 page 组件定位，**未越界做组件内部逻辑**。
- 但已接近单文件可维护上限：键盘/swipe/scroll 三套全局副作用共存，未来若再加功能（如评论、EXIF 编辑）需拆分。
- **结论**：当前不过度复杂，但已处于「下次扩展前应拆分」的临界点。

### 8. Lightbox 与 PhotoDetail 是否重复 ⚠️（存在重复）

- **EXIF 渲染重复**：`Lightbox.tsx:256-277` 与 `ExifPanel.tsx` 各自独立实现 EXIF 字段渲染，且 Lightbox 版本**漏 `film` 字段**（Phase 4 接管报告已记录的 P3 遗留）。
- **图片加载/错误/占位逻辑重复**：`Lightbox` 与 `PhotoHero` 各自实现 loaded 状态 + 占位 + 渐显，模式相同但代码独立。
- **导航逻辑重复**：Lightbox 内 prev/next 与 PhotoDetail 的 prev/next 各自计算，PhotoDetail 通过传全量 `works` 复用 Lightbox 的导航，部分缓解。
- **结论**：存在真实技术债务——EXIF 与图片加载态应抽公共组件/hook。当前不影响功能，但维护成本翻倍。

### 9. EXIF 是否存在重复逻辑 ⚠️（同上，确认）

- 见第 8 项。`ExifPanel`（7 字段含 film）与 `Lightbox` 底部 EXIF（6 字段漏 film）**两套实现**。
- 修一处忘另一处的风险已实体化（film 字段不一致就是证据）。
- **结论**：需在 Phase 5 前抽 `<ExifFields>` 公共组件供两处复用。

### 10. 数据结构是否健康 ✅（含已知隐患）

- `Work` / `ExifData` / `Photographer` 类型完整，含 `film` / `authorId` / `fullUrl` / `color` 等详情页所需字段。
- `mockData` 18 works / 4 photographers / 9 tags，无破坏。
- **隐患**：`work.authorId` 全部为 `undefined`，`PhotographerMini` 用 `author` 字符串反查 `photographers` 数组——耦合脆弱（重名即错）。当前数据无重名，工作正常，但接后端时需补 `authorId`。
- **结论**：结构健康，存在 1 处弱耦合隐患（已记录）。

### 11. Router 是否健康 ✅

- `BrowserRouter` + 8 条路由，Phase 4 零改动。
- `/photo/:id` 参数解析健壮（`parseInt + isNaN + find` 三重校验）。
- **未引入** `ScrollRestoration`（React Router v6 官方组件），改用自定义 `sessionStorage` 方案——这是 P1-1 BUG 的根因（见 Code Review）。Router 本身健康，但滚动恢复策略选择不当。
- **结论**：Router 健康；滚动恢复方案需调整。

### 12. Hooks 是否合理 ⚠️

- `useScrollRestore`：导出 hook + 2 工具函数，但 **hook 从未被消费**（PhotoDetail 直接用工具函数）→ 死代码。
- `useSwipe`：实现合理（passive 优化、垂直判定、interactive 元素排除），但**绑定范围过大**（整个 `<main>`）+ preventDefault 阈值 10px 过小（P2-5）。
- 既有 hooks（useMediaQuery / useBodyScrollLock / useIntersectionObserver）被正确复用。
- **结论**：Hooks 设计方向正确，但 2 个新 hook 各有 1 处需收敛。

### 13. 是否出现技术债务 ⚠️（Phase 4 新增 6 项）

| # | 债务 | 来源 | 严重度 |
|---|------|------|--------|
| T1 | EXIF 双实现（Lightbox + ExifPanel），film 字段不一致 | Phase 4 未抽公共组件 | 中 |
| T2 | `useScrollRestore` hook 死代码 | Phase 4 实现偏差 | 低 |
| T3 | 多处 `setTimeout` 未清理（PhotoActions） | Phase 4 实现疏漏 | 低 |
| T4 | PhotoHero/PhotoActions/PhotoInfo 状态跨作品未重置（实例复用） | Phase 4 未考虑路由复用组件实例 | 中 |
| T5 | `transition-all` 违反 AGENTS.md 动效规范 | Phase 4 未遵守规范 | 低 |
| T6 | WorkCard `<div onClick>` a11y 缺失被放大（成为详情页唯一入口） | Phase 3 遗留 + Phase 4 复用 | 中 |

- 既有债务（Phase 0-3 遗留）未恶化：死链接、加载更多无功能、无测试框架等仍在原级别。
- **结论**：新增 6 项技术债务，无 P0 级，整体可控。

### 14. Phase 5 是否受到影响 ⚠️（条件性）

- **不阻断**：PhotoDetail 完成且 build/lint 通过，Phase 5（无论方向是 Projects/About 占位页实现、还是 P3 缺陷清理、或后端接入）可正常启动。
- **但存在 2 项前置风险**：
  - P1-1 滚动恢复 BUG 若不修，Phase 5 若加更多「列表→详情」类页面会复制错误模式，债务扩散。
  - EXIF 双实现（T1）若 Phase 5 修 Lightbox，需先抽公共组件，否则改两处。
- **结论**：Phase 5 可启动，但建议先清 P1 与 T1。

---

## 二、问题决策分类

### 🔴 现在必须修（进入 Visual QA 前）

| # | 问题 | 依据 |
|---|------|------|
| M1 | **P1-1 滚动恢复方向错误**（Code Review P1-1） | 进入详情页直接跳到中部，高频路径明显缺陷，Visual QA 会立即发现 |
| M2 | **P1-2 主图 max-h 约束失效**（Code Review P1-2） | 竖图超出视口，违反 UX Spec 明确的 85vh/70vh/50vh 约束，Visual QA 必现 |

> 这两项是「Visual QA 不可绕过」的阻断项。修复前不应对外展示。

### 🟠 Phase 5 前修（不阻断 Visual QA，但阻断下一阶段）

| # | 问题 | 依据 |
|---|------|------|
| P5-1 | **EXIF 双实现 + Lightbox 漏 film**（T1 / 架构第 9 项） | 抽 `<ExifFields>` 公共组件，Lightbox 与 ExifPanel 复用，避免改两处 |
| P5-2 | **PhotoHero / PhotoActions / PhotoInfo 状态跨作品未重置**（T4 / Code Review P2-1/P2-2） | 加 `key={work.id}` 或 useEffect 重置，否则切换作品时状态串扰 |
| P5-3 | **WorkCard a11y 缺失**（T6 / Code Review P2-4） | 加 `role=button` + `tabIndex` + 键盘事件，详情页入口需键盘可达 |
| P5-4 | **`transition-all` 违反规范**（T5 / Code Review P2-3） | 替换为 `transition-transform/opacity/colors`，规范合规 |

### 🟡 以后再修（不阻断当前与下一阶段）

| # | 问题 | 依据 |
|---|------|------|
| L1 | useSwipe 绑定范围 + preventDefault 阈值（Code Review P2-5） | 优化项，当前可用 |
| L2 | 键盘 ←→ 无焦点排除（Code Review P2-6） | 当前无输入框，风险低 |
| L3 | `useScrollRestore` 死代码（T2） | 删除或改用 |
| L4 | setTimeout 未清理（T3） | React 18 不警告，影响轻微 |
| L5 | preload Image 无引用 / srcset 仅 2 档 / Home handleWorkClick 无 useCallback / formatDate 无 memo | 性能微优化 |
| L6 | PhotoNavigation tablet 640-767 断点不一致 | 视觉细节 |
| L7 | `authorId` 全 undefined 弱耦合 | 接后端时补 |
| L8 | PhotoDetail 单文件 209 行临界 | 下次大扩展前拆分 |

### ⚪ 不要修（保持现状）

| # | 项 | 理由 |
|---|----|------|
| N1 | Gallery 移除 Lightbox 入口 | D1 设计决策，Lightbox 组件仍被 PhotoDetail 复用，非死代码 |
| N2 | 点赞/收藏/关注为本地 state | 符合无后端设计，接后端时再持久化 |
| N3 | ESC 返回 Gallery（而非来源页） | UX Spec 明确设计，符合「探索→详情→探索」心智 |
| N4 | 不循环导航（首尾不越界） | 与 Lightbox 行为一致，UX Spec 确认 |
| N5 | Related Works 同 tag 无相关度排序 | 当前数据顺序可接受，后端接入后再优化 |

---

## 三、整体架构健康度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| Phase 0-3 保持 | 9.5/10 | prototype/令牌/分层/路由全部保持；Gallery 入口按设计变更 |
| Atomic Design | 9/10 | 分层正确，复用充分 |
| PhotoDetail 复杂度 | 7.5/10 | 当前可控，临界拆分 |
| 代码重复度 | 6.5/10 | EXIF + 图片加载态重复（T1） |
| 类型/数据健康 | 9/10 | 零 any，1 处弱耦合 |
| Hooks 健康 | 7.5/10 | 方向对，2 处需收敛 |
| 技术债务增量 | 7/10 | 6 项新债，无 P0 |
| Phase 5 就绪 | 7.5/10 | 可启动，2 项前置 |

**综合**：**8.0/10** — 项目整体健康，Photo Detail 合入未破坏架构基线，存在 2 项 P1 功能缺陷需修，其余为可控债务。

---

## 四、最终结论

### ⛔ NOT READY FOR VISUAL QA

**理由**：存在 2 项 P1 级阻断缺陷，Visual QA 会立即暴露且无法通过：

1. **P1-1**：从 Gallery/Home 进入详情页时，页面错误跳到列表滚动位置（而非顶部），主图不可见。
2. **P1-2**：竖图主图高度超出 85vh 视口约束，max-h 形同虚设，破坏「照片是主角但受限」的核心设计。

**解锁路径**：修复 M1 + M2 两项后，重新运行 `npm run build && npm run lint`，即可进入 Visual QA。P5-1 至 P5-4 建议在 Phase 5 启动前完成，但不阻断本次 Visual QA。

---

**复盘合规确认**：全程只读分析，未修改任何代码、未修改 prototype.html、未开始 Phase 5。等待修复决策。
