import { test, expect } from '@playwright/test';

/** 日志详情 /journal/:id */

test('从日志列表点卡片进入详情，展示完整文章且无裂图', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto('/journal');
  await page.getByRole('link', { name: '阅读文章：在撒哈拉等待一场日落' }).click();
  await page.waitForURL('/journal/sahara-sunset');

  const main = page.locator('main');
  await expect(main.getByRole('heading', { name: '在撒哈拉等待一场日落', level: 1 })).toBeVisible();
  // 面包屑
  await expect(main.getByRole('link', { name: '摄影日志' })).toBeVisible();
  // 元信息
  await expect(main.getByText('2026年5月20日')).toBeVisible();
  await expect(main.getByText('4 分钟阅读')).toBeVisible();
  await expect(main.getByRole('link', { name: '旅行', exact: true })).toBeVisible();
  // 正文：段落 + 引用块 + 小节标题
  await expect(main.getByText(/吉普车在沙地上留下最后一道辙印/)).toBeVisible();
  await expect(main.locator('blockquote').filter({ hasText: '按下快门只占百分之一的时间' })).toBeVisible();
  await expect(main.getByRole('heading', { name: '设备与参数' })).toBeVisible();
  // 作者卡链接到摄影师主页
  await expect(main.getByRole('link').filter({ hasText: '林风' })).toHaveAttribute(
    'href',
    '/photographers/1',
  );

  await page.waitForLoadState('networkidle');
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main img'))
      .filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0)
      .map((i) => i.getAttribute('src')),
  );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});

test('详情页“查看相关作品”与列表页“相关作品”均跳转标签筛选', async ({ page }) => {
  await page.goto('/journal/sahara-sunset');
  await page.getByRole('link', { name: /查看相关作品/ }).click();
  await page.waitForURL('/gallery?tag=travel');
  // mock 数据中 travel 标签共 2 幅（沙漠落日、水乡古镇）
  await expect(page.locator('main .work-card')).toHaveCount(2);

  await page.goto('/journal');
  // 整卡链接下层的“相关作品”仍可点击（z 层级）
  await page.locator('article').first().getByRole('link', { name: /相关作品/ }).click();
  await page.waitForURL('/gallery?tag=travel');
});

test('上一篇/下一篇导航在首篇与末篇边界正确', async ({ page }) => {
  // 最新一篇：无“下一篇”，有“上一篇”（更早的文章）
  await page.goto('/journal/sahara-sunset');
  const nav = page.getByRole('navigation', { name: '日志导航' });
  await expect(nav.getByRole('link', { name: /下一篇/ })).toHaveCount(0);
  await nav.getByRole('link', { name: /上一篇/ }).click();
  await page.waitForURL('/journal/minimal-architecture');
  await expect(page.locator('main').getByRole('heading', { name: '极简建筑的构成练习', level: 1 })).toBeVisible();

  // 最早一篇：无“上一篇”，有“下一篇”
  await page.goto('/journal/chasing-aurora');
  const navLast = page.getByRole('navigation', { name: '日志导航' });
  await expect(navLast.getByRole('link', { name: /上一篇/ })).toHaveCount(0);
  await navLast.getByRole('link', { name: /下一篇/ }).click();
  await page.waitForURL('/journal/blackwhite-portrait');
});

test('作者卡可跳转摄影师主页', async ({ page }) => {
  await page.goto('/journal/sahara-sunset');
  await page.getByRole('link', { name: /林风/ }).click();
  await page.waitForURL('/photographers/1');
  await expect(page.locator('main').getByRole('heading', { name: '林风', level: 1 })).toBeVisible();
});

test('不存在的日志 id 渲染 404', async ({ page }) => {
  await page.goto('/journal/no-such-post');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
