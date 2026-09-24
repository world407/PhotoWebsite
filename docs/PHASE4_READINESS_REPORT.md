# PHASE 4 DEVELOPMENT READINESS REPORT

> **审查角色**：技术负责人 / Architecture Lead
> **审查对象**：`docs/PHASE4_VISUAL_UX_SPEC.md` v1.0
> **审查日期**：2026-08-16
> **审查方式**：对照实际代码逐项验证设计规范的可落地性
> **代码基线**：Phase 0-3 封档版本（`npm run build` 通过，0 TS 错误）

---

## 一、整体结论

### ✅ READY（附 2 项开发前必须明确的实现决策）

**Phase 4 可以进入 Code 开发。**

设计规范质量达标，组件架构、Props 接口、数据层、路由、视觉令牌均与现有代码兼容，无架构性阻断。存在 2 项设计文档未覆盖的实现决策（Previous/Next 数据源、Gallery 筛选状态恢复），需在开发启动时明确，但不构成设计缺陷——属于"设计规格未细化到的实现边界"。

**判定依据**：
- 8 个新组件的 Props 接口均可被现有 `Work` / `ExifData` / `Photographer` 类型支撑
- `/photo/:id` 路由已存在于 `App.tsx:19`
- WorkCard 已暴露 `onClick` 回调，D1 落地仅需修改调用方传入的函数
- 全部设计令牌（颜色/字号/圆角/间距/动效）已在 `globals.css` 和 `tailwind.config.js` 中定义
- 无需引入新依赖、无需重构现有架构

---

## 二、可以直接实现的部分

| # | 项目 | 验证结论 |
|---|------|----------|
| 1 | `PhotoHero` | ✅ Work 类型含 `fullUrl`/`imageUrl`/`aspectRatio`/`color`，可直接渲染主图 |
| 2 | `PhotoInfo` | ✅ Work 含 `title`/`description`/`location`/`createdAt`/`tags`，字段齐全 |
| 3 | `PhotoActions` | ✅ Work 含 `likes`/`views`，操作按钮为纯 UI + 本地 state |
| 4 | `ExifPanel` | ✅ `ExifData` 类型含 7 字段（camera/lens/aperture/shutterSpeed/iso/focalLength/film），完整 |
| 5 | `PhotographerMini` | ✅ `Photographer` 类型含 name/bio/worksCount/followers/avatarUrl/isFollowed |
| 6 | `RelatedWorks` | ✅ 可基于 `works` 数组 + `work.tag`/`work.author` 计算，数据充足 |
| 7 | `DetailBreadcrumb` | ✅ 纯展示组件，仅需 `title` prop |
| 8 | `/photo/:id` 路由 | ✅ `App.tsx:19` 已配置，无需改动路由表 |
| 9 | 键盘导航（←→/Esc/F） | ✅ 可复用 Lightbox.tsx 的 `useEffect + keydown` 模式 |
| 10 | 图片预加载 ±1 | ✅ 可复用 Lightbox.tsx:80-88 的 `new Image()` 模式 |
| 11 | 404 降级 | ✅ `works.find(w => w.id === Number(id))` 返回 undefined 时渲染 NotFound 风格 UI |
| 12 | EXIF 缺失降级 | ✅ `exif?` 可选字段，条件渲染即可 |
| 13 | Mobile 底部操作栏 | ✅ `useMediaQuery` hook 已存在，可用于断点判断 |
| 14 | `prefers-reduced-motion` | ✅ `globals.css:452-460` 已有全局覆盖规则 |

---

## 三、需要开发前调整的部分

### 3.1 阻断级（必须在开发前决策，见第十一节）

| # | 问题 | 影响 |
|---|------|------|
| A1 | **Previous/Next 计算的数据源未明确** | PhotoDetail 是独立页面，无法访问 Gallery 的 `filteredWorks` 上下文。需明确：基于全量 `works`（18张）导航，还是基于同 `tag` 作品导航，还是需要跨页面状态传递 |
| A2 | **Gallery 筛选状态恢复策略未明确** | 用户在 Gallery 筛选"人像"→进详情→返回→Gallery 重置为"全部"。React Router v6 默认不保留页面状态。F17 要求恢复滚动位置，但筛选状态恢复未提及 |

