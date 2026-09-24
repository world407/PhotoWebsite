import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
