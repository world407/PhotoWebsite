import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', name: '首页' },
  { path: '/gallery', name: '探索' },
  { path: '/photo/1', name: '作品详情' },
  { path: '/favorites', name: '收藏夹（游客）' },
  { path: '/upload', name: '上传（游客引导）' },
  { path: '/photo/999999', name: '404' },
] as const;

async function audit(page: Page) {
  // 等字体与首屏内容稳定，避免误报
  await page.waitForLoadState('networkidle');
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

for (const { path, name } of PAGES) {
  test.describe(`可访问性扫描：${name} ${path}`, () => {
    test('无 critical / serious 违规', async ({ page }) => {
      await page.goto(path);
      const results = await audit(page);

      const blockers = results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact ?? ''),
      );
      expect(
        blockers.map((v) => `${v.id}（${v.impact}）: ${v.help} @ ${v.nodes.map((n) => n.target).join('; ')}`),
      ).toEqual([]);
    });
  });
}
