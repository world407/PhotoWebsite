# AGENTS.md - AI 开发规则

⚠️ **所有 AI Agent 在开始开发前必须阅读此文件。**

**封档状态**：Phase 0-3 COMPLETE | 下一阶段：Phase 4 - Photo Detail

---

## 第一条：Source of Truth

### prototype.html 是视觉唯一真实来源

- 所有颜色、字体、间距、圆角、阴影、动效以 `prototype.html` 为准
- 如果 React 实现与 prototype 有差异，以 prototype 为准
- **禁止修改 prototype.html**（除非是明确的设计变更）
- 做任何视觉修改前，先在浏览器打开 `prototype.html` 查看

```
浏览器打开: file:///c:/Users/26507/Desktop/PhotoWebsite/prototype.html
```

---

## 第二条：禁止事项

### ❌ 绝对禁止

1. **禁止重新设计已经完成的页面** - 首页 (/) 和 Gallery (/gallery) 已经封档
2. **禁止无理由更换技术栈** - React + TypeScript + Vite + Tailwind 不要动
3. **禁止删除已有功能** - 不要重构、移除、重写已工作的代码
4. **禁止重复实现已有组件** - 先检查 `src/components/` 目录
5. **禁止修改 prototype.html**
6. **禁止引入新的 CSS 框架、状态管理库、UI 组件库**
7. **禁止硬编码颜色值** - 使用 CSS Variables 或 Tailwind 主题色
8. **禁止使用 `any` 类型** - TypeScript Strict Mode

### ⚠️ 需要谨慎

- 修改全局样式前，确认不会破坏已有页面
- 修改现有组件前，理解它被哪些页面使用
- 添加新依赖前，先确认是否真的需要
- 引入新的设计 token 前，先看现有 token 是否够用

---

## 第三条：开发前必须做的事

### 1. 阅读顺序

新 Agent 接手时，**必须按顺序阅读**：

1. 本文档 `AGENTS.md` - 5分钟了解规则
2. `docs/AGENT_HANDOFF.md` - 完整交接信息
3. `docs/PHASE_STATUS.md` - 确认各 Phase 完成状态
4. `docs/PHASE_4_PLAN.md` - 当前阶段任务
5. 在浏览器打开 `prototype.html` 看视觉
6. `npm run dev` 启动项目，实际体验现有功能
7. 阅读源码，从 `src/App.tsx` 开始

### 2. 不要直接开始写代码

- 先理解现有代码结构
- 先理解设计系统
- 先理解组件分层
- 先确认要做的功能没有重复实现

---

## 第四条：开发规则

### 编码规则

1. **TypeScript Strict Mode**
   - 不要用 `any`
   - 所有组件 Props 必须定义接口
   - `npm run build` 必须零错误

2. **Atomic Design 分层**
   - `atoms/` - 基础不可拆分组件（Button, Icon, Tag）
   - `molecules/` - 原子组件组合（WorkCard, NavLink）
   - `organisms/` - 复杂功能区块（Hero, Lightbox, Gallery）
   - `layouts/` - 页面布局壳
   - `pages/` - 路由级页面
   - 新组件放到对应的目录

3. **组件规范**
   - 函数组件 + Hooks，不要类组件
   - Props 接口命名：`组件名Props`
   - 支持 className 透传
   - 图片必须有 alt 属性
   - 图标按钮必须有 aria-label

4. **样式规范**
   - 优先使用 Tailwind Utility Classes
   - 使用设计令牌：`bg-bg-base`, `text-accent`, `rounded-card` 等
   - 不要硬编码颜色：`#d4a853` → `bg-accent`
   - 自定义 CSS 写到 `globals.css`，不要写内联样式（动态值除外）
   - 使用 `@apply` 复用样式，不要重复写

5. **性能规则**
   - 图片必须 `loading="lazy"`（首屏除外）
   - 图片必须有 `srcset` 和 `sizes`
   - 必须用 CSS `aspect-ratio` 防止 CLS
   - 动画只用 `transform` 和 `opacity`（保证 60fps）
   - 大列表用 Intersection Observer
   - 使用 `useMemo`/`useCallback` 避免不必要重渲染

6. **响应式规则**
   - Mobile First 思维
   - 断点：`sm:` ≥640px, `md:` ≥768px, `lg:` ≥1024px, `xl:` ≥1280px
   - 手机：单列布局
   - 平板：两列布局
   - 桌面：三/四列布局
   - 必须测试 Chrome DevTools 设备模拟

7. **动效规则**
   - 时长：200-600ms
   - 缓动：`ease-smooth` (`cubic-bezier(0.4, 0, 0.2, 1)`)
   - 克制优雅，不要过度动画
   - 必须尊重 `prefers-reduced-motion`
   - 动效要有目的（引导注意力、反馈状态、页面过渡）