### 3.2 需调整级（开发中解决，不阻断启动）

| # | 问题 | 建议方案 |
|---|------|----------|
| B1 | Home 的 `WaterfallGallery` 未传 `onClick`（当前首页卡片点击无反应） | 开发时需补充 `onClick={() => navigate('/photo/'+work.id)}`，需引入 `useNavigate` |
| B2 | 无滚动位置恢复 hook | 需新建 `useScrollRestore` 或用 `sessionStorage` 记录/恢复 scrollY |
| B3 | PhotoDetail 内 Lightbox 的 `works` 数组传什么 | 建议：详情页内 Lightbox 只服务当前作品，传 `[currentWork]` 单元素数组（或相邻3张）。不传全量，避免与 Gallery 的 Lightbox 语义混淆 |
| B4 | Mobile Swipe 需新建 hook | 需新建 `useSwipe` hook（touchstart/touchmove/touchend），现有 hooks 无此能力 |
| B5 | Share Clipboard 需 fallback | `navigator.clipboard` 在非 HTTPS/旧浏览器不可用，需 `document.execCommand('copy')` 降级 |
| B6 | Download 跨域可能失效 | Unsplash 图片 `download` 属性跨域无效，需 `fetch → blob → URL.createObjectURL` 方案 |

---

## 四、数据层风险

### 4.1 风险评估：低

| 检查项 | 结论 |
|--------|------|
| `Work` 类型支持 Photo Detail | ✅ 所有所需字段已存在（见 `types/index.ts:2-22`） |
| `ExifData` 类型完整 | ✅ 含 `film` 字段（`types/index.ts:36`），id:15 作品有胶片数据 |
| `Photographer` 数据完整 | ✅ 4 位摄影师数据齐全（`mockData.ts:328-365`） |
| Work 与 Photographer 的关联 | ⚠️ **弱关联**：Work 有 `author`(字符串) 和 `authorId?`(可选数字)，但 `authorId` 在 mockData 中**全部未赋值**。PhotographerMini 需通过 `author` 字符串匹配 `photographers[].name` |

### 4.2 数据层需修正项

| # | 问题 | 严重度 | 建议 |
|---|------|--------|------|
| D1 | `work.authorId` 全部为 undefined | 中 | PhotographerMini 组件需用 `author` 字符串反向查找 `photographers` 数组，或在开发时为 mockData 补充 `authorId` |
| D2 | `work.authorAvatar` 在 id:5/6/7 等作品缺失 | 低 | PhotographerMini 需有头像缺失降级（首字母圆形占位） |
| D3 | 部分作品 `description` 较短（如 id:5 "老城区街角的日常瞬间"） | 低 | 不影响功能，Mobile 截断逻辑需兼容短文本 |

---

## 五、路由风险

### 5.1 风险评估：低

| 检查项 | 结论 |
|--------|------|
| `/photo/:id` 路由已配置 | ✅ `App.tsx:19` |
| `PhotoDetail` 组件已导入 | ✅ `App.tsx:5` |
| `useParams()` 可获取 id | ✅ 当前占位代码已验证 |
| 非法 id 处理 | ✅ 可用 `works.find()` + 条件渲染 404 |

### 5.2 路由相关注意事项

| # | 注意点 |
|---|--------|
| R1 | `id` 参数为 string 类型，需 `Number(id)` 转换；需处理 `NaN` 情况（如 `/photo/abc`） |
| R2 | 浏览器前进/后退：React Router v6 默认支持，但 **Gallery 的筛选状态不在 URL 中**，返回时会丢失（见 A2） |
| R3 | 从 Lightbox 跳详情页时，Lightbox 当前是 Portal 渲染在 body 上，`navigate()` 不会自动关闭 Lightbox，需手动 `setLightboxOpen(false)` 后再 navigate |

---

## 六、组件架构风险

### 6.1 风险评估：低

