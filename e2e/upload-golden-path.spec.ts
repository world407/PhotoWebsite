import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'sample-400x200.png');

/**
 * 黄金链路：游客访问 /upload → 注册 → 上传发布 → 详情点赞收藏
 * → 刷新持久化 → 收藏夹与个人主页可回读。
 * 全部基于真实 localStorage + IndexedDB，无 mock。
 */
test.describe.serial('发布黄金链路', () => {
  const stamp = Date.now();
  const username = `e2e${stamp}`;
  const title = `E2E测试作品${stamp}`;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('游客在 /upload 被引导注册，注册成功后进入上传向导', async () => {
    await page.goto('/upload');
    await expect(page.getByRole('heading', { name: '登录后即可发布作品' })).toBeVisible();

    // 游客引导区中的登录按钮（非导航栏图标）
    await page
      .locator('main')
      .getByRole('button', { name: '登录 / 注册' })
      .click();
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();

    await page.getByRole('button', { name: /^注册$/ }).click();
    await expect(page.getByRole('heading', { name: '创建账号' })).toBeVisible();
    await page.locator('#auth-username').fill(username);
    await page.locator('#auth-password').fill('pass1234');
    await page.getByRole('button', { name: '注册并登录' }).click();

    await expect(page.getByRole('heading', { name: '创建账号' })).toBeHidden();
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();
  });

  test('选择图片后本地压缩并进入元数据步骤', async () => {
    await page.locator('input[type="file"]').setInputFiles(FIXTURE);

    // 压缩完成：预览出现且小图不放大（400 × 200）
    await expect(page.getByAltText('待发布作品预览')).toBeVisible();
    await expect(page.getByText('400 × 200')).toBeVisible();

    await page.getByRole('button', { name: /下一步/ }).click();
    await expect(page.locator('#work-title')).toBeVisible();
  });

  test('填写标题发布后跳转到作品详情页', async () => {
    await page.locator('#work-title').fill(title);
    await page.locator('#work-location').fill('E2E 测试城');
    await page.getByRole('button', { name: /下一步/ }).click();

    await expect(page.getByRole('button', { name: '发布作品' })).toBeVisible();
    await page.getByRole('button', { name: '发布作品' }).click();

    // 用户作品 id 为负数
    await expect(page).toHaveURL(/\/photo\/-\d+$/, { timeout: 20_000 });
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test('详情页点赞与收藏可切换', async () => {
    const likeBtn = page.getByRole('button', { name: '点赞' });
    await expect(likeBtn).toBeVisible();
    await likeBtn.click();
    await expect(page.getByRole('button', { name: '已赞' })).toHaveAttribute('aria-pressed', 'true');

    const favBtn = page.getByRole('button', { name: '收藏' });
    await favBtn.click();
    await expect(page.getByRole('button', { name: '已收藏' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('刷新后点赞与收藏状态持久化', async () => {
    await page.reload();
    await expect(page.getByText(title).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '已赞' })).toBeVisible();
    await expect(page.getByRole('button', { name: '已收藏' })).toBeVisible();
  });

  test('收藏夹页面可以看到该作品', async () => {
    await page.goto('/favorites');
    await expect(page.getByRole('button', { name: `查看作品：${title}` })).toBeVisible();
  });

  test('个人主页「我的作品」可以看到该作品', async () => {
    await page.goto('/profile');
    await expect(page.getByRole('tab', { name: '我的作品' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: `查看作品：${title}` })).toBeVisible();
  });
});
