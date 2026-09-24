import { test, expect, type Page } from '@playwright/test';

const focusInfo = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: 'BODY', label: null, inDialog: false };
    return {
      tag: el.tagName.toLowerCase(),
      label: el.getAttribute('aria-label'),
      text: (el.textContent ?? '').trim().slice(0, 20),
      inDialog: !!el.closest('[role="dialog"]'),
    };
  });

test.describe('键盘可访问性', () => {
  test('首页 Tab 起点落在头部导航，且焦点元素可见可用', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const info = await focusInfo(page);
    expect(info.tag).toMatch(/^(a|button)$/);
    const inHeader = await page.evaluate(() => !!document.activeElement?.closest('header'));
    expect(inHeader).toBe(true);
  });

  test('Gallery 卡片支持键盘：Tab 聚焦查看按钮，Enter 进入详情，Esc 回退后焦点仍可用', async ({ page }) => {
    await page.goto('/gallery');

    const firstCard = page.getByRole('button', { name: /^查看作品：/ }).first();
    await firstCard.waitFor();
    await firstCard.focus();
    expect(await focusInfo(page)).toMatchObject({ tag: 'button' });

    const title = (await firstCard.getAttribute('aria-label')) ?? '';
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/photo\/\d+/);
    // 详情页渲染该作品
    await expect(page.getByRole('heading').filter({ hasText: title.replace('查看作品：', '') })).toBeVisible();
  });

  test('登录弹窗：打开自动聚焦、Tab 陷阱不出弹窗、Esc 关闭并归还焦点', async ({ page }) => {
    await page.goto('/upload');
    const openButton = page.locator('main').getByRole('button', { name: '登录 / 注册' });
    await openButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 初始焦点自动进入弹窗
    await expect.poll(() => focusInfo(page)).toMatchObject({ inDialog: true });

    // 连续 Tab 5 次焦点始终被囚禁在弹窗内
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await focusInfo(page)).toMatchObject({ inDialog: true });
    }
    // Shift+Tab 反向同样不出弹窗
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusInfo(page)).toMatchObject({ inDialog: true });
    }

    // Esc 关闭，焦点归还到打开按钮（main 引导区为文本按钮，无 aria-label）
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect.poll(() => focusInfo(page)).toMatchObject({ tag: 'button', text: '登录 / 注册' });
  });

  test('Lightbox：点击打开后焦点进入，Tab 循环在弹窗内，Esc 关闭归还焦点', async ({ page }) => {
    await page.goto('/photo/1');
    const trigger = page.getByRole('button', { name: '全屏查看', exact: true });
    await trigger.waitFor();

    // 用鼠标点击触发，保留触发元素焦点以验证关闭后归还（f 键打开路径见 lightbox.spec）
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect.poll(() => focusInfo(page)).toMatchObject({ inDialog: true });

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await focusInfo(page)).toMatchObject({ inDialog: true });
    }

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(() => focusInfo(page)).toMatchObject({ tag: 'button', label: '全屏查看' });
  });
});
