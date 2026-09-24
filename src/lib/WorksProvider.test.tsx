import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { WorksProvider } from './WorksProvider';
import { useAuth } from './auth';
import { useWorks } from './works';
import { works as mockWorks } from '@/data/mockData';
import type { CompressedImage } from './image';
import type { NewWorkInput } from './works';
import type { Work } from '@/types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      <WorksProvider>{children}</WorksProvider>
    </AuthProvider>
  </MemoryRouter>
);

const compressed: CompressedImage = {
  dataUrl: 'data:image/jpeg;base64,NEW',
  width: 400,
  height: 200,
};

function newWorkInput(overrides: Partial<NewWorkInput> = {}): NewWorkInput {
  return {
    title: ' 我的新作品 ',
    tags: ['风光'],
    tag: 'landscape',
    image: compressed,
    ...overrides,
  };
}

describe('WorksProvider', () => {
  beforeEach(() => localStorage.clear());

  it('启动加载完成后：works = mock 合并流，userWorks 为空', async () => {
    const { result } = renderHook(() => useWorks(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.userWorks).toEqual([]);
    expect(result.current.works).toHaveLength(mockWorks.length);
    expect(result.current.myWorks).toEqual([]);
  });

  it('未登录 addWork 拒绝', async () => {
    const { result } = renderHook(() => useWorks(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      await expect(result.current.addWork(newWorkInput())).rejects.toThrow('请先登录');
    });
  });

  it('登录后发布作品：负 id、标题 trim、aspectRatio=宽/高、置于列表最前', async () => {
    const { result } = renderHook(
      () => ({ auth: useAuth(), works: useWorks() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.works.ready).toBe(true));

    await act(async () => {
      await result.current.auth.register('photog1', 'passw0rd', '摄影师一号');
    });

    let created: Work;
    await act(async () => {
      created = await result.current.works.addWork(newWorkInput());
    });
    const createdWork = created!;

    expect(createdWork.id).toBeLessThan(0);
    expect(createdWork.title).toBe('我的新作品');
    expect(createdWork.author).toBe('摄影师一号');
    expect(createdWork.authorId).toBe(1000);
    expect(createdWork.aspectRatio).toBe(2); // 400 / 200，勿反转
    expect(createdWork.imageUrl).toBe('data:image/jpeg;base64,NEW');
    expect(createdWork.likes).toBe(0);

    expect(result.current.works.works[0].id).toBe(createdWork.id);
    expect(result.current.works.userWorks).toHaveLength(1);
    expect(result.current.works.myWorks).toHaveLength(1);
    expect(result.current.works.works).toHaveLength(mockWorks.length + 1);
  });

  it('作品持久化到 IndexedDB：重新挂载后 userWorks 回读', async () => {
    const first = renderHook(() => ({ auth: useAuth(), works: useWorks() }), { wrapper });
    await waitFor(() => expect(first.result.current.works.ready).toBe(true));
    await act(async () => {
      await first.result.current.auth.register('photog2', 'passw0rd', '摄影师二号');
    });
    await act(async () => {
      await first.result.current.works.addWork(newWorkInput({ title: '持久化作品' }));
    });
    first.unmount();

    // 会话仍在 localStorage（beforeEach 未触发），新实例应从 IDB 读回
    const second = renderHook(() => useWorks(), { wrapper });
    await waitFor(() => expect(second.result.current.userWorks).toHaveLength(1));
    expect(second.result.current.userWorks[0]).toMatchObject({
      title: '持久化作品',
      aspectRatio: 2,
    });
    expect(second.result.current.myWorks[0].authorId).toBe(1000);
  });
});
