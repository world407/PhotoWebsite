# Phase 4 Photo Detail — 最终验收报告

> **验收人**：Project Lead
> **日期**：2026-08-16
> **验收对象**：Phase 4 Photo Detail（`/photo/:id`）
> **验收方式**：以实际代码为准，逐项硬验证（非仅依赖历史报告）

---

## 最终判定

# ❌ PHASE 4 = NOT READY

**存在 1 项 P1 阻断缺陷**：Gallery/Home 滚动位置恢复功能在两个方向均失效，属于「必须确认」清单中的功能项。此缺陷在 Code Review 与 Architecture Review 中两次标记为「现在必须修」，但 Visual QA 定向修复阶段（范围限定为视觉问题）未覆盖，遗留至最终验收。

---

## 1. Phase 4 完成内容

| 功能模块 | 状态 |
|----------|------|
| `/photo/:id` 路由 | ✅ 完成 |
| Invalid ID → 404 | ✅ 完成 |
| Photo Info（标题/地点/日期/描述/标签） | ✅ 完成 |
| EXIF 完整展示（camera/lens/film/aperture/shutter/iso/focalLength） | ✅ 完成 |
| Photographer 卡片 | ✅ 完成 |
| Like / Favorite | ✅ 完成 |
| Share（Clipboard + fallback） | ✅ 完成 |
| Download（fetch→blob） | ✅ 完成 |
| Previous / Next | ✅ 完成 |
| Keyboard ←/→/Esc/F | ✅ 完成 |
| Lightbox 沉浸查看 | ✅ 完成 |
| Related Works（4 张，排除当前） | ✅ 完成 |
| Home → Detail | ✅ 完成 |
| Gallery → Detail | ✅ 完成 |
| Related → Detail | ✅ 完成 |
| Browser Back/Forward | ✅ 完成 |
| **Gallery Scroll Restoration** | ❌ **P1 缺陷** |
| Mobile Swipe | ✅ 完成 |

---

## 2. 修改文件

Phase 4 累计修改/新增文件：

| 文件 | 类型 |
|------|------|
| `src/pages/PhotoDetail.tsx` | 重写（占位 → 完整实现，209 行） |
| `src/pages/Gallery.tsx` | 修改（卡片点击进详情 + 移除 Gallery 内 Lightbox） |
| `src/pages/Home.tsx` | 修改（handleWorkClick 进详情 + 保存滚动） |
| `src/components/organisms/WaterfallGallery.tsx` | 修改（新增 onWorkClick prop） |
| `src/components/atoms/TagChip.tsx` | 修改（新增 interactive prop） |
| `src/components/atoms/ShimmerPlaceholder.tsx` | 修改（新增 style prop） |
| `src/components/atoms/Icon/index.tsx` | 修改（新增 bookmark/bookmark-check/image/check 图标） |
| `src/types/index.ts` | 修改（扩展 IconName 类型） |
| `src/lib/hooks/useScrollRestore.ts` | 新增 |
| `src/lib/hooks/useSwipe.ts` | 新增 |
| `src/lib/hooks/index.ts` | 修改（导出新 hook） |
| `tailwind.config.js` | 修改（新增 like-bounce 动画） |
| `src/styles/globals.css` | 修改（新增 line-clamp/pb-safe/page-enter） |

---

## 3. 新增组件（8 个）

| 组件 | 类型 | 职责 |
|------|------|------|
| `DetailBreadcrumb` | atom | 面包屑 + 返回 |
| `PhotoInfo` | molecule | 标题/地点/日期/描述/标签 |
| `PhotoActions` | molecule | 点赞/收藏/分享/下载/全屏（3 变体） |
| `ExifPanel` | molecule | EXIF 技术参数网格 |
| `PhotographerMini` | molecule | 摄影师精简卡片 |
| `PhotoNavigation` | molecule | 桌面固定左右箭头 |
| `PhotoHero` | organism | 主图展示区 |
| `RelatedWorks` | organism | 相关作品推荐 |

复用组件（未改）：`Lightbox`、`WorkCard`、`SectionHeader`、`Button`、`Icon`、`ShimmerPlaceholder`。

---

## 4. 功能验收