| 组件 | 架构兼容性 | 风险点 |
|------|-----------|--------|
| `PhotoHero` | ✅ organism 层，符合 Atomic Design | 无 |
| `PhotoInfo` | ✅ molecule 层 | 无 |
| `PhotoActions` | ✅ molecule 层 | 点赞/收藏状态需提升到 PhotoDetail 页面级 state |
| `ExifPanel` | ✅ molecule 层 | 需注意 `exif?` 可能为 undefined |
| `PhotographerMini` | ✅ molecule 层 | **不应直接复用 PhotographerCard**（organism），需新建精简版 |
| `RelatedWorks` | ✅ organism 层 | WorkCard 需新增 `variant="compact"` 或直接复用（待定） |
| `PhotoNavigation` | ✅ molecule 层 | fixed 定位需确认 z-index 不与 Navigation(50)/Drawer(60) 冲突 |
| `DetailBreadcrumb` | ✅ atom 层 | 无 |

### 6.2 WorkCard 改动风险评估

| 改动 | 风险 | 说明 |
|------|------|------|
| Gallery 中 `onClick` 从 `openLightbox(index)` 改为 `navigate('/photo/'+work.id)` | 🟢 低 | WorkCard 组件本身不改，只改调用方 |
| WaterfallGallery（Home）补充 `onClick` | 🟢 低 | 当前未传 onClick，补充即可 |
| WorkCard 新增 `variant="compact"` | 🟡 中 | 需确保不破坏 Gallery/Home 现有使用。建议：默认 variant 不变，compact 为可选 prop |

### 6.3 Lightbox 改动风险评估

| 改动 | 风险 | 说明 |
|------|------|------|
| PhotoDetail 内引入 Lightbox | 🟢 低 | Lightbox 是受控组件（props 驱动），可独立实例化 |
| Lightbox 内新增"查看详情"按钮 | 🟡 中 | **D1 决策已明确 Lightbox 保留在 Detail 内**，因此 Gallery 的 Lightbox **不需要**加"查看详情"按钮。只有 Detail 内的 Lightbox 需要，但它已在详情页，此按钮无意义。**结论：Lightbox 无需任何修改** |

---

## 七、交互风险

### 7.1 交互链路验证

| 链路 | 可行性 | 风险 |
|------|--------|------|
| Gallery → Detail | ✅ | WorkCard onClick 改为 navigate 即可 |
| Home → Detail | ✅ | WaterfallGallery 需补充 onClick（当前缺失） |
| Lightbox → Detail | ⚠️ | D1 已明确 Lightbox 保留在 Detail 内，**此链路实际不需要实现**。Gallery 的 Lightbox 不跳详情 |
| Detail → Previous/Next | 🔴 | **数据源未明确**（见 A1） |
| Detail → Related | ✅ | RelatedWorks 内 WorkCard onClick navigate 即可 |
| Detail → Gallery（返回） | ⚠️ | 需 `navigate(-1)` 或 `navigate('/gallery')`，但筛选状态恢复未解决（见 A2） |

### 7.2 键盘事件管理风险

| 风险 | 说明 | 建议 |
|------|------|------|
| 键盘事件冲突 | PhotoDetail 和其内部的 Lightbox 都会监听 `keydown`。若同时监听 `←→`，会重复触发 | Lightbox 打开时，PhotoDetail 的键盘监听应 `return early`（检查 `isLightboxOpen` 状态） |
| `Esc` 语义冲突 | PhotoDetail 的 Esc 应返回 Gallery；Lightbox 的 Esc 应关闭 Lightbox | 同上：Lightbox 打开时 Esc 只关 Lightbox，不触发返回 |

### 7.3 Mobile Swipe 风险

| 风险 | 说明 |
|------|------|
| 需新建 `useSwipe` hook | 现有 hooks 无此能力。需实现 touchstart/touchmove/touchend，阈值约 50px |
| 滑动与垂直滚动冲突 | 需判断滑动方向（水平 vs 垂直），仅水平滑动触发切换，垂直滑动放行页面滚动 |
| 滑动反馈 | 设计文档要求"可发现的上一张/下一张操作能力"——隐藏箭头后，需有替代发现机制（如底部进度指示器 `3 / 18`） |

---

## 八、性能风险

### 8.1 风险评估：低

