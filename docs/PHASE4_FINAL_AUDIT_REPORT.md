# PHASE 5 PREPARATION — 项目下一阶段规划与任务拆解

你现在正式接管「影·迹 PHOTOGRAPHY」项目的 Phase 5。

重要前提：

Phase 0–4 已经完成并通过最终验收。

Phase 4 Final Audit 结论：

- Phase 0–4：COMPLETE
- build：0 errors
- lint：0 warnings
- any：0
- prototype.html：视觉 Source of Truth，已经冻结
- Home：冻结
- Gallery：冻结
- Photo Detail：冻结
- 不允许重新设计任何已经完成页面
- 不允许修改 prototype.html
- 不允许改变 Design Token
- 不允许为了“优化”而重新设计视觉

本阶段首先禁止修改任何生产代码。

==================================================  
一、你的第一任务：建立 Phase 5 计划
======================

请基于当前真实源码，而不是仅依据旧文档，对整个项目进行一次轻量级只读分析。

重点分析：

1. Phase 4 Final Audit 中记录的 P2/P3 问题
2. Phase 0–3 遗留问题
3. 当前仍然存在的功能缺失
4. 当前路由完整性
5. 收藏/点赞状态体系
6. 下载/分享能力
7. Gallery 加载更多
8. URL query 状态
9. /favorites
10. /photographers
11. /help
12. WorkCard 内嵌红心按钮
13. FloatingActions 上传作品按钮
14. Lightbox 分享/下载反馈
15. PhotoDetail 状态同步问题
16. Accessibility
17. SEO
18. 性能
19. 代码重复
20. 未来真实数据/API 化的可扩展性

==================================================  
二、视觉冻结是最高优先级
============

以下内容绝对禁止修改：

- prototype.html
- Home 页面视觉
- Gallery 页面视觉
- Photo Detail 页面视觉
- globals.css 中已有 Design Token
- Tailwind Design Token
- 颜色体系
- 字体体系
- 字号体系
- 圆角体系
- 阴影体系
- 已确认的动画语言
- 页面布局结构

尤其禁止：

“顺便优化一下视觉”  
“统一一下间距”  
“提升一下高级感”  
“重新设计按钮”  
“优化一下卡片”  
“调整一下颜色”  
“重新设计导航”  
“优化一下 Home/Gallery”

这些全部禁止。

如果某个功能修复可能改变视觉，优先选择：  
“功能实现但保持现有视觉完全不变”。

==================================================  
三、对问题进行优先级分类
============

请把发现的问题严格分成：

P0：  
阻断项目继续开发的问题

P1：  
必须优先解决的问题

P2：  
应该在 Phase 5 解决的问题

P3：  
可以延期的问题

TECH DEBT：  
技术债

FUTURE：  
未来 Phase 6+ 再做

不要为了追求“零问题”而制造工作量。

==================================================  
四、Phase 5 的目标
=============

Phase 5 不应该重新建设网站。

目标是：

“把已经完成的摄影网站，从功能完整的前端原型，推进到一个真正可以对外展示的专业级前端产品。”

优先级：

功能完整性

>

交互可靠性

>

可访问性

>

性能

>

SEO

>

代码质量

>

未来可扩展性

视觉不参与重新设计。

==================================================  
五、重点检查以下问题
==========

A. Phase 4 Final Audit 已知问题：

1. WorkCard 红心死按钮
2. FloatingActions 上传作品 FAB 无 onClick
3. Lightbox 分享失败没有反馈
4. Lightbox 下载失败没有反馈
5. Esc 返回逻辑是否需要统一

B. Phase 0–3 遗留：

1. 首页标签与 Gallery 标签不一致

注意：  
如果修改会改变首页视觉，则不要修改。

1. transition-all 技术债

注意：  
如果无法证明修改不会改变视觉，则暂缓。

C. 功能完善：

1. Gallery 加载更多
2. Gallery URL query 筛选
3. Footer 分类链接
4. Favorites
5. Photographers
6. Help

D. 状态体系：

1. 点赞状态是否跨组件一致
2. 收藏状态是否跨页面一致
3. localStorage 状态是否可靠
4. PhotoDetail → Gallery → Detail 状态是否保持
5. 刷新后状态是否保持

E. UX：

1. 空状态
2. Error 状态
3. Loading 状态
4. 键盘操作
5. 移动端触控
6. 浏览器前进/后退
7. Scroll Restoration

F. SEO：

1. title
2. description
3. OG
4. canonical
5. sitemap
6. robots
7. Photo Detail 独立 URL

G. 性能：

1. 首屏图片
2. 图片请求
3. lazy loading
4. preload
5. bundle
6. CLS
7. LCP
8. unnecessary re-render

==================================================  
六、输出 Phase 5 Roadmap
====================

最终输出：

# PHASE 5 ROADMAP

包括：

1. Phase 5 总目标
2. 当前项目健康度
3. P0/P1/P2/P3 问题列表
4. 技术债列表
5. 功能缺失列表
6. 推荐解决顺序
7. 每项修改涉及哪些文件
8. 哪些修改风险低
9. 哪些修改可能影响视觉
10. 哪些问题应该延期
11. Phase 5 完成标准
12. Phase 6 建议方向
13. 最终专业级项目应该达到什么状态

==================================================  
七、最重要的执行规则
==========

本次只读。

禁止：

- 修改代码
- 修改 prototype.html
- 修改 Design Token
- 删除文件
- 引入依赖
- 重构 Home
- 重构 Gallery
- 重构 Photo Detail

只分析、规划、排序。

最后明确告诉我：

“Phase 5 最值得现在做的 3–5 件事是什么？”

不要为了显得工作量大而制造任务。

项目目标不是代码越多越好，而是：  
在不破坏现有视觉的前提下，让「影·迹 PHOTOGRAPHY」真正达到专业级前端作品集网站的完成度。

