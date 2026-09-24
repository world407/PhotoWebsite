# 影·迹 PHOTOGRAPHY 项目全景分析报告（供 AI 评估与升级方案输出）

> 本报告由 AI 代理基于源码逐文件核实后生成（截至 2026-09-24），目标是让未接触过本项目的 AI 在不读代码的情况下准确理解项目现状，并输出升级/重构方案。所有数据均来自实际代码与构建产物，非估算。

---

## 1. 项目定位与一句话现状

一个**纯前端**的深色系摄影作品展示社区（中文界面），视觉对标 Unsplash/500px 的高级感。已完成：首页瀑布流、作品探索（筛选/排序/搜索）、照片详情（EXIF/点赞/收藏/Lightbox/相关推荐）、摄影师列表、收藏夹页，以及本轮新增的**本地用户体系**（注册/登录、三步上传向导、个人主页）。无任何后端，所有数据为 mock + 浏览器本地存储（localStorage + IndexedDB）。

- 视觉唯一真实来源：`prototype.html`（禁止修改；UI 还原度是验收硬指标）
- 开发规则文档：`AGENTS.md`（根目录，AI 开发必读）
- 历史阶段文档：`docs/` 下 34 份（PHASE0~6B 各阶段报告、设计系统/动效/响应式/组件规范）

## 2. 技术栈（package.json 实际版本）

| 类别 | 选型 | 版本 |
|---|---|---|
| 框架 | React | 18.2 |
| 路由 | react-router-dom | 6.22 |
| 语言 | TypeScript（**Strict Mode，禁 any**） | 5.2 |
| 构建 | Vite | 5.1 |
| 样式 | Tailwind CSS + 全局 CSS 变量设计令牌 | 3.4 |
| 动效 | motion (framer-motion 后继)、gsap | motion 13.4 / gsap 3.15 |
| WebGL | ogl、vgpu | ogl 1.0.11 / vgpu 0.5 |
| 图标 | lucide-react | 0.344 |

**零状态管理库、零 UI 组件库、零后端 SDK**。新增依赖受 AGENTS.md 严格限制。

## 3. 架构

### 3.1 分层（Atomic Design 严格分层）

```
src/
├─ components/
│  ├─ atoms/        # 14 个基础组件（Button/Icon/Logo/Magnet/WarmTooltip/ClickSpark…）
│  ├─ molecules/    # 24 个组合组件（WorkCard/GalleryToolbar/UploadDropzone/AuthModal 内表单…）
│  ├─ organisms/    # 18 个功能区块（Navigation/HeroSection/WaterfallGallery/AuthModal/Lightbox/…）
│  ├─ layouts/      # MainLayout（Navigation+Footer+FloatingActions+MobileDock+全局AeroShards背景）
│  └─ react-bits/custom/  # 8 个自主实现动效组件（本轮新增，文件头均标注"自主实现，非源码组件"）
├─ pages/           # 13 个路由级页面
├─ lib/             # 数据与状态层（见 3.3）
├─ data/mockData.ts # mock 作品/摄影师数据
├─ types/index.ts   # 全局类型（Work/Photographer/ExifData…）
└─ styles/globals.css  # 设计令牌 + 组件样式 + 响应式覆写
```

### 3.2 Provider 嵌套与路由（App.tsx）

```
Router > ToastProvider > AuthProvider > WorksProvider > FavoritesProvider > LikesProvider
  > MainLayout(13 条路由) + AuthModal(全局单例)
```

路由：`/`、`/gallery`、`/photo/:id`、`/favorites`、`/photographers`、`/help`、`/projects`、`/about`、`/journal`、`/upload`、`/profile`、`/contact`、`*`→NotFound。

### 3.3 数据层（lib/，本轮工作核心）

| 模块 | 机制 | 持久化 |
|---|---|---|
| `auth.ts` + `AuthProvider` | localStorage 键 `photo_users`、`photo_session`；用户 id 从 1000 起；用户名正则 `/^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/`，密码≥6 位；无任何加密（明文存 localStorage，演示用） | ✅ |
| `works.ts` + `WorksProvider` | `[...userWorks, ...mockWorks]` 合并；用户新作品 id = **负整数** `-Date.now()`；likes/views 初始 0；先写 IndexedDB 再 setState | IDB store `images` |
| `storage.ts` | IndexedDB 封装，stores：`images`（作品压缩图）、`avatars`（用户头像） | ✅ |
| `image.ts` | `compressImage`（长边 1600 JPEG）、`compressAvatar`（256px 正方裁剪）；透明 PNG 铺白底；aspectRatio = width/height | — |
| `FavoritesProvider` | localStorage 键 `photo_favorites`，数字 id 数组 + 类型过滤 + try/catch 容错 | ✅ |
| `LikesProvider` | localStorage 键 `photo_likes`（本轮从纯内存态修复为持久化，模式与 Favorites 一致） | ✅ |
| `ToastProvider` | 全局 toast 队列 | 内存 |

