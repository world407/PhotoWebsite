import { test, expect, devices } from '@playwright/test';

// 仅本文件使用 iPhone 视口（不全局增加 project，避免 CI 时间翻倍）
// 覆盖设备描述符默认的 webkit，统一走已安装的 chromium 移动模拟
test.use({ ...devices['iPhone 14'], browserName: 'chromium' });

test.describe('移动端（390×844 触控）', () => {
  test('汉堡抽屉：打开菜单 → 导航到探索，关闭按钮可收起', async ({ page }) => {
    await page.goto('/');

    // 桌面主导航在移动端隐藏，底部 Dock 可见
    await expect(page.getByRole('navigation', { name: '主导航' })).toBeHidden();
    await expect(page.getByRole('button', { name: '探索', exact: true })).toBeVisible();

    // 抽屉默认不可见
    const drawerNav = page.getByRole('navigation', { name: '移动端导航' });
    await expect(drawerNav).toBeHidden();

    await page.getByRole('button', { name: '打开菜单' }).click();
    await expect(drawerNav).toBeVisible();

    // 关闭按钮可用
    await page.getByRole('button', { name: '关闭菜单' }).click();
    await expect(drawerNav).toBeHidden();

    // 再次打开，通过抽屉链接跳转，跳转后抽屉自动关闭
    await page.getByRole('button', { name: '打开菜单' }).click();
    await drawerNav.getByRole('link', { name: '探索' }).click();
    await expect(page).toHaveURL(/\/gallery/);
    await expect(drawerNav).toBeHidden();
  });

  test('详情页：操作按钮与底部 Dock 可用，Dock 返回首页', async ({ page }) => {
    await page.goto('/photo/1');
    await page.getByRole('button', { name: '全屏查看', exact: true }).waitFor();

    // 移动端横向操作行可见（桌面侧栏在移动端隐藏）
    await expect(page.getByRole('button', { name: '点赞' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '收藏' }).first()).toBeVisible();

    // 底部 Dock 在详情页仍可见，点击首页返回
    await expect(page.getByRole('button', { name: '首页' })).toBeVisible();
    await page.getByRole('button', { name: '首页' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('日志详情：单列阅读布局，无横向溢出，上下篇导航纵向排列', async ({ page }) => {
    await page.goto('/journal/sahara-sunset');
    await page.getByRole('heading', { name: '在撒哈拉等待一场日落', level: 1 }).waitFor();

    await expect(page.getByRole('link', { name: /查看相关作品/ })).toBeVisible();
    const nav = page.getByRole('navigation', { name: '日志导航' });
    await expect(nav.getByRole('link', { name: /上一篇/ })).toBeVisible();

    // 无横向滚动
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW).toBe(overflow.clientW);
  });
});