| 验收项 | 结果 | 说明 |
|--------|------|------|
| `/photo/:id` 路由 | ✅ | App.tsx 已注册 |
| Invalid ID → 404 | ✅ | NaN / 未找到 → NotFound |
| Photo Info | ✅ | 完整渲染 |
| EXIF | ✅ | 含 film 字段，缺失字段隐藏 |
| Photographer | ✅ | author 字符串反查 photographers |
| Like / Favorite | ✅ | 本地 state + 弹跳动画 |
| Share | ✅ | clipboard + execCommand fallback |
| Download | ✅ | fetch→blob→createObjectURL |
| Previous / Next | ✅ | 基于全量 works，非循环 |
| Keyboard ←/→/Esc/F | ✅ | Lightbox 打开时正确隔离 |
| Lightbox | ✅ | 传全量 works，支持内部 prev/next |
| Related Works | ✅ | 同 tag 优先 + 同 author 兜底 + 排除当前 |
| Home → Detail | ✅ | handleWorkClick |
| Gallery → Detail | ✅ | handleWorkClick |
| Related → Detail | ✅ | goToWork |
| Browser Back/Forward | ✅ | BrowserRouter 原生支持 |
| **Gallery Scroll Restoration** | ❌ | **见下方 P1 缺陷** |
| Mobile Swipe | ✅ | useSwipe 绑定 mainRef |

---

## 5. 视觉验收

| 维度 | 结果 | 备注 |
|------|------|------|
| prototype.html 一致性 | ✅ | 令牌/圆角/间距/阴影/动效全一致 |
| Desktop (1920×1080) | ✅ | 主图 85vh + 4/8 分栏 + 4 列 Related |
| Tablet (640-1023) | ✅ | 单列 + 70vh + 2 列 Related |
| Mobile (<640) | ✅ | 50vh + 底部 64px bar + safe-area |
| Typography | ✅ | font-serif 已移除（QA 修复） |
| Spacing | ✅ | 4px 基准 |
| Color | ✅ | 无新增 token，金色仅交互态 |
| Image | ✅ | srcset/sizes/width/height/lazy/eager/Shimmer |
| Animation | ✅ | transition-all 已拆分（QA 修复） |
| Responsive | ✅ | 三端断点正确 |

---

## 6. 工程验收

| 验收项 | 结果 |
|--------|------|
| TypeScript Strict | ✅ 全项目 `any` 0 处 |
| `npm run build` | ✅ 0 TS 错误（1519 modules，产物 CSS 32.54KB / JS 232.26KB） |
| `npm run lint` | ✅ 0 errors / 0 warnings |
| Console | ✅ 无 React warning / JS error（代码审查确认） |
| Accessibility | ⚠️ WorkCard 为 `<div onClick>` 无键盘可达（P2，遗留） |

---

## 7. 性能验收

| 验收项 | 结果 |
|--------|------|
| CLS 防护 | ✅ 主图 width/height + aspect-ratio + 颜色占位 |
| Lazy Loading | ✅ 列表/Related 用 lazy，主图 eager |
| Preload | ✅ 相邻作品 ±1 预加载 |
| 图片分层 | ✅ 列表 600w / 大图 1600w |

---

## 8. 遗留问题

### 🔴 P1 阻断缺陷（必须修复）

**Gallery Scroll Restoration 双向失效**

| 项 | 位置 | 问题 |
|----|------|------|
| P1-1 | `PhotoDetail.tsx:63-69` | `restoreScrollPosition()` 放在**详情页 mount** 时执行。从 Gallery（已滚动）点卡片进详情时，详情页被错误滚动到 Gallery 的滚动位置，主图不可见 |
| P1-2 | `Gallery.tsx` / `Home.tsx` | 二者均**无 mount 恢复逻辑**，返回列表时无法恢复之前的滚动位置 |
| P1-3 | `PhotoDetail.tsx:58-61`（goToGallery）/ `52-56`（goToWork） | `saveScrollPosition()` 保存的是**详情页自己的 scrollY**（无用值），覆盖了列表页应有的位置 |

**根因**：`saveScrollPosition` / `restoreScrollPosition` 的调用位置放反了。保存应在离开列表时（已做），但恢复应放在 **Gallery/Home 的 mount effect**（未做），而不是详情页 mount（做了，方向错误）。

