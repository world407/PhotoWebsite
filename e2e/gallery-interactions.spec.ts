import { test, expect } from '@playwright/test';
import { works, tagLabels } from '../src/data/mockData';

const PAGE_SIZE = 9;

const total = works.length;
const landscapeCount = works.filter((w) => w.tag === 'landscape').length;
const featuredCount = works.filter((w) => w.isFeatured).length;
const topLikedTitle = [...works].sort((a, b) => b.likes - a.likes)[0].title;

// 与 Gallery 页面一致的搜索匹配逻辑（标题/作者/地点/标签）
function matchesSearch(w: (typeof works)[number], query: string): boolean {
  const q = query.toLowerCase();
  return (
    w.title.toLowerCase().includes(q) ||
    w.author.toLowerCase().includes(q) ||
    (w.location?.toLowerCase().includes(q) ?? false) ||
    (w.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
  );
}

const uniqueWork = works.find(
  (w) => works.filter((x) => matchesSearch(x, w.title)).length === 1,
);

const cards = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /^查看作品：/ });

const expectCount = (page: import('@playwright/test').Page, n: number) =>
  expect(page.getByText(new RegExp(`${n} 张作品`))).toBeVisible();

test.beforeEach(async ({ page }) => {
  await page.goto('/gallery');
});

test.describe('Gallery 工具栏交互', () => {
  test('标签筛选：数量收窄、URL 同步、刷新保持、可切回全部', async ({ page }) => {
    await expectCount(page, total);
    await expect(cards(page)).toHaveCount(Math.min(PAGE_SIZE, total));

    await page.getByRole('button', { name: tagLabels.landscape, exact: true }).click();
    await expect(page).toHaveURL(/tag=landscape/);
    await expectCount(page, landscapeCount);
    await expect(cards(page)).toHaveCount(Math.min(PAGE_SIZE, landscapeCount));

    // 刷新后筛选状态从 URL 恢复
    await page.reload();
    await expect(page).toHaveURL(/tag=landscape/);
    await expectCount(page, landscapeCount);

    await page.getByRole('button', { name: tagLabels.all, exact: true }).click();
    await expect(page).toHaveURL(/\/gallery\/?$/);
    await expectCount(page, total);
  });

  test('关键词搜索：命中唯一作品，无结果显示空态并可一键清除', async ({ page }) => {
    expect(uniqueWork).toBeTruthy();
    const query = uniqueWork!.title;
    const hitCount = works.filter((w) => matchesSearch(w, query)).length;

    await page.getByPlaceholder('搜索作品、摄影师、标签...').fill(query);
    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(query)}`));
    await expect(cards(page)).toHaveCount(hitCount);

    await page.getByPlaceholder('搜索作品、摄影师、标签...').fill('zzz-绝对不会命中-zzz');
    await expect(page.getByText('没有找到匹配的作品')).toBeVisible();
    await expect(cards(page)).toHaveCount(0);

    await page.getByRole('button', { name: '清除筛选条件' }).click();
    await expect(page).toHaveURL(/\/gallery\/?$/);
    await expect(cards(page)).toHaveCount(PAGE_SIZE);
  });

  test('排序切换到最热：URL 同步且首卡为点赞最高作品', async ({ page }) => {
    await page.getByRole('button', { name: '最新', exact: true }).click();
    await page.getByRole('button', { name: '最热', exact: true }).click();

    await expect(page).toHaveURL(/sort=popular/);
    await expect(cards(page).first()).toHaveAttribute('aria-label', `查看作品：${topLikedTitle}`);
  });

  test('布局切换：网格/瀑布流往返同步到 URL', async ({ page }) => {
    await page.getByRole('button', { name: '网格布局' }).click();
    await expect(page).toHaveURL(/layout=grid/);
    await expect(page.locator('.grid').first()).toBeVisible();

    await page.getByRole('button', { name: '瀑布流布局' }).click();
    await expect(page).toHaveURL(/\/gallery\/?$/);
    await expect(page.locator('.waterfall').first()).toBeVisible();
  });

  test('精选开关：只看精选作品，再次点击关闭', async ({ page }) => {
    await page.getByRole('button', { name: '精选作品' }).click();
    await expect(page).toHaveURL(/featured=1/);
    await expectCount(page, featuredCount);

    await page.getByRole('button', { name: '精选作品' }).click();
    await expect(page).toHaveURL(/\/gallery\/?$/);
    await expectCount(page, total);
  });

  test('加载更多：首屏 9 张，点击后展示全部 18 张并隐藏按钮', async ({ page }) => {
    await expect(cards(page)).toHaveCount(PAGE_SIZE);
    await page.getByRole('button', { name: '加载更多' }).click();
    await expect(cards(page)).toHaveCount(total);
    await expect(page.getByRole('button', { name: '加载更多' })).toBeHidden();
  });
});
