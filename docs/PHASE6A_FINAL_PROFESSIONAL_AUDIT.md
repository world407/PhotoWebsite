你现在进入项目「影·迹 PHOTOGRAPHY」的 Phase 6B — Deployment Preparation（上线准备阶段）。

【项目当前状态】  
Phase 5 已 COMPLETE。  
Phase 6A 已完成专业级只读审计，结论为：

READY WITH CONDITIONS

当前：

- P0 = 0
- P1 = 0
- P2 = 0
- build = 0 errors
- lint = 0 warnings
- TypeScript strict
- any = 0
- TODO/FIXME = 0
- console.* = 0
- prototype.html 已冻结
- Design Token 已冻结
- 核心用户链路已完成
- 视觉系统已经最终冻结

当前唯一真正的上线条件：

1. SPA fallback
2. 正式域名确定后替换 example.com
3. 补充 canonical
4. 检查 robots.txt / sitemap.xml
5. 确认部署配置能够正确处理 React Router 路由

另外还有几个产品决策：

- Footer「隐私政策」目前为 #
- Footer 社交图标目前为 #
- Contact 页面邮箱需要确认

这些产品决策目前不要擅自修改。

==================================================  
【Phase 6B 核心目标】
===============

把当前项目整理到「可以正式部署」的状态。

注意：

这一阶段不是重新开发网站。

不是 Phase 6 功能开发。

不是 API 化。

不是后端开发。

不是上传系统。

不是登录系统。

不是视觉优化。

不是重新设计。

绝对不要为了“看起来更专业”而主动增加功能。

==================================================  
【最高优先级：视觉冻结】
============

prototype.html 是视觉冻结基线。

任何情况下：

禁止修改：

- prototype.html
- Design Token
- globals.css 中既有视觉 token
- tailwind.config.js 中既有视觉体系
- 首页布局
- Gallery 布局
- Photo Detail 布局
- Lightbox 布局
- Navigation 布局
- Footer 视觉
- 字体体系
- 颜色体系
- 圆角体系
- 阴影体系
- 动画体系

不要重新设计任何页面。

如果某项上线配置可以通过配置文件解决，优先配置文件解决。

==================================================  
【第一步：先只读检查】
===========

不要直接修改。

先检查：

1. 当前 package.json
2. 当前 Vite 配置
3. 当前 React Router 配置
4. 当前 public/
5. 当前 index.html
6. 当前 robots.txt
7. 当前 sitemap.xml
8. 是否存在部署配置
9. 是否存在 vercel.json / netlify.toml / \_redirects / nginx 配置等
10. 当前是否已经存在 SPA fallback
11. 当前是否已经存在 canonical
12. 当前 sitemap 中 example.com 的具体位置
13. 当前 robots.txt 中 sitemap 的具体情况

先判断项目实际使用的构建与部署方式。

不要假设平台。

==================================================  
【第二步：判断哪些事情现在能做】
================

严格区分：

A. 当前可以安全完成的事情

B. 必须等正式域名才能完成的事情

C. 必须由用户提供信息才能完成的事情

D. 不应该在 Phase 6B 修改的事情

例如：

没有正式域名时：

不要自己编造域名。

不要把 example.com 替换成随机域名。

不要猜用户的域名。

可以提前确保 sitemap / robots / canonical 的结构正确，但正式 URL 必须等待真实域名。

==================================================  
【第三步：处理 SPA Fallback】
=====================

如果已经明确知道部署平台：

根据实际平台配置 SPA fallback。

目标：

以下 URL 在生产环境刷新后不能出现服务器 404：

/  
/gallery  
/favorites  
/photographers  
/help  
/projects  
/about  
/journal  
/contact  
/photo/1  
/photo/2  
等所有 React Router 页面。

所有未知路由仍然应该最终交给 React Router 的 404 页面。

注意：

不要为了 SPA fallback 修改 React Router 本身。

优先通过部署平台配置解决。

如果当前无法确定部署平台：

不要擅自添加多个平台的配置。

记录：

「SPA fallback 待部署平台确认」。

==================================================  
【第四步：检查 SEO 配置】
===============

检查：

index.html

确认：

- title
- meta description
- viewport
- OG
- Twitter Card
- favicon

如果缺失且属于明显的部署必需项，可以补。

但是：

不要重新设计 SEO 文案。

不要修改现有视觉。

不要改变页面内容。

==================================================  
【第五步：canonical】
===============

如果没有正式域名：

不要伪造。

不要使用 example.com 作为正式 canonical。

记录：

canonical 等待正式域名。

如果项目已经存在 canonical：

检查它是否正确。

如果正式域名已经存在于项目配置中：

可以根据真实域名补 canonical。

==================================================  
【第六步：sitemap / robots】
======================

检查：

public/sitemap.xml  
public/robots.txt

确认：

- XML 格式合法
- URL 数量正确
- URL 与实际路由一致
- 不包含不存在的页面
- 不包含重复 URL
- robots.txt 格式正确