**消费点现状**：Gallery、PhotoDetail、Favorites、RelatedWorks、PhotographerMini 等已切换 `useWorks()`（可读用户作品）；**WaterfallGallery（首页瀑布流）与 Projects 页刻意未切换**（封档红线：首页视觉不许动）。

### 3.4 图片体系

- 列表用 Unsplash 带 `w` 参数的 srcset（400/600/800/1200w）+ `sizes`；data:/blob: 内联地址有正则守卫跳过 srcset
- 全部 `loading="lazy"`（详情主图 eager）+ `decoding="async"` + `width/height` 或 CSS `aspect-ratio` 防 CLS
- 加载前显示 work.color 色块 + Shimmer
- 上传图片压缩至长边 1600 后以 dataURL 存 IDB（注意：**dataURL 体积大，是已知瓶颈**）

## 4. 用户体系功能细节（本轮新增，已全部验收）

### AuthModal（organisms/AuthModal.tsx）
- 登录/注册分段器；用户名/密码/昵称（仅注册）；密码显隐切换
- 错误提示金色（品牌色，非红色）；按钮 spinner 加载态；底部"本地演示"声明
- 入场动效：淡入上移 + 表单项错峰；内建 Esc 关闭、Tab 焦点陷阱、滚动锁、焦点归还、backdrop 点击关闭
- 支持 `openAuthModal(redirectPath)`——从受保护入口触发登录成功后自动续跳（如 /upload）

### Upload 三步向导（pages/Upload.tsx）
1. **选图**：拖拽高亮（DropzoneGlow：金色边框+背景微染）或点击选择；20MB 限制；自动压缩；处理中骨架屏；尺寸标注
2. **填写**：标题 40 字必填（实时字数）、描述 500 字、标签（回车/逗号/粘贴拆分添加，最多 8 个、单标签 12 字、Backspace 删末个）、地点、8 个分类胶囊、可折叠 EXIF 表单（相机/镜头/光圈/快门/ISO/焦段）
3. **预览发布**：大图 + 作者侧栏 + EXIF → 发布写 IDB → toast「发布成功」→ 跳转 `/photo/{负id}`
- 游客访问显示引导卡（不自动弹窗）；步骤切换水平微移转场

### Profile（pages/Profile.tsx）
- ProfileHeader：AvatarGlow 呼吸光晕头像 + 文字/统计错峰入场；编辑资料弹窗（头像压缩/昵称 20 字/简介 120 字）；退出登录
- 三 Tab（我的作品/我的收藏/我的点赞），role=tablist 无障碍 + TabCrossfade 180ms 交叉淡入；空态带跳转 CTA
- 刷新后：会话、资料、头像（IDB）、作品（IDB）、收藏、点赞全部持久

## 5. 动效系统（全站统一规范）

- 令牌：`--duration-fast 200ms` ~ `--duration-slower 400ms`、`--ease-smooth cubic-bezier(0.4,0,0.2,1)`、`--ease-out`
- 硬规则：仅 transform/opacity（GPU 加速）、150–300ms、`prefers-reduced-motion` 全局降级（globals.css 有通配 `animation-duration: 0.01ms` 兜底，且每个自主动效组件有显式静态分支）
- `react-bits/custom/` 8 组件（零新增依赖，props 接口对齐 React Bits 便于日后换源码）：ModalTransition（含焦点陷阱/滚动锁）、StaggerItems/StaggerItem、StepTransition、DropzoneGlow、ChipPop、TabCrossfade、AvatarGlow、AnimatedList
- 视觉增强（封档）：AeroShards WebGL 碎片背景（ogl，fixed 层 z-[-1]）、RippleDistortion 详情图涟漪（WebGL 失败自动降级原图）、SpotlightCard、Magnet 磁吸按钮、ClickSpark

## 6. 质量基线（实测）

- `tsc --noEmit` 零错误；`eslint --max-warnings 0` 零警告；`vite build` 通过
- 产物：JS 834 kB（gzip 272 kB）、CSS 55.6 kB（gzip 11 kB）——**JS 超过 500 kB 警告线，未做代码分割**
- 浏览器全流程验证通过：注册→登录→上传→发布→详情→收藏→点赞→编辑资料→整页刷新持久化→退出；桌面 1440 / 移动 390×844 / reduced-motion 三态实测；console 零业务错误

## 7. 已知限制与技术债（升级方案的原始输入）

