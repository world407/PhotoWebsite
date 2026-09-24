# PHASE 5 — PRODUCT COMPLETION & TECHNICAL DEBT

# 影·迹 PHOTOGRAPHY 项目第五阶段施工总控指令

你现在正式接管「影·迹 PHOTOGRAPHY」项目的 Phase 5。

这是一个已经完成 Phase 0–4 并经过全量只读审计的 React + TypeScript + Vite + Tailwind 摄影网站。

==================================================  
一、项目当前状态
========

Phase 0：PASS  
Phase 1：PASS  
Phase 2：PASS  
Phase 3：PASS  
Phase 4：PASS

当前项目健康度：8.8 / 10。

npm run build：  
0 错误

npm run lint：  
0 errors / 0 warnings

TypeScript：  
strict  
any = 0

prototype.html：  
视觉 Source of Truth  
已经冻结

==================================================  
二、最高优先级规则
=========

【绝对禁止修改视觉】

prototype.html 是唯一视觉 Source of Truth。

从现在开始：

1. 禁止修改 prototype.html。
2. 禁止重新设计 Home。
3. 禁止重新设计 Gallery。
4. 禁止重新设计 Photo Detail。
5. 禁止修改现有 Design Tokens。
6. 禁止改变现有颜色。
7. 禁止改变字体。
8. 禁止改变字号层级。
9. 禁止改变圆角。
10. 禁止改变阴影。
11. 禁止改变已有动画。
12. 禁止改变已有页面布局。
13. 禁止为了“优化”而重新设计组件。
14. 禁止引入新的视觉语言。
15. 禁止增加新的颜色体系。
16. 禁止把已有页面改成另一种 UI 风格。

如果一个功能可以通过最小代码修改完成：

优先选择最小修改。

不要重构整个组件。

不要为了代码“更漂亮”而重写已经稳定的代码。

==================================================  
三、允许修改什么
========

本阶段只允许：

A. 功能补全  
B. Bug 修复  
C. 无视觉影响的工程质量优化  
D. 无视觉影响的性能优化  
E. Accessibility 修复  
F. SEO 技术优化  
G. URL 状态管理  
H. 错误处理  
I. 数据逻辑优化  
J. 路由补全

所有修改都必须保持现有视觉结果不变。

==================================================  
四、Phase 5 任务
============

请严格按照以下优先级执行。

---

## TASK 1 — Lightbox 下载

为 Lightbox 的下载按钮实现真实下载功能。

要求：

- 使用当前作品 fullUrl。
- 不改变按钮视觉。
- 不新增 UI。
- 不改变 Lightbox 布局。
- 处理下载失败。
- TypeScript strict。
- 不引入依赖。

---

## TASK 2 — Lightbox 分享

实现分享功能。

优先使用：

navigator.share

如果浏览器不支持：

navigator.clipboard.writeText()

复制当前照片 URL。

要求：

- 不改变现有 UI。
- 不新增复杂弹窗。
- 不改变视觉。
- 必须处理 API 不存在的情况。
- 不产生 console error。

---

## TASK 3 — Gallery 加载更多

让当前“加载更多”按钮真正工作。

注意：

当前数据是 Mock 数据。

不要伪造无限数据。

可以设计合理的分页/分批展示机制。

要求：

- 保持当前视觉。
- 不改变 Gallery 布局。
- 不修改 Masonry/Grid 视觉。
- 不修改筛选规则。
- 筛选、搜索、排序状态必须继续正确工作。

---

## TASK 4 — Footer 分类链接

让：

/gallery?tag=xxx

真正能够初始化 Gallery 的标签筛选状态。

要求：

- 使用 react-router。
- 不改变 Footer。
- 不改变 Gallery UI。
- 直接读取 URLSearchParams。
- 刷新页面后状态保持。
- 不影响现有搜索、排序、layout。

---

## TASK 5 — Favorites 页面

实现 /favorites。

重要：

不要重新设计网站。

必须继承现有：

- MainLayout
- Design Tokens
- WorkCard
- SectionHeader
- EmptyState
- Gallery 的视觉语言

当前没有后端。

因此收藏状态可以先使用 localStorage。

要求：

- 点赞/收藏状态统一。
- 页面刷新后收藏状态保持。
- 没有收藏时显示现有风格 Empty State。
- 收藏作品使用现有 WorkCard。
- 不引入状态管理库。
- 不改变现有 Home/Gallery/PhotoDetail 视觉。