| 检查项 | 结论 |
|--------|------|
| 主图 LCP | ✅ Mock 数据本地同步获取，LCP 应 < 1s |
| 图片懒加载 | ✅ Related Works 用 `loading="lazy"` |
| CLS 防护 | ✅ `aspectRatio` + `width/height` + `color` 占位 |
| 预加载 | ✅ 可复用 Lightbox 的 `new Image()` 模式 |
| 重复渲染 | ✅ `useMemo` 计算 relatedWorks，`useCallback` 稳定函数引用 |

### 8.2 性能注意事项

| # | 注意点 |
|---|--------|
| P1 | 主图用 `loading="eager"` + `fetchpriority="high"`（设计文档已要求，但 HTML img 的 `fetchpriority` 属性需确认 React 18 支持） |
| P2 | RelatedWorks 的 4 张图若都用 `loading="lazy"`，首屏不加载，但用户快速滚动时可能有白屏——建议 rootMargin 预加载 |
| P3 | 键盘事件监听器需在 `useEffect` cleanup 中正确移除，避免内存泄漏 |

---

## 九、响应式风险

### 9.1 风险评估：低

| 断点 | 布局 | 验证 |
|------|------|------|
| Mobile (<640px) | 单列 + 底部操作栏 + 隐藏箭头 + 描述截断 | ✅ `useMediaQuery` 可用 |
| Tablet (640-1023px) | 单列堆叠 + 2列 Related | ✅ Tailwind `sm:`/`md:` 断点已定义 |
| Desktop (≥1024px) | 4+8 分栏 + 4列 Related + 固定箭头 | ✅ `lg:` 断点已定义 |

### 9.2 响应式注意点

| # | 注意点 |
|---|--------|
| R1 | 底部操作栏需处理 iOS safe-area：`padding-bottom: env(safe-area-inset-bottom)` |
| R2 | `grid-cols-12` 的 4+8 分栏在 1024-1200px 之间可能偏窄，需测试 |
| R3 | Mobile 描述截断需用 `-webkit-line-clamp: 3` + `-webkit-box-orient: vertical`，需确认 Tailwind 支持 |
| R4 | 固定导航箭头 `fixed left-4 right-4` 需确认不遮挡内容（container max-w-1200px 居中时，两侧留白足够） |

---

## 十、Phase 0～3 破坏风险

### 10.1 风险评估：极低

| 现有功能 | Phase 4 影响 | 破坏风险 |
|----------|-------------|----------|
| Home 首页 | WaterfallGallery 需补充 onClick | 🟢 低（仅新增，不改现有逻辑） |
| Gallery 作品库 | WorkCard onClick 从 openLightbox 改为 navigate | 🟡 中（**改变了核心交互**，需确认 Lightbox 仍有入口） |
| Lightbox | 无需修改 | 🟢 无 |
| Navigation | 无需修改 | 🟢 无 |
| 设计令牌 | 无新增 | 🟢 无 |
| 路由表 | 无新增（`/photo/:id` 已存在） | 🟢 无 |

### 10.2 Gallery 交互变更的特别说明

D1 决策将 Gallery 的 WorkCard 点击从"开 Lightbox"改为"进详情页"。这意味着 **Gallery 内的 Lightbox 将失去主要触发入口**。

| 问题 | 建议 |
|------|------|
| Gallery 的 Lightbox 是否还需要？ | 选项 A：移除 Gallery 的 Lightbox（减少代码）；选项 B：保留但需新增触发方式（如 WorkCard 上的"快速查看"图标按钮） |
| **本报告建议** | 选项 B：在 WorkCard hover overlay 上新增一个小的"放大"图标按钮，点击开 Lightbox；卡片其余区域点击进详情。但这属于 WorkCard 改动，需评估是否在 D5"只修相关 P3"范围内 |

---

## 十一、必须修改的问题

### 11.1 阻断级（开发前必须明确，否则无法正确实现）

#### 问题 A1：Previous/Next 计算的数据源

**背景**：PhotoDetail 是独立页面，无法访问 Gallery 的 `filteredWorks` 上下文。

**可选方案**：