---

## 第五条：图片系统规则

摄影网站的核心是图片，必须遵守：

1. **响应式图片**
   ```tsx
   <img
     src={imageUrl}
     srcSet={`${url400} 400w, ${url600} 600w, ${url800} 800w, ${url1200} 1200w`}
     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
     loading="lazy"
     decoding="async"
     width={600}
     height={Math.round(600 / aspectRatio)}
     alt={title}
   />
   ```

2. **CLS 防止**
   - 必须设置 `width` 和 `height`
   - 或者使用 CSS `aspect-ratio`
   - 图片加载前显示颜色占位符（使用 Work 的 color 字段）
   - 使用 Shimmer 动画提供加载反馈

3. **不默认加载原图**
   - 列表/网格用中等尺寸（600-800w）
   - Lightbox 才加载大图（1200-1600w）
   - 相邻图片预加载±1张

---

## 第六条：视觉语言规则

保持摄影网站的高级感：

1. **图片是主角**
   - 过滤器/工具栏不能喧宾夺主
   - UI 元素用低对比度，图片用高对比度
   - 深色背景让图片更突出
   - 不要加过多装饰元素

2. **设计系统一致性**
   - 背景：近黑色 (#0a0a0f)
   - 强调：金色 (#d4a853)
   - 文本：白色主文本，灰色次要文本
   - 圆角：8px(图片) / 12px(按钮) / 16px(卡片) / 999px(胶囊)
   - 间距：4px 基准，8/12/16/20/24px

3. **交互反馈**
   - 按钮 hover：缩放 1.02 + 金色光晕
   - 卡片 hover：上浮 4px + 图片放大 1.05
   - 链接 hover：金色文字 + 下划线动画
   - 所有可点击元素必须有 hover 状态

---

## 第七条：测试规则

### 每次修改后必须测试

1. **TypeScript 检查**
   ```bash
   npm run build
   ```
   必须零错误。

2. **功能测试**
   - 点击所有按钮
   - 测试所有链接
   - 测试表单输入
   - 测试键盘操作（Tab/Enter/Esc/方向键）

3. **响应式测试**
   - Chrome DevTools 测试 iPhone 14 (390x844)
   - 测试 iPad (768x1024)
   - 测试桌面 (1920x1080)

4. **视觉测试**
   - 对照 prototype.html
   - 检查颜色、字体、间距、圆角
   - 检查 hover 状态
   - 检查加载状态

5. **控制台检查**
   - 无 JavaScript 错误
   - 无 React warning

---

## 第八条：Git 规则（如果使用 Git）

- 小步提交，每个提交一个功能点
- 提交信息清晰：`feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- 提交前确保 `npm run build` 通过
- 不要提交 node_modules、dist、.env

---

## 第九条：Phase 4 快速参考

**当前任务**：Phase 4 - Photo Detail 照片详情页

详细计划：`docs/PHASE_4_PLAN.md`

核心功能：
- `/photo/:id` 页面
- 大图展示
- EXIF 信息面板
- 摄影师信息卡片
- 点赞/收藏/分享
- 上一张/下一张导航
- 相关作品推荐
- 键盘快捷键

不要做：
- 不要重做 Gallery 或首页
- 不要引入后端
- 不要做评论系统
- 不要做用户系统

---

## 第十条：文档索引

| 文档 | 用途 |
|------|------|
| `AGENTS.md` | 本文档 - AI 开发规则（首先阅读） |
| `docs/AGENT_HANDOFF.md` | 完整交接文档 |
| `docs/PROJECT_STATUS.md` | 完整项目状态 |
| `docs/PHASE_STATUS.md` | Phase 0-3 完成状态 |
| `docs/PHASE_4_PLAN.md` | Phase 4 详细计划 |
| `docs/DESIGN_SYSTEM.md` | 设计系统（已有） |
| `docs/MOTION_SPEC.md` | 动效规范（已有） |
| `docs/RESPONSIVE_SPEC.md` | 响应式规范（已有） |
| `docs/COMPONENT_SPEC.md` | 组件规范（已有） |
| `prototype.html` | 视觉原型（Source of Truth） |

---

## 最后提醒

1. **先看文档，再写代码**
2. **先看 prototype，再做 UI**
3. **先看现有组件，再新建组件**
4. **小步修改，频繁测试**
5. **构建通过，才算完成**
6. **有疑问，看文档；文档没有，看代码；代码没有，看 prototype**

---

**Phase 0-3 已封档，从 Phase 4 开始。**
**祝开发顺利。**
