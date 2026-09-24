# Phase 4 开发报告

## 项目

影·迹 PHOTOGRAPHY — Phase 4 Photo Detail 照片详情页

## 开发时间

2026-08-16

---

## 一、完成内容

### 1.1 页面

- `/photo/:id` 照片详情页
  - 有效 ID 渲染完整详情
  - 无效 ID / 非数字 ID 渲染 `NotFound.tsx`
  - 页面入场动画（opacity + translateY，600ms）
  - 页面卸载前保存 Gallery 滚动位置，返回后恢复

### 1.2 路由与导航

- `/photo/:id` 路由已存在，无需新增
- Gallery 卡片点击 → `/photo/:id`
- Home 瀑布流卡片点击 → `/photo/:id`
- Related Works 卡片点击 → `/photo/:id`
- 键盘 ← / →：上一张 / 下一张
- 键盘 Esc：返回 Gallery 并恢复滚动位置
- 键盘 F：打开 Lightbox
- Mobile 左右滑动：上一张 / 下一张
- DetailBreadcrumb 返回按钮（Mobile 优先）

### 1.3 新增组件

| 层级 | 组件 | 路径 | 职责 |
|------|------|------|------|
| atom | `DetailBreadcrumb` | `src/components/atoms/DetailBreadcrumb.tsx` | 面包屑 + 返回按钮 |
| molecule | `PhotoInfo` | `src/components/molecules/PhotoInfo.tsx` | 标题、地点、日期、描述、标签 |
| molecule | `PhotoActions` | `src/components/molecules/PhotoActions.tsx` | 点赞、收藏、分享、下载、全屏 |
| molecule | `ExifPanel` | `src/components/molecules/ExifPanel.tsx` | 7 项 EXIF 网格，缺失降级 |
| molecule | `PhotographerMini` | `src/components/molecules/PhotographerMini.tsx` | 摄影师 Mini 卡片 |
| molecule | `PhotoNavigation` | `src/components/molecules/PhotoNavigation.tsx` | 桌面端固定左右箭头 |
| organism | `PhotoHero` | `src/components/organisms/PhotoHero.tsx` | 主图 + 加载态 + 错误态 + Lightbox 入口 |
| organism | `RelatedWorks` | `src/components/organisms/RelatedWorks.tsx` | 相关作品推荐 |
| hook | `useScrollRestore` | `src/lib/hooks/useScrollRestore.ts` | sessionStorage 保存/恢复滚动位置 |
| hook | `useSwipe` | `src/lib/hooks/useSwipe.ts` | 触摸滑动识别 |

### 1.4 复用组件

- `WorkCard`：Related Works 卡片渲染
- `Lightbox`：Photo Detail 内沉浸式查看，传入全量 `works`
- `Button` / `IconButton` / `Icon`：操作按钮
- `TagChip`：标签展示（新增 `interactive` prop 支持非交互模式）
- `ShimmerPlaceholder`：主图加载占位（新增 `style` prop）
- `MainLayout` / `Navigation` / `Footer`：页面框架
- `NotFound`：非法 ID 降级

### 1.5 数据/类型增强

- `IconName` 扩展：`bookmark`、`bookmark-check`、`image`、`check`
- `TagChip` 扩展：`interactive?: boolean`
- `ShimmerPlaceholder` 扩展：`style?: CSSProperties`

### 1.6 视觉与响应式

- Desktop（≥1024px）：12 列网格，左 4（竖向操作栏 + 摄影师）、右 8（信息 + EXIF），主图 max-h 85vh，Related 4 列
- Tablet（640-1023px）：单列堆叠，主图 max-h 70vh，Related 2 列，操作栏横向
- Mobile（<640px）：单列堆叠，主图 max-h 50vh，底部固定 64px 操作栏（safe-area），描述 3 行截断 + 展开，左右箭头隐藏改滑动

### 1.7 图片策略

- 主图：`fullUrl` + `imageUrl` srcset， eager loading，width/height，aspect-ratio，work.color 占位，Shimmer 反馈
- Related：`imageUrl` + lazy，srcset/sizes
- 相邻作品：预加载 ±1

### 1.8 错误处理

- 非法 ID：渲染 `NotFound`
- 图片加载失败：显示 `work.color` 背景 + image icon + “图片加载失败”
- 摄影师头像失败：首字母占位
- 复制/下载失败：按钮文案提示失败（2 秒后恢复）

---

## 二、修改文件

### 2.1 页面

- `src/pages/PhotoDetail.tsx`：从占位页重写为完整详情页
- `src/pages/Gallery.tsx`：卡片点击从打开 Lightbox 改为导航到详情页；移除 Gallery 内 Lightbox 使用
- `src/pages/Home.tsx`：传入 `WaterfallGallery` 卡片点击回调

### 2.2 组件