| 方案 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| **A1-α**：基于全量 `works` 导航 | `works.findIndex(w => w.id === id)`，prev/next 取相邻索引 | 实现简单，行为可预测 | 用户从"人像"筛选进详情后，上下张可能跳到"风景"作品，脱离筛选语境 |
| **A1-β**：基于同 `tag` 作品导航 | `works.filter(w => w.tag === currentWork.tag)`，在此子集内导航 | 保持在同分类内浏览，体验更连贯 | 跨 tag 的作品无法到达；某些 tag 只有 1-2 张作品时导航几乎无效 |
| **A1-γ**：URL query 传递上下文 | Gallery 跳转时 `navigate('/photo/'+id+'?from=gallery&tag=portrait')`，Detail 据此重建上下文 | 完美保留筛选语境 | 实现复杂；直接访问 URL 时无上下文需降级到全量 |

**本报告推荐**：**A1-α（全量导航）**。理由：实现简单、行为可预测、直接访问 URL 也能正常工作。筛选语境的丢失可接受——用户按返回键回到 Gallery 时筛选状态仍在（若实现 A2）。

#### 问题 A2：Gallery 筛选状态恢复策略

**背景**：React Router v6 默认不保留页面状态。用户在 Gallery 筛选"人像"→进详情→返回→Gallery 重置为"全部"。

**可选方案**：

| 方案 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| **A2-α**：不恢复（接受丢失） | 无额外实现 | 零成本 | 体验降级 |
| **A2-β**：URL searchParams 持久化 | Gallery 的筛选状态写入 URL（`/gallery?tag=portrait&sort=latest`） | 可分享、可书签、刷新不丢失 | 需改造 Gallery 读取/写入 URL，改动量中等 |
| **A2-γ**：sessionStorage 持久化 | 离开 Gallery 前存入 sessionStorage，返回时读取 | 不改 URL | 刷新后保留（可能非预期）、多标签页冲突 |

**本报告推荐**：**A2-α（不恢复）+ 仅恢复滚动位置**。理由：D5 明确"只修与 Phase 4 直接相关的 P3"，筛选状态持久化属于 Gallery 增强功能，不在 Phase 4 范围。滚动位置恢复用 `sessionStorage` 记录 scrollY 即可，改动最小。

### 11.2 必须修正的代码问题（开发中处理）

| # | 问题 | 位置 | 修正方式 |
|---|------|------|----------|
| M1 | Home `WaterfallGallery` 未传 WorkCard `onClick` | `WaterfallGallery.tsx:49` | 补充 `onClick={() => navigate('/photo/'+work.id)}` |
| M2 | Gallery WorkCard `onClick` 需从 `openLightbox` 改为 `navigate` | `Gallery.tsx:120` | 修改回调函数 |
| M3 | `work.authorId` 全部 undefined | `mockData.ts` | PhotographerMini 用 `author` 字符串匹配，或补充 authorId |
| M4 | `Number(id)` 需处理 NaN | PhotoDetail.tsx | `const numId = Number(id); if (isNaN(numId)) → 404` |
| M5 | 键盘事件冲突 | PhotoDetail + Lightbox | Lightbox 打开时 PhotoDetail 键盘监听 return early |

---

## 十二、可以延后的问题

| # | 问题 | 延后理由 |
|---|------|----------|
| L1 | Gallery Lightbox 是否移除或保留触发入口 | D1 后 Gallery Lightbox 失去主入口，但可暂不处理（保留代码不删，未来决定） |
| L2 | WorkCard `variant="compact"` | RelatedWorks 可直接复用现有 WorkCard，compact 变体非必须 |
| L3 | 图片 `onError` 降级（P3 历史问题） | D5 限定只修相关 P3，此问题与 Phase 4 无直接关联，延后 |
| L4 | 双击图片放大 / 手势缩放 | 设计文档已标 P2 |
| L5 | 右键保护 / 水印 | 设计文档已明确不做 |
| L6 | Gallery 筛选状态 URL 持久化 | 见 A2，属 Gallery 增强，非 Phase 4 范围 |

---

## 十三、明确禁止修改的内容

