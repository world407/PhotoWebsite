import { test, expect } from '@playwright/test';

/** Phase 5 内容页冒烟：防页面回退为空白/裂图/死链接 */

const SMOKE_PAGES: { path: string; heading: string }[] = [
  { path: '/about', heading: '关于影·迹' },
  { path: '/projects', heading: '摄影专题' },
  { path: '/journal', heading: '摄影日志' },
  { path: '/contact', heading: '联系我们' },
  { path: '/photographers', heading: '摄影师' },
];

for (const { path, heading } of SMOKE_PAGES) {
  test(`${path} 渲染标题且无裂图`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.goto(path);
    await expect(page.locator('main').getByRole('heading', { name: heading })).toBeVisible();
    await page.waitForLoadState('networkidle');

    // 所有已完成加载的图片必须解码成功（防 Unsplash 源图被删导致裂图）
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main img'))
        .filter((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 0)
        .map((i) => i.getAttribute('src')),
    );
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('Projects：6 个专题卡均计数且点击跳分类筛选', async ({ page }) => {
  await page.goto('/projects');
  const cards = page.locator('main').locator('a[href^="/gallery?tag="]');
  await expect(cards).toHaveCount(6);
  await expect(page.locator('main').getByText(/幅$/)).toHaveCount(6);

  await cards.first().click();
  await page.waitForURL(/\/gallery\?tag=/);
  // Gallery 确实渲染了作品
  expect(await page.locator('.work-card').count()).toBeGreaterThan(0);
});

test('Journal：6 篇日志且"相关作品"可跳分类筛选', async ({ page }) => {
  await page.goto('/journal');
  const links = page.locator('main').getByRole('link', { name: /相关作品/ });
  await expect(links).toHaveCount(6);
  await links.first().click();
  await page.waitForURL(/\/gallery\?tag=/);
});

test('Photographers：5 张摄影师卡，关注状态可切换且刷新后持久化', async ({ page }) => {
  await page.goto('/photographers');
  const unfollowedBtn = () => page.locator('main').getByRole('button', { name: /^关注$/ });
  const followedBtn = () => page.locator('main').getByRole('button', { name: /已关注/ });
  await expect(unfollowedBtn()).toHaveCount(5);
  await unfollowedBtn().first().click();
  await expect(followedBtn().first()).toBeVisible();

  // 刷新后关注状态从 localStorage 恢复（4 个未关注 + 1 个已关注）
  await page.reload();
  await expect(followedBtn()).toHaveCount(1);
  await expect(unfollowedBtn()).toHaveCount(4);

  // 跨页面一致：作品 1 作者林风（id 1）的详情页迷你卡同步显示已关注
  await page.goto('/photo/1');
  const miniFollowed = page.locator('main').getByRole('button', { name: /已关注/ });
  await expect(miniFollowed).toBeVisible();
  await miniFollowed.click();

  // 在详情页取消后，列表页同步恢复
  await page.goto('/photographers');
  await expect(followedBtn()).toHaveCount(0);
  await expect(unfollowedBtn()).toHaveCount(5);
});

test('图片降级：专题封面加载失败时展示占位而非裂图', async ({ page }) => {
  // work 18「雪山倒影」是「自然之境」封面
  await page.route('**/photo-1464822759023-fed622ff2c3b*', (route) => route.abort());
  await page.goto('/projects');

  await expect(page.getByText('图片加载失败').first()).toBeVisible();
  // 卡片跳转功能不受影响
  await page.locator('main').locator('a[href^="/gallery?tag="]').first().click();
  await page.waitForURL(/\/gallery\?tag=/);
});

test('孤儿页入口：Footer 与移动抽屉可到达摄影专题/日志', async ({ page }) => {
  // 桌面：Footer 两个入口可见
  await page.goto('/');
  await expect(page.getByRole('link', { name: '摄影专题' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: '摄影日志' }).first()).toBeVisible();

  // 移动：打开抽屉，经"摄影专题"实际跳转
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '打开菜单' }).click();
  const drawerLink = page.locator('.mobile-menu-list').getByRole('link', { name: '摄影专题' });
  await expect(drawerLink).toBeVisible();
  await drawerLink.click();
  await page.waitForURL('/projects');
  await expect(page.locator('main').getByRole('heading', { name: '摄影专题' })).toBeVisible();
});