---

## TASK 6 — Photographers 页面

实现：

/photographers

复用现有：

PhotographerCard  
PhotographerGrid  
MainLayout  
SectionHeader

使用现有 mockData。

不要重新设计。

---

## TASK 7 — Help 页面

实现：

/help

这是一个简单帮助页面。

内容包括：

- 网站基本使用方式
- Gallery 搜索
- 标签筛选
- Lightbox 操作
- Photo Detail 操作
- 键盘快捷键

视觉必须完全继承当前网站。

不要设计新的视觉系统。

---

## TASK 8 — 技术债修复

在不改变视觉的前提下处理：

T1 EXIF 双实现

优先考虑抽取可复用 EXIF 展示逻辑。

但：

不要为了抽象而过度重构。

必须保证 Lightbox 和 Photo Detail 最终显示一致。

特别检查 film。

---

T2 Gallery URL 状态

让以下状态可以通过 URL 表达：

tag  
search  
sort  
layout  
featured

要求：

- 浏览器刷新后恢复。
- 分享 URL 后可以恢复。
- 不破坏现有 Gallery 行为。

---

T3 PhotoActions setTimeout

检查 timer 是否需要清理。

如果确实需要：

使用 useEffect cleanup 或其他合理方式。

不要改变动画效果。

---

T4 Hero 图片性能

检查 Hero 主图：

- width
- height
- fetchpriority
- loading

只做确定的性能优化。

不能改变视觉。

---

T5 text-h1

检查：

Gallery.tsx

如果 text-h1 不存在：

使用现有合法 Design Token 替换。

不能改变最终视觉表现。

---

T6 Tablet 导航断点

检查 PhotoNavigation 在：

640–767px

之间的行为。

确保响应式逻辑一致。

不能改变设计规范。

==================================================  
五、继承的视觉风险
=========

以下问题可以修复，但必须采用“视觉等价修改”。

V1：首页 TagFilterBar 6 标签与 Gallery 9 标签不一致。

如果修复会明显改变首页视觉：

不要擅自修改。

先记录。

V2：Lightbox EXIF 缺少 film。

可以修复功能/信息一致性。

但必须保持现有 EXIF 布局视觉结构。

V3：transition-all。

可以在不改变实际动画效果的前提下拆分。

如果无法证明视觉等价：

不要修改。

V4：WorkCard 键盘可访问。

可以增加：

tabIndex  
role  
onKeyDown

但不要添加新的明显视觉元素。

focus 状态优先复用现有 focus-visible 规范。

V5：死链接。

Phase 5 应通过真正实现页面解决：

/favorites  
/photographers  
/help

==================================================  
六、严格禁止
======

禁止：

- 修改 prototype.html
- 重做 Home
- 重做 Gallery
- 重做 Photo Detail
- 改颜色
- 改字体
- 改 Design Token
- 改布局设计
- 改动画语言
- 引入 UI 库
- 引入状态管理库
- 引入新的 CSS 框架
- 大规模重构
- 删除已有稳定组件
- 替换 React
- 替换 Tailwind
- 替换 Router
- 升级依赖
- 为了“代码优雅”而重写大量代码

==================================================  
七、开发流程
======

每完成一个 Task：

1. 检查修改范围。
2. 检查 TypeScript。
3. 检查 lint。
4. 检查 build。
5. 检查是否影响视觉冻结。
6. 检查已有功能是否回归。

不要一次修改整个项目。

采用：

Task → 修改 → 验证 → 下一 Task

==================================================  
八、完成标准
======

最终必须：

npm run build  
成功

npm run lint  
0 errors  
0 warnings

any  
0

console  
0

TODO/FIXME  
0

prototype.html  
未修改

Home  
视觉不变

Gallery  
视觉不变

Photo Detail  
视觉不变

==================================================  
九、最终输出
======

Phase 5 完成后生成：

docs/PHASE5_COMPLETION_REPORT.md

报告必须包括：

1. 完成任务
2. 修改文件
3. 功能验证
4. build 结果
5. lint 结果
6. TypeScript 结果
7. 视觉冻结验证
8. 性能验证
9. 剩余技术债
10. 未完成事项
11. 下一阶段建议

重要：

不要自行进入 Phase 6。

Phase 5 完成后停止，等待下一条指令。

现在开始：

先读取当前项目实际源码。

不要修改代码。

先建立 Phase 5 执行清单。

然后按照 Task 1 → Task 8 顺序逐项执行。



