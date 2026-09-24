import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'sample-400x200.png');

const OVERSIZED = {
  name: 'huge.png',
  mimeType: 'image/png',
  buffer: Buffer.alloc(20 * 1024 * 1024 + 1),
};
const BROKEN_IMAGE = {
  name: 'broken.png',
  mimeType: 'image/png',
  buffer: Buffer.from('this is definitely not a real png file'),
};
const TEXT_FILE = {
  name: 'notes.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('hello world'),
};

/**
 * 上传错误路径：文件类型/大小/损坏、表单校验、IndexedDB 配额失败。
 * 仅配额用 init script 注入浏览器原生 QuotaExceededError，其余全部真实链路。
 */
test.describe.serial('上传错误路径', () => {
  const stamp = Date.now();
  const username = `e2eerr${stamp}`;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/upload');
    await page.locator('main').getByRole('button', { name: '登录 / 注册' }).click();
    await page.getByRole('button', { name: /^注册$/ }).click();
    await page.locator('#auth-username').fill(username);
    await page.locator('#auth-password').fill('pass1234');
    await page.getByRole('button', { name: '注册并登录' }).click();
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('非图片文件被拒绝并显示行内错误，下一步保持禁用', async () => {
    await page.locator('input[type="file"]').setInputFiles(TEXT_FILE);
    await expect(page.getByRole('alert')).toHaveText('仅支持图片文件（JPG / PNG / WebP 等）');
    // 没有进入预览，投放区仍在，下一步禁用
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();
    await expect(page.getByRole('button', { name: /下一步/ })).toBeDisabled();
  });

  test('超过 20MB 的图片被拒绝', async () => {
    await page.locator('input[type="file"]').setInputFiles(OVERSIZED);
    await expect(page.getByRole('alert')).toHaveText('图片不能超过 20MB');
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();
  });

  test('内容损坏的图片压缩失败并给出可重试提示', async () => {
    await page.locator('input[type="file"]').setInputFiles(BROKEN_IMAGE);
    await expect(page.getByRole('alert')).toHaveText('图片处理失败，请更换图片重试');
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();
  });

  test('标题为空时无法进入预览，显示校验错误且标记 aria-invalid', async () => {
    await page.locator('input[type="file"]').setInputFiles(FIXTURE);
    await expect(page.getByAltText('待发布作品预览')).toBeVisible();
    await page.getByRole('button', { name: /下一步/ }).click();

    await expect(page.locator('#work-title')).toBeVisible();
    await page.getByRole('button', { name: /下一步/ }).click();
    await expect(page.getByText('请填写作品标题')).toBeVisible();
    await expect(page.locator('#work-title')).toHaveAttribute('aria-invalid', 'true');
    // 仍停留在信息填写步骤
    await expect(page.locator('#work-title')).toBeVisible();

    // 填入标题后错误清除，可进入预览
    await page.locator('#work-title').fill(`错误路径测试${stamp}`);
    await page.getByRole('button', { name: /下一步/ }).click();
    await expect(page.getByRole('button', { name: '发布作品' })).toBeVisible();
    await page.getByRole('button', { name: '返回修改' }).click();
    await expect(page.locator('#work-title')).toBeVisible();
  });

  test('IndexedDB 配额不足时发布失败有提示，按钮恢复可重试且不跳转', async () => {
    // 后续导航（含 reload）注入：让 IDB 写入抛浏览器原生配额错误（页面级注入，测试结束即失效）
    await page.addInitScript(() => {
      IDBObjectStore.prototype.put = function patchedPut() {
        throw new DOMException('persistent storage quota exceeded', 'QuotaExceededError');
      };
    });

    await page.reload();
    await expect(page.getByText('点击选择图片，或将图片拖拽到此处')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE);
    await expect(page.getByAltText('待发布作品预览')).toBeVisible();
    await page.getByRole('button', { name: /下一步/ }).click();
    await page.locator('#work-title').fill(`配额测试${stamp}`);
    await page.getByRole('button', { name: /下一步/ }).click();

    await page.getByRole('button', { name: '发布作品' }).click();
    await expect(page.getByRole('status')).toHaveText('浏览器存储空间不足，请压缩后重试');

    // 发布中状态恢复，按钮可再次点击，未离开上传页
    const retryButton = page.getByRole('button', { name: '发布作品' });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
    expect(page.url()).toContain('/upload');
  });
});