| # | 禁止项 | 理由 |
|---|--------|------|
| 1 | `prototype.html` | 视觉 Source of Truth，封档 |
| 2 | `src/pages/Home.tsx` 的结构 | Phase 2 封档（仅 WaterfallGallery 内部补充 onClick 允许） |
| 3 | `src/pages/Gallery.tsx` 的筛选/排序/布局逻辑 | Phase 3 封档（仅 WorkCard onClick 回调允许修改） |
| 4 | `src/components/organisms/Lightbox.tsx` | D1 决策明确无需修改 |
| 5 | `tailwind.config.js` / `globals.css` 的设计令牌 | Design System 封档 |
| 6 | `package.json` 依赖列表 | 禁止引入新依赖 |
| 7 | `src/types/index.ts` 的现有类型定义 | 禁止删除/修改现有字段（新增可选字段允许） |
| 8 | `App.tsx` 路由表 | `/photo/:id` 已存在，无需改动 |
| 9 | Atomic Design 分层结构 | 禁止重构 |
| 10 | 任何 Phase 0-3 的组件视觉表现 | 禁止借 Phase 4 改版 |

---

## 十四、推荐开发顺序

### Phase 4 开发分 6 个里程碑，严格顺序执行：

```
M1: 数据层 + 路由层（无 UI）
 ├── 确认 A1/A2 决策
 ├── PhotoDetail.tsx 基础骨架（useParams + works.find + 404 判定）
 ├── 新建 useScrollRestore hook（sessionStorage 方案）
 └── 新建 useSwipe hook（Mobile 滑动）

M2: 核心展示组件（静态渲染）
 ├── PhotoHero（主图 + 加载态）
 ├── PhotoInfo（标题 + 元数据 + 描述 + 标签）
 ├── ExifPanel（7 字段网格 + 缺失降级）
 └── PhotographerMini（头像 + 信息 + 关注按钮）

M3: 交互组件
 ├── PhotoActions（点赞/收藏/分享/下载 + 状态动画）
 │   ├── Share: navigator.clipboard + execCommand fallback
 │   └── Download: fetch + blob 方案
 ├── PhotoNavigation（fixed 箭头 + 键盘监听 + 预加载）
 └── DetailBreadcrumb

M4: 组装 PhotoDetail 页面
 ├── 5 Zone 垂直布局
 ├── Desktop 4+8 分栏
 ├── Tablet 单列堆叠
 └── Mobile 底部操作栏 + 描述截断

M5: 跳转链路打通
 ├── Gallery WorkCard onClick → navigate
 ├── Home WaterfallGallery WorkCard onClick → navigate
 ├── RelatedWorks WorkCard onClick → navigate
 ├── 引入 Lightbox（传 [currentWork] 单元素数组）
 └── 键盘事件冲突处理（Lightbox 打开时 PhotoDetail 监听 return early）

M6: 测试 + 验收
 ├── npm run build 零错误
 ├── 三端响应式测试（375 / 768 / 1920）
 ├── 键盘测试（←→/Esc/F）
 ├── 404 测试（/photo/abc / /photo/999）
 ├── a11y 测试（Tab 焦点 / screen reader）
 └── 视觉对照 prototype.html
```

### 每个里程碑的完成标准

| 里程碑 | 完成标准 |
|--------|----------|
| M1 | `npm run build` 通过，`/photo/1` 可访问且能找到数据，`/photo/abc` 显示 404 |
| M2 | 4 个组件独立可用，Storybook 级别的独立渲染正确 |
| M3 | 操作按钮状态切换正常，Share/Download 功能可用 |
| M4 | 三端布局正确，视觉与 prototype.html 一致 |
| M5 | 所有跳转链路通畅，键盘无冲突，Lightbox 可开关 |
| M6 | 全部 30 项验收标准通过 |

---

## 附录：审查方法说明

本报告基于以下实际代码验证：
- `src/App.tsx`（路由配置）
- `src/pages/Gallery.tsx`（Lightbox works 数组来源）
- `src/pages/Home.tsx` + `src/components/organisms/WaterfallGallery.tsx`（Home WorkCard 使用方式）
- `src/components/molecules/WorkCard.tsx`（onClick 接口）
- `src/components/organisms/Lightbox.tsx`（键盘/预加载/全屏实现）
- `src/types/index.ts`（Work/ExifData/Photographer 类型）
- `src/data/mockData.ts`（18 works + 4 photographers 数据完整性）
- `src/lib/hooks/index.ts`（现有 hooks 清单）
- `src/styles/globals.css`（设计令牌）
- `tailwind.config.js`（Tailwind 主题配置）

未修改任何代码。审查仅读取和分析。
