import { test, expect } from '@playwright/test';
import { works } from '../src/data/mockData';

const first = works.find((w) => w.id === 1)!;
const second = works.find((w) => w.id === 2)!;

test.beforeEach(async ({ page }) => {
  await page.goto('/photo/1');
});

test.describe('Lightbox 大图查看', () => {
  test('全屏打开、上一张/下一张切换、Esc 关闭', async ({ page }) => {
    // 初始无 dialog
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // 点击主图上的全屏查看按钮打开
    await page.getByRole('button', { name: '全屏查看', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: first.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('img', { name: first.title })).toBeVisible();

    // 下一张
    await dialog.getByRole('button', { name: '下一张' }).click();
    await expect(page.getByRole('dialog', { name: second.title })).toBeVisible();

    // 上一张回到原作品
    await page.getByRole('dialog').getByRole('button', { name: '上一张' }).click();
    await expect(page.getByRole('dialog', { name: first.title })).toBeVisible();

    // Esc 关闭
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('关闭按钮可用；f 键从详情页快捷打开', async ({ page }) => {
    // 等待懒加载的详情页就绪后再用快捷键
    await page.getByRole('button', { name: '全屏查看', exact: true }).waitFor();

    // f 键打开（PhotoDetail 快捷键）
    await page.keyboard.press('f');
    const dialog = page.getByRole('dialog', { name: first.title });
    await expect(dialog).toBeVisible();

    // 关闭按钮
    await dialog.getByRole('button', { name: '关闭' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(page.url()).toContain('/photo/1');
  });
});
