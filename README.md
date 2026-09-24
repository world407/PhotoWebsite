# 影·迹 PHOTOGRAPHY

高级个人摄影作品集网站，从 prototype.html 工程化而来。

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Lucide React (图标)

## 项目结构

```
src/
├── components/
│   ├── atoms/          # 原子组件
│   ├── molecules/      # 分子组件
│   ├── organisms/      # 布局组件
│   └── layouts/        # 页面布局
├── pages/              # 页面组件
├── styles/             # 全局样式
├── lib/
│   └── hooks/          # 自定义 Hooks
├── data/               # Mock 数据
└── types/              # TypeScript 类型定义
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 设计系统

基于 prototype.html 提取的设计 Tokens：

- **色彩**: 近黑底 (#0a0a0f) + 金色强调 (#d4a853)
- **字体**: Inter + PingFang SC / Microsoft YaHei
- **圆角**: 8px / 12px / 16px / 999px (pill)
- **动效**: 200-600ms，统一缓动 cubic-bezier(0.4, 0, 0.2, 1)

## 页面规划

- [x] Home (首页) - Phase 2
- [ ] Gallery (作品画廊) - Phase 3
- [ ] Photo Detail (照片详情) - Phase 4
- [ ] Projects (摄影专题) - Phase 5
- [ ] About (关于) - Phase 5
- [ ] Journal (摄影日志) - Phase 5
- [ ] Contact (联系) - Phase 5
- [ ] Admin (管理后台) - Phase 7
