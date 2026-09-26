import { test, expect, type Page } from '@playwright/test';

/** 详情页 → Gallery 的 P2 联动：标签全文筛选、地点精确筛选 */

async function visibleCardCount(page: Page): Promise<number> {
  return page.locator('.work-card').count();
}

async function resultCountText(page: Page): Promise<string> {
  return (await page.locator('text=/\\d+ 张作品/').first().textContent()) ?? '';
}

test('详情页标签：键盘 Enter 跳转 Gallery 并以该标签全文筛选', async ({ page }) => {
  await page.goto('/photo/1');
  const firstTag = page.locator('[aria-label="标签"] button').first();
  await firstTag.waitFor();
  const tagName = (await firstTag.textContent()) ?? '';
  expect(tagName).toBeTruthy();

  // 键盘可达：聚焦后 Enter 同样能跳转（不依赖鼠标）
  await firstTag.focus();
  await page.keyboard.press('Enter');

  await page.waitForURL(/\/gallery\?q=/);
  expect(new URL(page.url()).searchParams.get('q')).toBe(tagName);

  // 搜索框同步显示该关键词，结果非空且无空状态
  await expect(page.getByPlaceholder('搜索作品、摄影师、标签...')).toHaveValue(tagName);
  expect(await visibleCardCount(page)).toBeGreaterThan(0);
  await expect(page.getByText('没有找到匹配的作品')).toHaveCount(0);
  expect(await resultCountText(page)).not.toContain('0 张作品');
});

test('详情页地点：点击跳转同地点精确筛选，胶囊可一键清除', async ({ page }) => {
  await page.goto('/photo/1');
  const locationButton = page.getByRole('button', { name: /^查看拍摄地 / });
  await locationButton.waitFor();
  const location = (await locationButton.textContent()) ?? '';
  expect(location).toBeTruthy();

  await locationButton.click();
  await page.waitForURL(/\/gallery\?location=/);
  expect(new URL(page.url()).searchParams.get('location')).toBe(location);

  // 激活的地点筛选胶囊可见，结果非空（精确匹配同拍摄地）
  const chip = page.getByRole('button', { name: `清除地点筛选：${location}` });
  await expect(chip).toBeVisible();
  expect(await visibleCardCount(page)).toBeGreaterThan(0);

  const filteredCount = await visibleCardCount(page);

  // 清除胶囊：参数消失，回到全部作品（数量应恢复或变多）
  await chip.click();
  await expect(chip).toBeHidden();
  expect(new URL(page.url()).searchParams.has('location')).toBe(false);
  expect(await visibleCardCount(page)).toBeGreaterThanOrEqual(filteredCount);
});

test('不存在的地点组合有优雅空状态且可一键清除', async ({ page }) => {
  await page.goto('/gallery?location=' + encodeURIComponent('不存在的地点 · XX'));
  await expect(page.getByText('没有找到匹配的作品')).toBeVisible();
  await page.getByRole('button', { name: '清除筛选条件' }).click();
  await expect(page.getByText('没有找到匹配的作品')).toHaveCount(0);
  expect(new URL(page.url()).search).toBe('');
});

test.describe('390px 窄屏', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('地点胶囊无横向溢出且可点清除', async ({ page }) => {
    await page.goto('/gallery?location=' + encodeURIComponent('瑞士 · 阿尔卑斯山'));
    const chip = page.getByRole('button', { name: /^清除地点筛选：/ });
    await chip.waitFor();

    // 不产生横向滚动（胶囊行正常换行/排布）
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    await chip.click();
    await expect(chip).toBeHidden();
    expect(new URL(page.url()).searchParams.has('location')).toBe(false);
  });
});
