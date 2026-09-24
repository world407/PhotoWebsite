import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { works as mockWorks } from '@/data/mockData';
import type { Work } from '@/types';
import { idbGetAll, idbPut, STORE_IMAGES } from './storage';
import { useAuth } from './auth';
import type { NewWorkInput } from './works';
import { WorksContext, type WorksContextValue } from './works';

const FALLBACK_COLOR = '#1a1a24';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WorksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userWorks, setUserWorks] = useState<Work[]>([]);
  const [ready, setReady] = useState(false);

  // 启动：从 IndexedDB 读取用户作品（隐私模式降级为空数组 + 内存态）
  useEffect(() => {
    let cancelled = false;
    idbGetAll<Work>(STORE_IMAGES)
      .then((stored) => {
        if (cancelled) return;
        const valid = stored.filter((w) => typeof w?.id === 'number' && typeof w.imageUrl === 'string');
        valid.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        setUserWorks(valid);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addWork = useCallback(
    async (input: NewWorkInput): Promise<Work> => {
      if (!user) throw new Error('请先登录');
      // 负整数 id，避免与 mock 正整数 id 冲突；同毫秒连发时递减避让
      let id = -Date.now();
      const existingIds = new Set<number>([
        ...userWorks.map((w) => w.id),
        ...mockWorks.map((w) => w.id),
      ]);
      while (existingIds.has(id)) id -= 1;

      const { image } = input;
      const work: Work = {
        id,
        title: input.title.trim(),
        author: user.displayName || user.username,
        authorId: user.id,
        authorAvatar: user.avatarDataUrl,
        likes: 0,
        views: 0,
        tag: input.tag,
        tags: input.tags,
        // width / height，勿反转
        aspectRatio: image.width / image.height,
        imageUrl: image.dataUrl,
        thumbnailUrl: image.dataUrl,
        fullUrl: image.dataUrl,
        description: input.description?.trim() || undefined,
        location: input.location?.trim() || undefined,
        exif: input.exif,
        createdAt: todayString(),
        isFeatured: false,
        color: FALLBACK_COLOR,
      };

      // 先持久化（配额超限时 reject，UI 停留发布页并提示）
      await idbPut(STORE_IMAGES, work);

      setUserWorks((prev) => [work, ...prev]);
      return work;
    },
    [user, userWorks],
  );

  // 用户作品在前（最新在前），mock 保持原有顺序在后
  const works = useMemo<Work[]>(() => [...userWorks, ...mockWorks], [userWorks]);

  const myWorks = useMemo(
    () => (user ? userWorks.filter((w) => w.authorId === user.id) : []),
    [userWorks, user],
  );

  const value = useMemo<WorksContextValue>(
    () => ({ works, userWorks, myWorks, ready, addWork }),
    [works, userWorks, myWorks, ready, addWork],
  );

  return <WorksContext.Provider value={value}>{children}</WorksContext.Provider>;
}
