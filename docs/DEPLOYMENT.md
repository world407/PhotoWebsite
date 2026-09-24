# DEPLOYMENT — 影·迹 PHOTOGRAPHY 部署指南

> 本指南供部署阶段使用。当前项目为 React SPA（Vite 构建），需要满足以下条件方可正式上线。

## 当前状态（2026-08-17，Phase 6B）

| 项 | 状态 |
|----|------|
| 构建产物 | `npm run build` → `dist/`（含 index.html / assets / favicon.svg / robots.txt / sitemap.xml） |
| SPA fallback | **未配置**（待确定部署平台） |
| 正式域名 | **未确定**（sitemap 中 `example.com` 为占位，禁止擅自替换） |
| canonical | **未添加**（待正式域名） |
| robots.txt | 已就绪（Allow 全部；Sitemap 行注释待域名后启用） |
| sitemap.xml | 已就绪（27 个 URL，XML 合法；域名待替换） |

## 一、部署前置清单（按顺序执行）

### 1. 确定部署平台，配置 SPA fallback

React Router 使用 History 模式，所有路由（`/gallery`、`/photo/1` 等）在生产环境刷新时**必须**由服务器回退到 `index.html`，否则会返回服务器 404。选定平台后，按下表配置其一即可（**不要同时添加多个平台配置**）：

| 平台 | 配置 |
|------|------|
| Vercel | 根目录新建 `vercel.json`：`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` |
| Netlify | 根目录新建 `netlify.toml`：`[[redirects]] from = "/*" to = "/index.html" status = 200`（或 `public/_redirects` 写 `/* /index.html 200`） |
| Nginx | `try_files $uri $uri/ /index.html;`（location 块内） |
| GitHub Pages | 上传 `dist/` 到分支，并复制 `index.html` 为 `404.html`（GitHub Pages 无 rewrite，用 404 页兜底） |
| 其他静态托管 | 使用该平台的「Single Page App / 重写」功能，将 `/*` 指向 `index.html` |

> 所有未知路由（`/xxx` 不存在的路径）最终都会命中 React Router 的 `*` 路由，展示应用内 404 页面，无需额外配置。

### 2. 确定正式域名，替换占位

拿到正式域名后执行（**替换前请确认域名真实有效**）：

- `public/sitemap.xml`：将全部 `https://example.com` 替换为正式域名（共 27 个 `<loc>`，另有两处注释提醒可一并更新）。
- `public/robots.txt`：启用并填写 Sitemap 行：`Sitemap: https://<正式域名>/sitemap.xml`
- `index.html` `<head>` 内添加：`<link rel="canonical" href="https://<正式域名>/" />`

### 3. 重新构建并验证

```bash
npm run build
```

将 `dist/` 内容部署到平台。验证：

- 访问 `/`、`/gallery`、`/photo/1`、`/favorites` 等并**刷新**，确认无 404。
- 访问一个不存在的路径（如 `/not-exist`），确认展示应用内 404 页面。
- 浏览器查看源码，确认 title/description/OG 正常；`curl https://<域名>/robots.txt`、`/sitemap.xml` 可访问。

## 二、部署后建议

- 向搜索引擎提交 `sitemap.xml`（Google Search Console / Bing Webmaster）。
- 确认 HTTPS 生效（多数托管平台默认提供）。
- 图片全部来自 `images.unsplash.com` CDN，线上可用性依赖第三方（如追求完全自主，可改为自托管图片，属后续阶段）。

## 三、上线前产品决策（不属技术问题，需负责人确认）

1. Footer「隐私政策」——当前为 `#`，需提供真实页面地址或删除。
2. Footer 社交图标（微博/Instagram/Twitter）——当前为 `#`，需提供真实主页地址或移除。
3. Contact 页邮箱——当前为档案中的学校邮箱，需确认是否作为公开联系邮箱。