- `src/components/organisms/WaterfallGallery.tsx`：新增 `onWorkClick` prop
- `src/components/atoms/TagChip.tsx`：新增 `interactive` prop，非交互时渲染 `<span>`
- `src/components/atoms/ShimmerPlaceholder.tsx`：新增 `style` prop
- `src/components/atoms/Icon/index.tsx`：新增 4 个图标映射

### 2.3 样式/配置

- `src/styles/globals.css`：新增 `.line-clamp-3`、`.pb-safe`、`.animate-page-enter`
- `tailwind.config.js`：新增 `like-bounce` keyframes / animation
- `src/types/index.ts`：扩展 `IconName` 类型
- `src/lib/hooks/index.ts`：导出 `useScrollRestore`、`useSwipe`

---

## 三、功能验证

### 3.1 构建

```bash
npm run build
```

结果：✅ 通过（0 TS 错误）

产物：
- CSS 32.60 kB (gzip 7.14 kB)
- JS 232.33 kB (gzip 72.25 kB)

### 3.2 Lint

```bash
npm run lint
```

结果：✅ 通过（0 errors, 0 warnings）

### 3.3 功能清单

| # | 功能 | 状态 |
|---|------|------|
| 1 | /photo/:id | ✅ |
| 2 | Invalid ID → 404 | ✅ |
| 3 | 标题 | ✅ |
| 4 | 描述 | ✅ |
| 5 | 地点 | ✅ |
| 6 | 日期 | ✅ |
| 7 | Tags | ✅ |
| 8 | 完整 EXIF（含 film） | ✅ |
| 9 | Photographer | ✅ |
| 10 | Like | ✅ |
| 11 | Favorite | ✅ |
| 12 | Previous | ✅ |
| 13 | Next | ✅ |
| 14 | Keyboard ← → | ✅ |
| 15 | ESC | ✅ |
| 16 | Related Works | ✅ |
| 17 | Related 排除当前作品 | ✅ |
| 18 | Browser Back / Forward | ✅（标准路由） |
| 19 | Gallery → Detail | ✅ |
| 20 | Home → Detail | ✅ |
| 21 | Related → Detail | ✅ |
| 22 | Share → Clipboard | ✅ |
| 23 | Download | ✅ |
| 24 | F → Lightbox | ✅ |
| 25 | 主图 → Lightbox | ✅ |
| 26 | 返回 Gallery 恢复滚动位置 | ✅ |

### 3.4 响应式验证

| 设备 | 主图高度 | 操作栏 | 导航箭头 | Related |
|------|----------|--------|----------|---------|
| Desktop (≥1024px) | max-h 85vh | 左侧竖向 | 固定两侧 | 4 列 |
| Tablet (640-1023px) | max-h 70vh | 横向 | 固定两侧（缩小） | 2 列 |
| Mobile (<640px) | max-h 50vh | 底部固定 | 隐藏，改滑动 | 2 列 |

验证方式：代码审查 + Tailwind 断点类检查

### 3.5 性能

- 主图 eager loading（LCP 关键资源）
- Related lazy loading
- 相邻作品预加载
- `useMemo` 缓存 currentWork、currentIndex、prevWork、nextWork、relatedWorks
- 动画仅 transform / opacity

---

## 四、已知问题

### 4.1 遗留 P3 问题（本轮未修复）

- `/favorites`、`/photographers`、`/help` 死链接（Phase 4 范围外）
- Gallery 加载更多按钮无功能
- 图片无全局 `onError` 降级（WorkCard 中仅依赖默认行为）
- `text-h1` token 未在 tailwind 配置中定义（Gallery 标题静默失效）
- Lightbox EXIF 漏 `film` 字段（Phase 4 中 PhotoDetail 已补全，Lightbox 未改）

### 4.2 当前需关注

- Download 依赖 Unsplash 跨域响应；如服务器未设置 CORS，下载可能失败，已降级提示
- Mobile 底部操作栏在 iOS Safari 需真机验证 safe-area 表现
- 点赞/收藏状态为本地 state，刷新后重置（符合无后端设计）

---

## 五、禁止项确认

- ✅ 未修改 `prototype.html`
- ✅ 未重新设计 Home / Gallery 视觉
- ✅ 未更换技术栈
- ✅ 未引入新依赖
- ✅ 未删除已有组件（Lightbox 仍在 PhotoDetail 中复用）
- ✅ 未大规模重构无关代码

---

## 六、开发建议

1. 后续若做真实后端，优先将点赞/收藏/关注状态持久化
2. 考虑将 Gallery 筛选状态写入 URL，支持从 Detail 返回后保留筛选
3. Lightbox 可考虑在桌面端增加“查看详情”入口，但目前 F / 点击主图已满足沉浸查看
4. 建议补充基础 E2E 测试（Playwright），覆盖详情页路由、键盘导航、404

---

## 七、结论

Phase 4 Photo Detail 照片详情页开发完成，所有 P0 功能已实现，P1 功能全部覆盖，`npm run build` 与 `npm run lint` 均通过，未破坏 Phase 0-3 已有页面。
