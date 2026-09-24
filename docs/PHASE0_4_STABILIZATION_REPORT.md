# Phase 0–4 全量 QA + 稳定化报告

> **执行人**：Project Lead
> **日期**：2026-08-16
> **模式**：VISUAL FREEZE（视觉冻结）
> **范围**：Phase 0–4 全量审计 + 定点修复（不改变视觉）

---

## 一、最终结论

# ✅ Phase 0–4 已达到稳定状态

**修复了 1 项 P1 阻断缺陷 + 2 项 P2 状态管理缺陷 + 4 项 P3 工程问题。** 全部修复不改变任何视觉表现，VISUAL FREEZE 规则全程遵守。

---

## 二、审计执行摘要

| 审计维度 | 执行方式 | 结论 |
|----------|----------|------|
| 工程基线 | `npm run build` + `npm run lint` | ✅ 0 TS 错误 / 0 errors/warnings |
| TypeScript Strict | Grep `any` | ✅ 全项目 0 处 |
| 视觉冻结 | 对照 prototype.html | ✅ 未改动（Aug 15 12:02，35402B/833 行） |
| 数据一致性 | mockData / types / 组件逐个核对 | ⚠️ 1 处 [VISUAL_LOCK] |
| 死链接 | Navigation / MobileDrawer / Footer | ⚠️ 5 处 [VISUAL_LOCK] |
| SEO | index.html / public | ⚠️ 已修复（favicon + OG） |
| a11y | WorkCard / 键盘 / focus | ⚠️ 1 处 [VISUAL_LOCK] |
| 死代码 | Grep 导出项引用 | ⚠️ 2 处已清理 |

---

## 三、问题分级总览

### P0（阻断网站使用）：0 项 ✅

### P1（严重影响用户体验）：1 项，已修复 ✅

| 编号 | 问题 | 状态 |
|------|------|------|
| P1-1 | Gallery/Home 滚动位置恢复双向失效 | ✅ 已修复 |

### P2（功能缺陷）：6 项（2 修复 + 4 [VISUAL_LOCK]）

| 编号 | 问题 | 状态 |
|------|------|------|
| P2-1 | PhotoHero loaded/error 跨作品切换不重置 | ✅ 已修复 |
| P2-2 | PhotoActions like/favorite 跨作品共享状态 | ✅ 已修复 |
| P2-3 | 死链接 /favorites、/photographers、/help | ⛔ [VISUAL_LOCK] |
| P2-4 | Lightbox 下载/分享死按钮 | 📋 功能缺失（记录） |
| P2-5 | Gallery 加载更多无功能 | 📋 功能缺失（记录） |
| P2-6 | Footer 分类链接 `/gallery?tag=xxx` 无筛选效果 | 📋 功能缺失（记录） |

### P3（技术债）：12 项（3 修复 + 9 记录）

| 编号 | 问题 | 状态 |
|------|------|------|
| P3-1 | favicon `/vite.svg` 404 | ✅ 已修复 |
| P3-2 | 无 Open Graph meta | ✅ 已修复 |
| P3-3 | mockData.navItems 死代码 | ✅ 已修复 |
| P3-4 | useScrollRestore 死代码函数 | ✅ 已修复 |
| P3-5 | WorkCard preventDefault 冗余 | ✅ 已修复 |
| P3-6 | 首页标签 6 个 vs Gallery 9 个不一致 | ⛔ [VISUAL_LOCK] |
| P3-7 | Lightbox EXIF 漏 film 字段 | ⛔ [VISUAL_LOCK] |
| P3-8 | 多处 transition-all（Lightbox/WorkCard/GalleryToolbar/Gallery） | ⛔ [VISUAL_LOCK] |
| P3-9 | WorkCard `<div onClick>` 无键盘可达 | ⛔ [VISUAL_LOCK] |
| P3-10 | setTimeout 未清理（PhotoActions） | 📋 记录 |
| P3-11 | Hero 主图无 fetchpriority / width-height | 📋 记录 |
| P3-12 | Gallery `text-h1` token 未定义（静默无效） | 📋 记录 |

---

## 四、已修复问题详情

### 4.1 P1-1：滚动位置恢复双向失效

**根因**：`restoreScrollPosition()` 被误放在 PhotoDetail 的 mount effect，而 Gallery/Home 无恢复逻辑，导致两个方向都失效。

**修复**（3 处文件 + 1 处死代码清理）：

| 文件 | 修复内容 |
|------|----------|
| `PhotoDetail.tsx` | ① mount effect 从「restore」改为「scrollTo(0)」（详情页始终从顶部开始）；② `goToWork`/`goToGallery` 删除冗余 `saveScrollPosition()` |
| `Gallery.tsx` | 新增 mount effect 调用 `restoreScrollPosition()` 恢复列表位置 |
| `Home.tsx` | 同上；`handleWorkClick` 顺手用 `useCallback` 包裹（P3） |
| `useScrollRestore.ts` | 删除未被引用的 `useScrollRestore` 死代码函数 |
| `hooks/index.ts` | 更新导出（移除 `useScrollRestore`） |

**验证**：从 Gallery 滚动 → 点卡片进详情（从顶部开始）→ 返回（恢复原位置），逻辑链路完整。

### 4.2 P2-1：PhotoHero loaded/error 跨作品重置

在 `PhotoHero.tsx` 新增 `useEffect` 监听 `work.id`，切换作品时重置 `loaded`/`error`，避免上一张的加载态/错误态污染当前作品。

