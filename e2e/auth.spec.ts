import { test, expect } from '@playwright/test';

/**
 * 认证流程（纯前端 localStorage 账号，每个测试上下文天然干净）
 */
test.describe('认证：登录 / 注册弹窗', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '登录 / 注册' }).first().click();
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  });

  test('登录不存在的账号提示错误，弹窗不关闭', async ({ page }) => {
    await page.locator('#auth-username').fill('ghost_user');
    await page.locator('#auth-password').fill('whatever1');
    await page.getByRole('button', { name: '登录' }).last().click();

    await expect(page.getByRole('alert')).toContainText('用户名或密码不正确');
    // 弹窗仍在
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  });

  test('注册新账号后自动登录，刷新后会话保持', async ({ page }) => {
    const username = `e2e${Date.now()}`;

    await page.getByRole('button', { name: /^注册$/ }).click();
    await expect(page.getByRole('heading', { name: '创建账号' })).toBeVisible();

    await page.locator('#auth-username').fill(username);
    await page.locator('#auth-password').fill('pass1234');
    await page.getByRole('button', { name: '注册并登录' }).click();

    // 弹窗关闭，导航切换为「个人主页」
    await expect(page.getByRole('heading', { name: '创建账号' })).toBeHidden();
    await expect(page.getByRole('button', { name: '个人主页' }).first()).toBeVisible();

    // 会话持久化：刷新后仍登录
    await page.reload();
    await expect(page.getByRole('button', { name: '个人主页' }).first()).toBeVisible();
  });

  test('重复用户名注册被拒绝', async ({ page }) => {
    const username = `e2e${Date.now()}`;

    await page.getByRole('button', { name: /^注册$/ }).click();
    await page.locator('#auth-username').fill(username);
    await page.locator('#auth-password').fill('pass1234');
    await page.getByRole('button', { name: '注册并登录' }).click();
    await expect(page.getByRole('button', { name: '个人主页' }).first()).toBeVisible();

    // 退出后再次注册同名账号
    await page.goto('/profile');
    await page.getByRole('button', { name: '退出登录' }).click();
    await expect(page.getByRole('button', { name: '登录 / 注册' }).first()).toBeVisible();

    await page.getByRole('button', { name: '登录 / 注册' }).first().click();
    await page.getByRole('button', { name: /^注册$/ }).click();
    await page.locator('#auth-username').fill(username);
    await page.locator('#auth-password').fill('pass1234');
    await page.getByRole('button', { name: '注册并登录' }).click();

    await expect(page.getByRole('alert')).toContainText('该用户名已被注册');
  });
});
