import { describe, it, expect } from 'vitest';
import {
  idbGet,
  idbGetAll,
  idbPut,
  idbDelete,
  idbIsAvailable,
  STORE_IMAGES,
  STORE_AVATARS,
} from './storage';

interface SampleRecord {
  id: number;
  name: string;
}

describe('storage（IndexedDB 封装，fake-indexeddb）', () => {
  it('IndexedDB 探测可用', async () => {
    await expect(idbIsAvailable()).resolves.toBe(true);
  });

  it('put 后可按 key 读回，且值一致', async () => {
    const record: SampleRecord = { id: -123, name: '作品A' };
    await idbPut(STORE_IMAGES, record);
    const got = await idbGet<SampleRecord>(STORE_IMAGES, -123);
    expect(got).toEqual(record);
  });

  it('getAll 返回全部记录', async () => {
    await idbPut(STORE_IMAGES, { id: -1, name: 'a' } satisfies SampleRecord);
    await idbPut(STORE_IMAGES, { id: -2, name: 'b' } satisfies SampleRecord);
    const all = await idbGetAll<SampleRecord>(STORE_IMAGES);
    expect(all).toHaveLength(2);
    expect(all.map((r) => r.id).sort((a, b) => a - b)).toEqual([-2, -1]);
  });

  it('读取不存在的 key 返回 undefined', async () => {
    expect(await idbGet(STORE_IMAGES, 99999)).toBeUndefined();
  });

  it('delete 后记录消失', async () => {
    await idbPut(STORE_AVATARS, { id: 1000, dataUrl: 'data:image/jpeg;base64,x' });
    await idbDelete(STORE_AVATARS, 1000);
    expect(await idbGet(STORE_AVATARS, 1000)).toBeUndefined();
  });

  it('两个 store 互相隔离', async () => {
    await idbPut(STORE_IMAGES, { id: 7, name: 'image-store' } satisfies SampleRecord);
    expect(await idbGet(STORE_AVATARS, 7)).toBeUndefined();
  });
});
