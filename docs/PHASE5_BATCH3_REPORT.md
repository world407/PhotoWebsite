# PHASE 6A — 最终专业级验收 + 上线前 Hardening

你现在进入项目的「Phase 6A：最终专业级验收 / 上线前检查」阶段。

项目：影·迹 PHOTOGRAPHY

你的任务不是继续设计网站，也不是主动增加功能。

你的唯一目标：

> 对当前 Phase 0–5 已完成的整个项目进行一次最终、系统、专业级的上线前验收，找出真正影响上线质量的问题，并给出是否可以进入正式部署的结论。

==================================================  
一、最高优先级规则：视觉冻结
==============

⚠️ 这是整个任务最重要的规则。

prototype.html 是项目视觉 Source of Truth。

从现在开始：

1. 严禁修改 prototype.html
2. 严禁修改 Design Token
3. 严禁重新设计任何页面
4. 严禁改变现有页面布局
5. 严禁改变颜色
6. 严禁改变字体
7. 严禁改变字号
8. 严禁改变间距体系
9. 严禁改变圆角
10. 严禁改变阴影
11. 严禁改变已有动画
12. 严禁改变 hover / transition 的视觉表现
13. 严禁为了“优化”而重新排列页面元素
14. 严禁增加新的视觉设计体系
15. 严禁把当前页面改成你认为“更好看”的样子

如果发现问题涉及视觉：

→ 只记录  
→ 不修改  
→ 标记为「视觉冻结项」

任何功能修复都必须满足：

> 修复前后视觉表现完全一致。

==================================================  
二、当前项目状态
========

Phase 0–4：  
✅ COMPLETE

Phase 5：  
✅ Batch 1 COMPLETE  
✅ Batch 2 COMPLETE  
✅ Batch 3 COMPLETE

当前已知状态：

- P0：0
- P1：0
- P2：0
- Build：0 errors
- Lint：0 warnings
- any：0
- TODO：0
- FIXME：0
- console.*：0
- prototype.html：冻结
- Design Token：冻结

已经完成：

- 4 个占位页面
- Footer 链接修复
- 死按钮处理
- WorkCard 键盘与收藏
- Lightbox 分享/下载反馈
- Esc 导航逻辑
- 点赞跨实例同步
- 摄影师数据补全
- SEO 基础设施
- Accessibility 基础检查
- useMemo 性能优化
- robots.txt
- sitemap.xml
- Help heading 层级
- Toast aria-live

==================================================  
三、Phase 6A 第一阶段：只读全项目审计
=======================

首先：

禁止修改任何代码。

先完整检查：

- src/
- public/
- package.json
- package-lock.json
- vite.config.*
- tsconfig.*
- eslint 配置
- tailwind.config.*
- index.html
- prototype.html
- 所有路由
- 所有页面
- 所有 components
- hooks
- providers
- data
- lib
- SEO 文件

以：

实际源码 > 构建结果 > 文档

作为最终判断依据。

不要因为旧文档写了什么就认为代码一定如此。

==================================================  
四、第二阶段：生产构建验收
=============

执行：

npm run build

npm run lint

并检查：

- TypeScript
- ESLint
- bundle size
- 是否存在异常 warning
- 是否存在动态 import 问题
- 是否存在路径问题
- 是否存在 production-only 风险

继续扫描：

- any
- TODO
- FIXME
- XXX
- HACK
- console.log
- console.error
- console.warn
- @ts-ignore
- @ts-expect-error
- eslint-disable

如果存在：

记录文件、行号、原因、严重程度。

不要为了清零而盲目修改。

==================================================  
五、第三阶段：路由与页面完整性
===============

逐个检查所有路由。

确认：

- 首页
- Gallery
- Photo Detail
- Favorites
- Photographers
- Help
- Projects
- About
- Journal
- Contact
- 404

检查：

1. 路由是否注册
2. 是否可以正常访问
3. 刷新后是否可能出现问题
4. 非法 URL 是否正确进入 404
5. `/photo/:id` 非法 ID 是否正确处理
6. 页面之间跳转是否正确
7. 是否存在死链
8. 是否存在错误 href
9. 是否存在 `#`
10. 是否存在无意义按钮

注意：

