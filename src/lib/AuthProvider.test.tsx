import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './auth';

const withAuth = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('AuthProvider', () => {
  beforeEach(() => localStorage.clear());

  it('无会话时 ready 为 true 且 user 为 null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();
  });

  it('在 Provider 外使用 useAuth 抛错', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  it('账号数据损坏（非法 JSON）时降级为空账号表，不崩溃且可重新注册', async () => {
    localStorage.setItem('photo_users', '{这不是合法 JSON');
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();

    await act(async () => {
      await result.current.register('reborn', 'secret123', '重生用户');
    });
    expect(result.current.user?.username).toBe('reborn');
    const accounts = JSON.parse(localStorage.getItem('photo_users') ?? '[]');
    expect(accounts).toHaveLength(1);
  });

  it('会话 id 损坏（非数字/越界）时按未登录处理', async () => {
    localStorage.setItem('photo_users', JSON.stringify([
      { id: 1000, username: 'owner', password: 'secret123', displayName: '主人', bio: '', avatarId: null },
    ]));
    localStorage.setItem('photo_session', 'not-a-number');
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();
  });

  it('register 成功：user 就位、id 从 1000 起、会话与账号持久化', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });

    await act(async () => {
      await result.current.register('alice01', 'secret123', '爱丽丝');
    });

    expect(result.current.user).toMatchObject({
      id: 1000,
      username: 'alice01',
      displayName: '爱丽丝',
    });
    expect(localStorage.getItem('photo_session')).toBe('1000');
    const accounts = JSON.parse(localStorage.getItem('photo_users') ?? '[]');
    expect(accounts).toHaveLength(1);
    expect(accounts[0].password).toBe('secret123');
  });

  it('用户名两端空格被 trim', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await act(async () => {
      await result.current.register('  bob_02  ', 'secret123', '');
    });
    expect(result.current.user?.username).toBe('bob_02');
    // 昵称为空时回退为用户名
    expect(result.current.user?.displayName).toBe('bob_02');
  });

  it('注册校验：非法用户名 / 短密码 / 重复注册', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });

    await act(async () => {
      await expect(result.current.register('a', 'secret123', 'x')).rejects.toThrow('2-20 位');
    });
    await act(async () => {
      await expect(result.current.register('合法user', '12345', 'x')).rejects.toThrow('密码至少 6 位');
    });

    await act(async () => {
      await result.current.register('dup_user', 'secret123', 'D');
    });
    await act(async () => {
      await expect(result.current.register('dup_user', 'secret123', 'D2')).rejects.toThrow('已被注册');
    });
  });

  it('login 错误密码/不存在用户抛错，正确凭据恢复会话', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await act(async () => {
      await result.current.register('carol', 'passw0rd', '卡罗尔');
    });
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('photo_session')).toBeNull();

    await act(async () => {
      await expect(result.current.login('carol', 'wrong')).rejects.toThrow('用户名或密码不正确');
    });
    await act(async () => {
      await expect(result.current.login('nobody', 'passw0rd')).rejects.toThrow('用户名或密码不正确');
    });
    await act(async () => {
      await result.current.login(' carol ', 'passw0rd');
    });
    expect(result.current.user?.username).toBe('carol');
  });

  it('updateProfile 更新昵称/简介并持久化', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await act(async () => {
      await result.current.register('dave', 'passw0rd', 'Dave');
    });

    await act(async () => {
      await result.current.updateProfile({ displayName: '  ', bio: '  风光摄影师 ' });
    });
    expect(result.current.user?.displayName).toBe('dave'); // 空白昵称回退用户名
    expect(result.current.user?.bio).toBe('风光摄影师');

    const accounts = JSON.parse(localStorage.getItem('photo_users') ?? '[]');
    expect(accounts[0].bio).toBe('风光摄影师');
  });

  it('头像写入 IndexedDB，重新挂载后随会话恢复', async () => {
    const { result, unmount } = renderHook(() => useAuth(), { wrapper: withAuth });
    await act(async () => {
      await result.current.register('erin', 'passw0rd', 'Erin');
    });
    await act(async () => {
      await result.current.updateProfile({ avatarDataUrl: 'data:image/jpeg;base64,AVATAR' });
    });
    expect(result.current.user?.avatarDataUrl).toBe('data:image/jpeg;base64,AVATAR');
    unmount();

    // 新实例：从 localStorage 会话 + IndexedDB 头像恢复
    const restored = renderHook(() => useAuth(), { wrapper: withAuth });
    await waitFor(() => expect(restored.result.current.user).not.toBeNull());
    expect(restored.result.current.user).toMatchObject({
      id: 1000,
      username: 'erin',
    });
    expect(restored.result.current.user?.avatarDataUrl).toBe('data:image/jpeg;base64,AVATAR');
  });

  it('会话指向不存在账号时自动清除并保持登出态', async () => {
    localStorage.setItem('photo_session', '99999');
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('photo_session')).toBeNull();
  });

  it('openAuthModal/closeAuthModal 管理弹窗状态与 redirect', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: withAuth });
    act(() => result.current.openAuthModal('/upload'));
    expect(result.current.authModal).toEqual({ isOpen: true, redirect: '/upload' });
    act(() => result.current.closeAuthModal());
    expect(result.current.authModal).toEqual({ isOpen: false, redirect: null });
  });
});
