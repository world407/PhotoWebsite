import { test, expect, type Page } from '@playwright/test';

/** 取 Gallery 当前第一页第一张作品卡片的标题（默认「最新」排序） */
async function firstCardTitle(page: Page): Promise<string> {
  const card = page.getByRole('button', { name: /^查看作品：/ }).first();
  await expect(card).toBeVisible();
  const name = (await card.getAttribute('aria-label')) ?? '';
  return name.replace(/^查看作品：/, '');
}

test.describe('封档页面导航：首页 / Gallery / 详情', () => {
  test('首页渲染 Hero 主标题', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /记录光影/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '探索作品' })).toBeVisible();
  });

  test('从 Gallery 点击第一张作品卡片进入详情，再通过 Esc 返回', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: '作品探索' })).toBeVisible();

    const title = await firstCardTitle(page);
    await page.getByRole('button', { name: `查看作品：${title}` }).first().click();

    await expect(page).toHaveURL(/\/photo\/\d+$/);
    // 详情页展示该作品标题
    await expect(page.getByText(title).first()).toBeVisible();

    // 从 Gallery 跳入时 Esc 走浏览器返回语义
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/gallery$/);
  });

  test('详情页方向键可切换到相邻作品', async ({ page }) => {
    // mockWorks 顺序下 id 1 的下一张是 id 2
    await page.goto('/photo/1');
    await expect(page.getByText('山间晨雾').first()).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/photo\/2$/, { timeout: 5_000 });
  });

  test('访问不存在的作品 id 显示 404', async ({ page }) => {
    await page.goto('/photo/999999');
    await expect(page.getByText(/页面不存在|404/).first()).toBeVisible();
  });
});
