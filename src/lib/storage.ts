/**
 * storage.ts — 极简 IndexedDB promise 封装（零依赖）
 *
 * 两个对象仓库：
 * - images: 用户上传作品完整记录（含压缩后 dataURL），keyPath 'id'（负整数）
 * - avatars: 用户头像 dataURL，keyPath 'id'（用户 id）
 *
 * 隐私模式 / 浏览器不支持 IDB 时，open 返回 null，上层降级为内存态。
 */

const DB_NAME = 'photo_website';
const DB_VERSION = 1;

export const STORE_IMAGES = 'images';
export const STORE_AVATARS = 'avatars';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_AVATARS)) {
          db.createObjectStore(STORE_AVATARS, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then((db) => {
    if (!db) return Promise.reject(new Error('IndexedDB unavailable'));
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const request = run(transaction.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB operation failed'));
    });
  });
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise<T[]>((resolve) => {
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .getAll();
    request.onsuccess = () => resolve((request.result as T[]) ?? []);
    request.onerror = () => resolve([]);
  });
}

export function idbGet<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return tx<T | undefined>(storeName, 'readonly', (store) => store.get(key) as IDBRequest<T | undefined>);
}

export function idbPut<T>(storeName: string, value: T): Promise<IDBValidKey> {
  return tx<IDBValidKey>(storeName, 'readwrite', (store) => store.put(value));
}

export function idbDelete(storeName: string, key: IDBValidKey): Promise<void> {
  return tx<undefined>(storeName, 'readwrite', (store) => store.delete(key) as IDBRequest<undefined>);
}

/** 探测 IndexedDB 是否真正可用（部分隐私模式 open 成功但写入失败） */
export async function idbIsAvailable(): Promise<boolean> {
  return (await openDb()) !== null;
}
