import { test, expect } from '@playwright/test';

/** SEO 基建：构建期文件（sitemap/robots/RSS，dev 由中间件提供）+ 路由级 title / JSON-LD */

test('sitemap.xml 包含全部静态与动态路由', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  // 11 静态页 + 18 作品 + 5 摄影师 + 6 手记 = 40
  expect(body.match(/<url>/g)?.length).toBe(40);
  expect(body).toContain('/photo/1');
  expect(body).toContain('/photographers/1');
  expect(body).toContain('/journal/sahara-sunset');
});

test('robots.txt 声明 Sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('Sitemap:');
});

test('feed.xml 含全部 6 篇手记', async ({ request }) => {
  const res = await request.get('/feed.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body.match(/<item>/g)?.length).toBe(6);
  expect(body).toContain('在撒哈拉等待一场日落');
  expect(body).toContain('<pubDate>');
});

test('详情页路由级 title 与 JSON-LD（Article / ImageObject / Person）', async ({ page }) => {
  await page.goto('/journal/sahara-sunset');
  await expect(page).toHaveTitle(/在撒哈拉等待一场日落/);
  const ld = page.locator('head script[type="application/ld+json"]');
  await expect(ld).toHaveCount(1);
  const article = JSON.parse((await ld.textContent()) ?? '{}');
  expect(article['@type']).toBe('Article');
  expect(article.headline).toBe('在撒哈拉等待一场日落');
  expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);

  await page.goto('/photo/1');
  await expect(page).toHaveTitle(/山间晨雾/);
  const image = JSON.parse(
    (await page.locator('head script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(image['@type']).toBe('ImageObject');
  expect(image.contentUrl).toBeTruthy();

  await page.goto('/photographers/1');
  await expect(page).toHaveTitle(/林风/);
  const person = JSON.parse(
    (await page.locator('head script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(person['@type']).toBe('Person');
});

test('404 路由的 title 不残留上一页数据', async ({ page }) => {
  await page.goto('/journal/sahara-sunset');
  await expect(page).toHaveTitle(/在撒哈拉等待一场日落/);
  await page.goto('/journal/no-such-post');
  await expect(page).toHaveTitle(/文章不存在/);
  await expect(page.locator('head script[type="application/ld+json"]')).toHaveCount(0);
});
