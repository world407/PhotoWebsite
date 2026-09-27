import { test, expect } from '@playwright/test';

/**
 * 视觉回归守卫：保护已封档页面（/ 与 /gallery）的视觉不被无意改动。
 *
 * 仅本地执行：基线截图按平台生成（文件名含 -win32 后缀），GitHub Actions
 * 的 Linux 字体渲染与本地不一致，跨平台维护基线成本过高（后续如需 CI 守卫，
 * 可用 Docker 化的 playwright 容器统一渲染环境再放开）。
 *
 * 首次生成基线或有意的设计变更后，请执行：
 *   npx playwright test visual-regression --update-snapshots
 * 并在提交信息中注明"视觉基线更新"。
 */
// 注意：不能用 process.env.CI 判断——部分本地环境（如 agent 沙箱）也会置位 CI；
// 本仓库唯一 CI 是 GitHub Actions，用其专属变量精确判断
test.skip(!!process.env.GITHUB_ACTIONS, '视觉回归仅在本地执行（基线按平台生成，CI 字体渲染环境不同）');

const SEALED_PAGES = [
  { path: '/', name: 'home' },
  { path: '/gallery', name: 'gallery' },
];

const VIEWPORTS = [
  { suffix: 'desktop', width: 1440, height: 900 },
  { suffix: 'mobile', width: 390, height: 844 },
];

for (const { path, name } of SEALED_PAGES) {
  for (const { suffix, width, height } of VIEWPORTS) {
    test(`封档页面视觉基线 ${name} @ ${suffix}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // 逐屏滚动触发 IntersectionObserver 入场动画，再回顶部截全页
      await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${name}-${suffix}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });
  }
}