### 4.3 P2-2：PhotoActions like/favorite 跨作品重置

在 `PhotoActions.tsx` 新增 `useEffect` 监听 `work.id`，切换作品时重置 `isLiked`/`isFavorited`/`likeAnimating`/`lastAction`，避免点赞/收藏状态串位。

### 4.4 P3-1/2：favicon 404 + OG meta

- 新建 `public/favicon.svg`（深色底 #0a0a0f + 金色光圈 #d4a853，与品牌色一致）
- `index.html` 引用 `/favicon.svg`，新增 `og:type/title/description/image` 与 `twitter:card`

### 4.5 P3-3/4/5：死代码与冗余清理

- 删除 `mockData.ts` 中未被引用的 `navItems`
- 删除 `useScrollRestore` 死代码函数
- 删除 `WorkCard.tsx` 中 `handleClick` 的冗余 `preventDefault`

---

## 五、[VISUAL_LOCK] 标记项（本阶段不修改）

以下问题均已定位，但因**修复会改变已确认的视觉表现**，按 VISUAL FREEZE 规则记录不修：

| 编号 | 问题 | 为何 [VISUAL_LOCK] |
|------|------|-------------------|
| L1 | 首页 TagFilterBar 6 标签 vs Gallery 9 标签 | 补充标签会改变首页标签栏视觉 |
| L2 | Lightbox EXIF 漏 film 字段 | 加字段会改变 Lightbox 底部信息栏视觉 |
| L3 | 多处 `transition-all` | transition 明确列入视觉冻结清单 |
| L4 | WorkCard 无键盘可达 | 需引入 focus 视觉反馈 |
| L5 | 死链接 /favorites、/photographers、/help | 移除导航项会改变导航视觉 |

**建议**：L1–L5 均需用户明确授权后处理，或在对应 Phase（收藏夹/摄影师页属于 Phase 5+）实现页面时自然解决。

---

## 六、功能缺失（非 bug，记录不修）

| 项 | 说明 | 归属 |
|----|------|------|
| Lightbox 下载/分享死按钮 | 按钮存在但无 onClick，属未实现功能 | Phase 5+ |
| Gallery 加载更多 | 按钮无功能 | Phase 5+ |
| Footer 分类链接筛选 | 未读取 URL query 参数 | Phase 5+ |

以上均属「新功能实现」，非稳定化范围，避免扩大。

---

## 七、技术债（P3，记录不修）

| 编号 | 债务 |
|------|------|
| T1 | PhotoActions 多个 setTimeout 未清理（卸载时可能触发 setState，React 18 已安全 no-op） |
| T2 | Hero 主图无 fetchpriority / width-height |
| T3 | Gallery.tsx `text-h1` token 未定义（静默无效 class） |
| T4 | PhotoNavigation tablet 640-767 断点不一致 |
| T5 | preload Image 无引用；formatDate 无 memo；srcset 仅 2 档 |

---

## 八、工程验证

| 检查项 | 结果 |
|--------|------|
| `npm run build` | ✅ 通过，0 TS 错误（1519 modules） |
| `npm run lint` | ✅ 通过，0 errors / 0 warnings |
| favicon 产物 | ✅ dist/favicon.svg（252 字节） |
| index.html | ✅ 0.55KB → 0.94KB（OG meta 加入） |
| `any` 类型 | ✅ 0 处 |

---

## 九、修改文件清单

| 文件 | 修改类型 |
|------|----------|
| `src/pages/PhotoDetail.tsx` | 编辑（滚动恢复修复） |
| `src/pages/Gallery.tsx` | 编辑（新增 mount 恢复） |
| `src/pages/Home.tsx` | 编辑（新增 mount 恢复 + useCallback） |
| `src/lib/hooks/useScrollRestore.ts` | 编辑（删除死代码） |
| `src/lib/hooks/index.ts` | 编辑（更新导出） |
| `src/components/organisms/PhotoHero.tsx` | 编辑（跨作品重置） |
| `src/components/molecules/PhotoActions.tsx` | 编辑（跨作品重置） |
| `src/components/molecules/WorkCard.tsx` | 编辑（preventDefault 清理） |
| `src/data/mockData.ts` | 编辑（navItems 死代码删除） |
| `index.html` | 编辑（favicon + OG meta） |
| `public/favicon.svg` | 新增 |

---

## 十、VISUAL FREEZE 合规确认

| 保护项 | 结果 |
|--------|------|
| prototype.html 未修改 | ✅（Aug 15 12:02，35402B/833 行） |
| 未修改任何视觉 Token / CSS / Tailwind 配置 | ✅ |
| 未修改布局 / 间距 / 圆角 / 阴影 / 色彩 / 字体 | ✅ |
| 未修改 Home / Gallery / PhotoDetail 视觉 | ✅ |
| 未做「优化视觉 / 提升高级感 / 改善 UI」 | ✅ |
| 技术栈未变 | ✅ React 18 / TS 5 / Vite 5 / Tailwind 3.4 / Router 6 |

---

## 结论

**Phase 0–4 已达到稳定状态。** 唯一 P1 阻断缺陷（滚动恢复）已修复，2 项 P2 状态管理缺陷已修复，4 项 P3 工程问题已修复。全部修复通过 build + lint，且严格遵守 VISUAL FREEZE（零视觉改动）。

**5 项 [VISUAL_LOCK] 与 3 项功能缺失遗留，均需用户明确授权或进入对应 Phase 后处理。**