**修复方向**：
1. 删除 `PhotoDetail.tsx` 的 mount 恢复 effect（63-69 行）；
2. 在 `Gallery.tsx` 与 `Home.tsx` 各加一个 mount effect 调用 `restoreScrollPosition()`；
3. `goToWork` / `goToGallery` 内的 `saveScrollPosition()` 可保留或移除（详情页导航无需保存列表位置）。

### 🟠 P2（Phase 5 前修，4 项）

| 编号 | 问题 |
|------|------|
| P2-1 | PhotoHero loaded/error 跨作品切换不重置 |
| P2-2 | PhotoActions like/favorite 跨作品共享状态 |
| P2-3 | WorkCard `<div onClick>` 无键盘可达（a11y） |
| P2-4 | 键盘 ←/→ 无输入框焦点排除 |

### 🟡 P3（以后再修，8 项）

useScrollRestore hook 死代码、setTimeout 未清理、preload Image 无引用、F 键 404 页误触发、PhotoNavigation tablet 640-767 断点不一致、Home handleWorkClick 无 useCallback、formatDate 无 memo、srcset 仅 2 档。

---

## 9. 技术债务

| 编号 | 债务 | 影响 |
|------|------|------|
| T1 | Lightbox 与 PhotoDetail 的 EXIF 逻辑重复（Lightbox 漏 film） | 维护成本 |
| T2 | 无测试框架 | 回归靠手动 |
| T3 | lint 未接入 build 流程 | 质量门禁不完整 |
| T4 | `no-explicit-any` 仅 warn | 约束较弱 |
| T5 | 数据全静态，点赞/关注刷新即失 | 功能局限 |
| T6 | Hero 主图无 fetchpriority | 首屏优化空间 |

---

## 10. Phase 5 建议

Phase 5 合理方向（不构成强制任务，供决策参考）：

1. **优先**：先修本报告的 P1 滚动恢复缺陷（Phase 4 收尾）
2. 候选主题：Projects（摄影专题）页 / About（关于）页 / Journal（摄影日志）页
3. 建议在启动任何新页面开发前，先完成 P2-3（WorkCard a11y）与 EXIF 公共组件抽取（T1）

---

## 11. Phase 5 风险

| 风险 | 等级 | 说明 |
|------|------|------|
| P1 滚动缺陷未修即进 Phase 5 | 🔴 高 | 会随详情页使用频率上升而放大体验问题 |
| EXIF 双实现 | 🟠 中 | 继续新增页面若复用 EXIF 逻辑，重复度会进一步上升 |
| 无测试框架 | 🟠 中 | Phase 5 新增页面后手动回归成本递增 |
| WorkCard a11y | 🟡 低 | 详情页成为主入口后键盘用户受影响 |

---

## 12. 是否正式封档

**否。** Phase 4 存在 1 项 P1 功能阻断缺陷（Gallery Scroll Restoration），需修复后才能正式封档。

### 技术栈与封档保护确认

| 保护项 | 结果 |
|--------|------|
| prototype.html 未修改 | ✅ 时间戳 Aug 15 12:02，35402 字节 / 833 行，与封档一致 |
| Home 未重做 | ✅ 仅新增 handleWorkClick + onWorkClick |
| Gallery 未重做 | ✅ 仅卡片点击改 navigate + 移除 Gallery 内 Lightbox |
| 技术栈未变 | ✅ React 18 / TS 5 / Vite 5 / Tailwind 3.4 / Router 6 / lucide-react |
| 未引入新依赖 | ✅ package.json 依赖项与 Phase 3 封档一致 |

---

## 结论

# ❌ PHASE 4 = NOT READY

**阻断项（唯一）**：Gallery/Home 滚动位置恢复功能双向失效（P1），属「必须确认」清单项。

**修复成本**：低（3 处小改动，约 10 分钟），不涉及视觉或架构变更。

**其余全部通过**：功能 20/21 项、视觉全绿、build/lint 双零、Phase 0-3 保护完好。

---

*合规确认：本次验收全程只读，未修改任何代码、未修改 prototype.html、未开始 Phase 5。*