Footer 隐私政策、社交链接、Contact 邮箱等已知待确认项：

不要擅自决定。

只记录。

==================================================  
六、第四阶段：核心用户路径验收
===============

重点检查以下完整链路：

首页  
↓  
Gallery  
↓  
筛选  
↓  
搜索  
↓  
排序  
↓  
作品  
↓  
Photo Detail  
↓  
Lightbox  
↓  
上一张 / 下一张  
↓  
Related Works  
↓  
另一个 Detail  
↓  
Favorites  
↓  
返回 Gallery  
↓  
滚动位置恢复

逐项检查：

- URL 是否正确
- 状态是否正确
- 返回是否正确
- 前进是否正确
- 后退是否正确
- 滚动位置是否恢复
- 页面刷新是否正常
- 状态是否丢失
- 是否出现空白页
- 是否出现 React error
- 是否出现异常 console

==================================================  
七、第五阶段：交互完整性检查
==============

逐个检查所有可交互元素：

- Navigation
- Mobile Navigation
- Search
- User
- Upload
- Gallery filter
- Search
- Sort
- Layout
- Featured
- Load More
- WorkCard
- Favorite
- Like
- Share
- Download
- Lightbox
- Fullscreen
- Previous
- Next
- Escape
- Breadcrumb
- Footer
- Mobile Bottom Bar

每一个都判断：

A. 正常工作  
B. 有明确反馈  
C. 有合理失败处理  
D. 有 loading / success / failure（适用时）  
E. 没有死按钮  
F. 没有点击后无反应

不要仅仅根据代码存在就宣布“实机通过”。

如果没有真实浏览器验证：

明确写：

「源码验证通过，未完成浏览器实机验证」

绝对不要编造实机测试结果。

==================================================  
八、第六阶段：Accessibility 最终验收
=========================

检查：

- Tab 顺序
- Enter
- Space
- Escape
- ArrowLeft
- ArrowRight
- focus-visible
- aria-label
- aria-pressed
- aria-current
- aria-modal
- role
- heading hierarchy
- alt
- keyboard navigation
- screen-reader semantics
- Toast status
- reduced motion

特别检查：

- icon-only button
- clickable div
- nested interactive element
- modal focus
- Lightbox focus
- Mobile bottom bar

如果发现需要增加视觉性的 focus 样式：

禁止修改。

只记录为视觉冻结项。

==================================================  
九、第七阶段：响应式最终检查
==============

至少从源码和 CSS 逻辑检查：

375px  
390px  
640px  
768px  
1024px  
1280px  
1440px  
1920px

检查：

- 横向溢出
- 图片变形
- 文本溢出
- 按钮被遮挡
- fixed 元素覆盖内容
- safe-area
- Mobile Bottom Bar
- Lightbox
- Navigation
- Gallery
- Photo Detail
- Footer

如果环境支持真实浏览器：

优先进行真实 viewport 测试。

如果不支持：

必须明确标记：

「CSS 静态验证」

不能冒充真实设备测试。

==================================================  
十、第八阶段：性能最终验收
=============

检查：

- 图片 lazy loading
- eager loading
- fetchPriority
- srcset
- sizes
- width
- height
- aspect-ratio
- preload
- IntersectionObserver
- unnecessary rendering
- provider value memoization
- event cleanup
- timer cleanup
- bundle size

重点检查：

LCP  
CLS  
INP  
TTFB

如果当前环境具备 Lighthouse / Chrome DevTools / Performance：

实际测量。

如果不具备：

绝对不要编造数据。

必须写：

「未进行真实浏览器性能测量」

然后给出：

「源码级性能判断」。

==================================================  
十一、第九阶段：SEO 最终验收
================

检查：

- title
- meta description
- viewport
- OG
- Twitter Card
- canonical
- robots.txt
- sitemap.xml
- favicon
- 404
- URL 结构

特别检查：

sitemap.xml 中的：

example.com

如果项目还没有正式域名：

不要擅自替换。

标记：

「部署前必须替换正式域名」

检查 sitemap 是否：

- XML 合法
- URL 合理
- 覆盖正确页面
- 没有明显不存在的页面

==================================================  
十二、第十阶段：安全与生产环境 Hardening
=========================

检查：

