import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 配置
 * - 测试目录：e2e/（与 Vitest 单测 src/** 隔离）
 * - 每个用例独立浏览器上下文：localStorage / IndexedDB 天然隔离
 * - webServer 自动拉起 Vite dev（5174 端口，避免与本地开发冲突）
 */
const PORT = 5174;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/playwright',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    locale: 'zh-CN',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
