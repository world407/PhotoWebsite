import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { idbDelete, idbGetAll, STORE_AVATARS, STORE_IMAGES } from '@/lib/storage';

// globals: false 模式下 RTL 不会自动 cleanup，需手动注册
afterEach(async () => {
  cleanup();
  localStorage.clear();
  // 清空 fake-indexeddb 两个 store（openDb 单例复用同一连接，逐行删除即可）
  for (const store of [STORE_IMAGES, STORE_AVATARS]) {
    const items = await idbGetAll<{ id: IDBValidKey }>(store);
    await Promise.all(items.map((item) => idbDelete(store, item.id)));
  }
});