当前如果仍然使用：

<https://example.com>

不要擅自替换。

只有用户明确提供正式域名之后才替换。

==================================================  
【第七步：产品决策项】
===========

以下内容不要擅自决定：

1. Footer「隐私政策」
2. Footer 社交媒体链接
3. Contact 页面邮箱

目前如果没有真实目标：

保持现状。

不要：

- 编造社交账号
- 编造隐私政策 URL
- 编造邮箱
- 删除元素
- 改 Footer 布局

因为这些属于产品决策，而不是技术问题。

==================================================  
【第八步：构建验证】
==========

完成允许的修改后：

运行：

npm run build

然后：

npm run lint

要求：

build：  
0 errors

lint：  
0 errors  
0 warnings

同时检查：

- any
- TODO
- FIXME
- console.*
- @ts-ignore
- @ts-expect-error

不得因为 Phase 6B 引入新的问题。

==================================================  
【第九步：视觉冻结验证】
============

必须再次确认：

prototype.html：

未修改。

Design Token：

未修改。

检查至少：

- prototype.html 文件大小
- 行数
- 修改时间 / git diff（如果存在 git）
- globals.css
- tailwind.config.js

确认没有因为 Phase 6B 改动视觉系统。

==================================================  
【第十步：禁止事项】
==========

Phase 6B 禁止：

❌ API 化  
❌ 后端  
❌ 登录  
❌ 注册  
❌ 上传系统  
❌ 用户系统  
❌ 关注系统  
❌ 点赞后端持久化  
❌ 摄影师详情页  
❌ 无限滚动  
❌ SSR  
❌ SSG  
❌ 修改首页视觉  
❌ 修改 Gallery 视觉  
❌ 修改 Photo Detail 视觉  
❌ 修改 Lightbox 视觉  
❌ 修改 Navigation 视觉  
❌ 修改 Footer 视觉  
❌ 更换字体  
❌ 更换颜色  
❌ 增加新的 Design Token  
❌ 修改 prototype.html  
❌ 为了“优化代码”进行大规模重构  
❌ 擅自决定正式域名  
❌ 擅自伪造社交账号  
❌ 擅自伪造隐私政策链接  
❌ 擅自修改 Contact 邮箱

==================================================  
【执行原则】
======

遵循：

实际源码 > 旧文档 > 自己猜测

先检查。

再判断。

只有确定属于 Phase 6B 且低风险的修改才执行。

不确定的事情：

不要修改。

记录下来。

不要为了完成任务数量而制造修改。

==================================================  
【最终验收标准】
========

Phase 6B 完成后必须满足：

1. build 0 errors
2. lint 0 errors / 0 warnings
3. prototype.html 未修改
4. Design Token 未修改
5. 没有新增 P0/P1/P2
6. SPA fallback 已配置，或者明确记录「等待部署平台」
7. robots.txt 正确
8. sitemap.xml 正确
9. example.com 未被擅自替换
10. canonical 状态明确
11. 没有新增死链
12. 没有新增死按钮
13. 没有新增 any/TODO/FIXME/console
14. 没有进入 Phase 6+ 功能开发

==================================================  
【最终必须输出报告】
==========

完成后不要直接说“完成”。

请输出：

# PHASE 6B — DEPLOYMENT PREPARATION FINAL REPORT

必须包含：

## 1. 执行摘要

说明本阶段做了什么。

## 2. 修改文件

列出所有实际修改的文件。

如果没有修改，也必须明确写：

「本阶段未修改生产代码，仅完成审计/配置确认。」

## 3. SPA Fallback

说明：

- 是否已配置
- 配置在哪里
- 适用于哪个部署平台
- 如果未配置，为什么

## 4. SEO

分别报告：

- title
- description
- OG
- Twitter Card
- favicon
- canonical
- robots
- sitemap

## 5. Domain

明确：

- 当前正式域名是否已确定
- example.com 是否仍存在
- 是否需要用户下一步提供域名

## 6. Product Decisions

列出：

- 隐私政策
- 社交链接
- Contact 邮箱

不要自行决定。

## 7. Build

报告：

npm run build

结果：

PASS / FAIL

## 8. Lint

报告：

npm run lint

结果：

PASS / FAIL

## 9. Visual Freeze

明确确认：

prototype.html：  
UNCHANGED / CHANGED

Design Token：  
UNCHANGED / CHANGED

## 10. Remaining Blockers

只列真正阻塞上线的问题。

不要为了显得专业制造问题。

## 11. Recommended Next Step

只给出下一步真正必要的动作。

## 12. Final Status

只能从：

READY FOR DEPLOYMENT

READY WITH CONDITIONS

NOT READY

三个状态中选择。

不要自动进入 Phase 6C。

不要自动部署。

不要自动接入后端。

不要自动修改视觉。

==================================================

现在开始。

第一步只读检查当前项目。

检查完成后再决定是否需要修改。

整个 Phase 6B 必须以「最小修改、零视觉风险、可部署」为核心。