| # | 类别 | 现状 | 影响 |
|---|---|---|---|
| 1 | 架构 | 纯前端、无后端；用户体系/作品存 localStorage+IDB，仅单浏览器可见 | 无法多设备/多人互通，"社区"仅演示 |
| 2 | 安全 | 密码明文存 localStorage；无 HTTPS/鉴权概念 | 仅演示可接受；真实化必须换方案 |
| 3 | 图片存储 | 作品图以 dataURL 存 IDB（长边 1600 JPEG 仍可达数百 KB~2MB/张） | IDB 容量压力、无法 CDN 分发；Lightbox 大图=原图 dataURL |
| 4 | 构建产物 | 834 kB 单 chunk，无路由级 code-splitting、无 manualChunks | 首屏 TTI 偏大；lucide/motion/gsap/ogl 全打进主包 |
| 5 | 数据一致性 | 点赞数（work.likes）是 mock 静态值，用户点赞只改本地 likedIds，不回写作品数据；"获赞"统计=用户作品 mock likes 之和（恒 0 起步） | 社区数据闭环断裂 |
| 6 | 首页一致性 | WaterfallGallery/Projects 未接 useWorks（刻意封档） | 用户发布的新作品不出现在首页 |
| 7 | 图片加载 | Unsplash 外链依赖（有 ERR_BLOCKED_BY_ORB/断网风险）；无本地资源池 | 断网/防火墙环境体验受损 |
| 8 | 可访问性 | 已覆盖 aria-label/aria-pressed/焦点管理/键盘操作；未做系统性 WCAG 审计 | 中等 |
| 9 | 测试 | 零自动化测试（无 vitest/jest/playwright），质量靠手工+门禁脚本 | 回归成本高 |
| 10 | SEO/PWA | SPA 无 SSR/预渲染；无 service worker、无 PWA manifest | SEO 弱、不可离线 |
| 11 | 视觉细节 | PhotoDetail 滚动 0–80px 头部透明期与面包屑的间距已修复；两列瀑布流断点行为（640–1023px 双列）符合设计 | 已清零，无遗留 bug |
| 12 | 文档 | docs/ 有 34 份阶段文档，但无 README 级别的快速上手 | 新协作者上手成本 |

## 8. 封档红线（升级方案必须遵守的约束）

1. **禁止修改 `prototype.html`**——它是视觉唯一真实来源
2. 首页 `/` 与 `/gallery` 视觉已封档，禁止重设计；WaterfallGallery/Projects 不切数据源
3. 禁止引入新 CSS 框架/状态管理库/UI 组件库；新增 npm 依赖需强理由
4. TypeScript Strict、禁 any、`npm run build` 必须零错误
5. Atomic Design 分层：新组件进对应 atoms/molecules/organisms 目录
6. 颜色一律走 CSS 变量/Tailwind token（禁硬编码 `#d4a853` 类色值）
7. 图片必须：lazy（首屏除外）+ srcset/sizes + aspect-ratio 防 CLS
8. 动效：transform/opacity only、150–300ms、必须 reduced-motion 降级
9. 移动优先断点：sm 640 / md 768 / lg 1024 / xl 1280

## 9. 升级候选方向（仅列事实维度，方案请输出方自行设计）

以下为第 7 节技术债对应的可选升级轴，供方案作者权衡：

- **数据真实化**：静态托管 + BaaS（Supabase/Firebase 类）vs 轻后端（Node/Cloudflare Workers）——涉及第 1/2/5 条
- **图片管线**：IDB dataURL → 对象存储 + CDN URL；保留压缩前置；EXIF 自动解析已有 `lib/exif.ts` 雏形——涉及第 3/7 条
- **性能**：React.lazy 路由分割 + manualChunks（motion/gsap/ogl 拆分）+ 资源预加载——涉及第 4 条
- **工程化**：Vitest 组件测试、Playwright 关键链路 E2E、CI 门禁——涉及第 9 条
- **分发**：vite-ssg/预渲染 or PWA——涉及第 10 条
- **体验增强**：用户作品进首页流（需与红线 2 协调：可只加"新作品"入口不改视觉）、评论/关注（当前无）、搜索历史、图片懒加载策略微调

## 10. 快速上手（给要跑代码的 AI/人）

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc && vite build（门禁：零错误）
npm run lint     # eslint --max-warnings 0（门禁：零警告）
```

- 测试账号：`testuser01` / `123456`（昵称"测试摄影师"，或自行注册任意新号）
- 本地数据重置：DevTools → Application → Clear storage（清 localStorage + IndexedDB）
- 关键阅读顺序：`AGENTS.md` → 本文档 → `src/App.tsx` → `src/lib/works.ts` → `prototype.html`（浏览器打开）