- 是否存在硬编码 API Key
- 是否存在 token
- 是否存在密码
- 是否存在敏感信息
- `.env`
- `.env.example`
- gitignore
- public 文件
- localStorage 使用
- 外部资源
- 外部图片
- 用户输入
- URL 参数
- XSS 风险
- dangerouslySetInnerHTML
- eval
- Function()
- 不安全的 HTML 注入

如果发现任何真实密钥：

立即标记为 P0/P1。

不要把密钥内容写进最终报告。

==================================================  
十三、第十一阶段：第三方依赖检查
================

检查 package.json：

- 运行时依赖
- devDependencies
- 是否存在明显无用依赖
- 是否存在重复依赖
- 是否存在严重版本风险
- 是否存在不必要的大型依赖

不要为了升级依赖而升级依赖。

除非存在明确阻断问题，否则：

只记录，不修改。

==================================================  
十四、第十二阶段：视觉回归保护
===============

最终再次检查：

prototype.html

确认：

- 文件未修改
- 大小一致
- 行数一致
- 内容一致

同时检查：

globals.css  
tailwind.config.js

确认：

Design Token 未发生意外变化。

重点检查：

- colors
- fonts
- font sizes
- spacing
- radius
- shadows
- animations
- transitions

如果发现任何变化：

停止相关修改。

==================================================  
十五、禁止事项
=======

Phase 6A 默认：

禁止修改生产代码。

禁止：

- 重构
- 重写组件
- UI 优化
- 页面重新设计
- 换颜色
- 换字体
- 换布局
- 换动画
- 改 Design Token
- 修改 prototype.html
- 引入新 UI 库
- 引入新依赖
- 升级依赖
- 接后端
- 做 API
- 做登录
- 做上传系统
- 做数据库
- 部署上线

除非发现：

P0 / P1 阻断问题。

如果发现 P0/P1：

先停止。

在报告中说明：

问题 → 影响 → 文件 → 修复建议 → 视觉风险

不要直接修改。

==================================================  
十六、最终输出报告
=========

完成全部检查后，输出：

# PHASE 6A FINAL PROFESSIONAL AUDIT

必须包含：

## 1. 总体结论

- READY
- READY WITH CONDITIONS
- NOT READY

三选一。

## 2. 项目健康度

给出：

工程质量  
功能完整度  
交互可靠性  
Accessibility  
性能  
SEO  
安全  
视觉稳定性

分别评分。

## 3. P0/P1/P2/P3

分别列出。

## 4. 核心用户路径

逐项 PASS / FAIL。

## 5. Accessibility

逐项 PASS / FAIL / NOT TESTED。

## 6. Responsive

逐项 PASS / FAIL / STATIC VERIFIED。

## 7. Performance

明确区分：

源码验证  
真实浏览器验证

尤其：

LCP  
CLS  
INP  
TTFB

没有真实测量就必须写 NOT MEASURED。

## 8. SEO

逐项检查。

## 9. Security

逐项检查。

## 10. Visual Freeze

必须明确：

prototype.html：  
UNCHANGED / CHANGED

Design Token：  
UNCHANGED / CHANGED

## 11. Remaining Issues

把所有剩余问题分类：

- 必须上线前处理
- 建议上线前处理
- 可以接受
- Phase 6+
- Future
- 产品决策

## 12. Deployment Blockers

明确告诉项目负责人：

「现在是否可以部署？」

## 13. 最终建议

只给出真正必要的下一步。

不要为了“显得专业”而制造新的任务。

==================================================  
十七、最重要的工作原则
===========

你不是来“找问题越多越好”。

你的目标是：

> 判断这个项目是否已经达到可以正式展示 / 部署的专业级标准。

如果某个问题：

- 不影响用户
- 不影响功能
- 不影响安全
- 不影响性能
- 不影响 SEO
- 不影响可访问性
- 不影响视觉

则不要为了追求完美而强行修改。

尤其不要为了清理所谓“技术债”而破坏已经冻结的视觉系统。

最终目标：

> 用最少的修改风险，确认当前项目是否真正达到上线标准。

现在开始。

第一步：

只读审计整个项目。

禁止修改任何生产代码。

完成后输出完整：

# PHASE 6A FINAL PROFESSIONAL AUDIT REPORT
