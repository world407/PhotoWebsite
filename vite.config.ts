import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { works, photographers } from './src/data/mockData'
import { journalPosts, journalDateToIso } from './src/data/journal'

// 部署后改为实际站点域名（含协议、不带尾斜杠）；sitemap / RSS 的绝对链接依赖它
const SITE_URL = 'https://world407.github.io/PhotoWebsite'

// GitHub Pages 对目录 URL 会 301 到带尾斜杠的形式（/photo/1 → /photo/1/），
// sitemap / RSS 直接给出最终地址，避免爬虫多一跳重定向
const canonical = (u: string) => (u === '/' ? u : `${u.replace(/\/$/, '')}/`)

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string,
  )

const buildSitemap = () => {
  const urls = [
    '/',
    '/gallery',
    '/photographers',
    '/journal',
    '/projects',
    '/favorites',
    '/upload',
    '/profile',
    '/about',
    '/contact',
    '/help',
    ...works.map((w) => `/photo/${w.id}`),
    ...photographers.map((p) => `/photographers/${p.id}`),
    ...journalPosts.map((p) => `/journal/${p.id}`),
  ]
  const body = urls.map((u) => `  <url><loc>${SITE_URL}${canonical(u)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

const buildRobots = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`

const buildRss = () => {
  const items = journalPosts
    .map(
      (p) => `  <item>\n    <title>${escapeXml(p.title)}</title>\n    <link>${SITE_URL}${canonical(`/journal/${p.id}`)}</link>\n    <guid isPermaLink="true">${SITE_URL}${canonical(`/journal/${p.id}`)}</guid>\n    <pubDate>${new Date(journalDateToIso(p.date)).toUTCString()}</pubDate>\n    <description>${escapeXml(p.excerpt)}</description>\n  </item>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>影·迹 PHOTOGRAPHY — 摄影日志</title>\n  <link>${SITE_URL}/journal</link>\n  <description>创作手记与拍摄故事</description>\n  <language>zh-CN</language>\n${items}\n</channel></rss>\n`
}

/**
 * 构建期生成 robots.txt / sitemap.xml / RSS feed.xml（零依赖）；
 * dev 阶段通过中间件提供同名路径，便于 E2E 断言与本地检查。
 */
function seoFilesPlugin(): Plugin {
  const files = [
    { name: 'sitemap.xml', type: 'application/xml; charset=utf-8', body: buildSitemap },
    { name: 'robots.txt', type: 'text/plain; charset=utf-8', body: buildRobots },
    { name: 'feed.xml', type: 'application/rss+xml; charset=utf-8', body: buildRss },
  ]
  return {
    name: 'seo-files',
    generateBundle() {
      for (const f of files) {
        this.emitFile({ type: 'asset', fileName: f.name, source: f.body() })
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files.find((f) => req.url?.split('?')[0] === `/${f.name}`)
        if (!file) return next()
        res.setHeader('Content-Type', file.type)
        res.end(file.body())
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), seoFilesPlugin()],
  // GitHub Pages 项目页部署在 /PhotoWebsite/ 子路径下：
  // 仅部署构建时通过环境变量注入（CI 的 deploy job），dev / E2E / 默认构建保持 '/'
  base: process.env.BASE_PATH || '/',
  // 仅 vite-react-ssg CLI 读取；原生 vite build / dev 忽略此字段，CSR 流程不受影响。
  // nested：每路由输出 目录/index.html，GitHub Pages 才能用无扩展名 URL 访问（/photo/1）
  ssgOptions: {
    entry: 'src/main-ssg.tsx',
    dirStyle: 'nested',
    formatting: 'none',
    // framer-motion 的 useTransform 在 render 期访问 window，用 jsdom 注入浏览器全局
    mock: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // 注意：lucide-react / react-router-dom 名称含 "react"，需优先匹配
          if (id.includes('lucide')) return 'vendor-icons'
          if (id.includes('react-router')) return 'vendor-router'
          // motion 依赖 react，拆开会产生循环 chunk，合并为核心运行时
          if (id.includes('react') || id.includes('scheduler') || id.includes('motion')) return 'vendor-react'
          if (id.includes('ogl') || id.includes('vgpu')) return 'vendor-webgl'
        },
      },
    },
  },
})
