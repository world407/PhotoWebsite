import { test, expect } from '@playwright/test';

/** 摄影师主页 /photographers/:id */

test('从摄影师列表点卡片进入主页，展示头部、面包屑与真实作品集', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto('/photographers');
  // 点第一张卡（林风 id=1）的整卡链接，而非关注按钮
  await page.getByRole('link', { name: '查看 林风 的主页' }).click();
  await page.waitForURL('/photographers/1');

  const main = page.locator('main');
  await expect(main.getByRole('heading', { name: '林风', level: 1 })).toBeVisible();
  await expect(main.getByRole('link', { name: '摄影师' })).toBeVisible();
  await expect(main.getByRole('heading', { name: /作品集/ })).toBeVisible();

  // mock 数据中 authorId=1 共 4 幅
  await expect(main.locator('.work-card')).toHaveCount(4);

  await page.waitForLoadState('networkidle');
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main img'))
      .filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0)
      .map((i) => i.getAttribute('src')),
  );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});

test('主页关注按钮与列表页状态同步且持久化', async ({ page }) => {
  await page.goto('/photographers/1');
  const followBtn = page.locator('main').getByRole('button', { name: /^关注$/ });
  await followBtn.click();
  await expect(page.locator('main').getByRole('button', { name: /已关注/ })).toBeVisible();

  // 列表页第一张卡（林风）同步为已关注
  await page.goto('/photographers');
  await expect(page.getByRole('button', { name: /已关注/ })).toHaveCount(1);

  // 刷新仍保持
  await page.reload();
  await expect(page.getByRole('button', { name: /已关注/ })).toHaveCount(1);
});

test('点作品集卡片进入照片详情；详情页摄影师名可返回主页', async ({ page }) => {
  await page.goto('/photographers/1');
  await page.locator('main .work-card').first().click();
  await page.waitForURL(/\/photo\/\d+/);

  // 迷你卡中的摄影师名链接
  await page.getByRole('link', { name: '林风' }).click();
  await page.waitForURL('/photographers/1');
  await expect(page.locator('main').getByRole('heading', { name: '林风', level: 1 })).toBeVisible();
});

test('不存在或非法的摄影师 id 渲染 404', async ({ page }) => {
  await page.goto('/photographers/999999');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();

  await page.goto('/photographers/abc');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
