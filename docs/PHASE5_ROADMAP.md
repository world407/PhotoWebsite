现在正式进入 Phase 5 — Batch 1：内容完整性与 Footer 修复。

【最高优先级规则】

1. prototype.html 是绝对视觉 Source of Truth。
2. 当前网站视觉已经冻结，严禁重新设计。
3. 严禁修改 prototype.html。
4. 严禁修改 Design Token。
5. 严禁新增颜色、字体、圆角、阴影体系。
6. 严禁改变现有首页、Gallery、Photo Detail 的布局、尺寸、间距、动画、hover、transition、视觉层级。
7. 所有修改必须优先采用「复用现有组件 + 现有 Token」的方式。
8. 如果某个修复可能改变视觉，请停止修改该项并记录，而不是自行改变设计。
9. 不允许顺手重构无关代码。
10. 不允许升级依赖。
11. 不允许修改 prototype.html。

【本批次目标】

根据最新 PHASE 5 ROADMAP，只处理以下内容：

一、补齐 4 个占位页面

需要完成：

- Projects.tsx
- About.tsx
- Journal.tsx
- Contact.tsx

要求：

- 删除所有类似「Phase 5 实现」「页面建设中」等占位文案。
- 使用项目当前已经存在的：  
  SectionHeader  
  Card  
  Button  
  StatItem  
  Typography Token  
  Layout  
  spacing  
  Design Token

不要重新设计页面。

内容要求：

- Projects：展示摄影项目/系列作品，可直接复用现有 works 数据。
- About：介绍摄影理念、创作方向、摄影师信息、统计数据。
- Journal：展示摄影日志/创作文章列表，可以基于现有数据创建本地静态内容。
- Contact：提供联系方式、合作说明、社交入口或联系信息。

注意：  
这些页面的目标是「内容完整、专业、可信」，不是重新设计视觉。

二、修复 Footer

处理：

- 帮助中心 → /help
- 分类链接 → /gallery?tag=xxx
- 使用 React Router 的 Link，而不是普通 <a>
- 删除或处理所有无意义的 href="#"
- 社交链接如果当前没有真实地址，不允许伪造真实 URL。

如果某个链接没有真实目标：  
优先提供合理的内部页面；  
如果确实无法实现，则必须明确记录，不允许留下点击后无任何行为的死链接。

三、保持视觉冻结

所有 Footer 修改必须保持：

- 原有布局
- 原有字体
- 原有颜色
- 原有间距
- 原有 hover
- 原有图标
- 原有动画
- 原有响应式行为

只能修改链接行为和内容。

【执行方式】

请先：

1. 检查相关源码。
2. 确认现状。
3. 制定最小修改方案。
4. 再开始修改。

修改完成后执行：

- npm run build
- npm run lint

并检查：

- prototype.html 是否完全未修改
- Design Token 是否未修改
- 是否产生新的 any
- 是否产生 TODO/FIXME
- 是否产生 console.*
- 是否产生死链接

【重要】

不要处理：

- P3-1 首页标签数量
- P3-2 transition-all
- API 化
- 后端
- 上传系统
- 用户系统
- 无限滚动
- SSR
- 大规模重构
- 视觉优化

这些全部留到后续阶段。

完成后不要继续自动进入 Batch 2。

请输出：

# PHASE 5 BATCH 1 FINAL REPORT

必须包含：

1. 修改文件
2. 每个文件具体修改内容
3. 4 个页面完成情况
4. Footer 修复情况
5. 视觉冻结检查
6. build 结果
7. lint 结果
8. 新增/修改的路由
9. 是否存在剩余死链接
10. 是否存在视觉风险
11. 剩余 Phase 5 任务
12. 最终 PASS / FAIL

只完成 Batch 1。

