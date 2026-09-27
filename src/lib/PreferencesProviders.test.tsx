import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FavoritesProvider } from './FavoritesProvider';
import { useFavorites } from './favorites';
import { LikesProvider } from './LikesProvider';
import { useLikes } from './likes';
import { FollowsProvider } from './FollowsProvider';
import { useFollows } from './follows';

const favoritesWrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);
const likesWrapper = ({ children }: { children: ReactNode }) => (
  <LikesProvider>{children}</LikesProvider>
);
const followsWrapper = ({ children }: { children: ReactNode }) => (
  <FollowsProvider>{children}</FollowsProvider>
);

describe('FavoritesProvider', () => {
  beforeEach(() => localStorage.clear());

  it('初始无收藏', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(result.current.favoriteIds).toEqual([]);
    expect(result.current.isFavorite(1)).toBe(false);
  });

  it('从 localStorage 恢复已有收藏', () => {
    localStorage.setItem('photo_favorites', '[1, 2]');
    const { result } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(result.current.favoriteIds).toEqual([1, 2]);
    expect(result.current.isFavorite(2)).toBe(true);
  });

  it('损坏 JSON 容错为空数组', () => {
    localStorage.setItem('photo_favorites', '{not-json');
    const { result } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(result.current.favoriteIds).toEqual([]);
  });

  it('非数组值容错为空数组', () => {
    localStorage.setItem('photo_favorites', '{"a":1}');
    const { result } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(result.current.favoriteIds).toEqual([]);
  });

  it('过滤非数字条目', () => {
    localStorage.setItem('photo_favorites', '[1, "x", 3, null, true]');
    const { result } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(result.current.favoriteIds).toEqual([1, 3]);
  });

  it('toggle 添加/取消并写回 localStorage；新挂载实例可回读', () => {
    const { result, unmount } = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });

    act(() => result.current.toggleFavorite(7));
    expect(result.current.favoriteIds).toEqual([7]);
    expect(localStorage.getItem('photo_favorites')).toBe('[7]');

    act(() => result.current.toggleFavorite(7));
    expect(result.current.favoriteIds).toEqual([]);
    expect(localStorage.getItem('photo_favorites')).toBe('[]');

    unmount();
    localStorage.setItem('photo_favorites', '[9, 10]');
    const second = renderHook(() => useFavorites(), { wrapper: favoritesWrapper });
    expect(second.result.current.favoriteIds).toEqual([9, 10]);
  });
});

describe('LikesProvider', () => {
  beforeEach(() => localStorage.clear());

  it('从 localStorage 恢复点赞', () => {
    localStorage.setItem('photo_likes', '[5]');
    const { result } = renderHook(() => useLikes(), { wrapper: likesWrapper });
    expect(result.current.isLiked(5)).toBe(true);
  });

  it('损坏数据容错 + toggle 持久化', () => {
    localStorage.setItem('photo_likes', 'oops');
    const { result } = renderHook(() => useLikes(), { wrapper: likesWrapper });
    expect(result.current.likedIds).toEqual([]);

    act(() => result.current.toggleLike(42));
    expect(result.current.isLiked(42)).toBe(true);
    expect(localStorage.getItem('photo_likes')).toBe('[42]');

    act(() => result.current.toggleLike(42));
    expect(result.current.isLiked(42)).toBe(false);
  });
});

describe('FollowsProvider', () => {
  beforeEach(() => localStorage.clear());

  it('初始无关注', () => {
    const { result } = renderHook(() => useFollows(), { wrapper: followsWrapper });
    expect(result.current.followedIds).toEqual([]);
    expect(result.current.isFollowed(1)).toBe(false);
  });

  it('从 localStorage 恢复关注（摄影师卡片/迷你卡共享状态）', () => {
    localStorage.setItem('photo_follows', '[2, 4]');
    const { result } = renderHook(() => useFollows(), { wrapper: followsWrapper });
    expect(result.current.isFollowed(2)).toBe(true);
    expect(result.current.isFollowed(3)).toBe(false);
  });

  it('损坏数据容错 + toggle 持久化，新挂载实例可回读', () => {
    localStorage.setItem('photo_follows', 'broken');
    const { result, unmount } = renderHook(() => useFollows(), { wrapper: followsWrapper });
    expect(result.current.followedIds).toEqual([]);

    act(() => result.current.toggleFollow(5));
    expect(result.current.isFollowed(5)).toBe(true);
    expect(localStorage.getItem('photo_follows')).toBe('[5]');

    unmount();
    const second = renderHook(() => useFollows(), { wrapper: followsWrapper });
    expect(second.result.current.isFollowed(5)).toBe(true);

    act(() => second.result.current.toggleFollow(5));
    expect(second.result.current.isFollowed(5)).toBe(false);
    expect(localStorage.getItem('photo_follows')).toBe('[]');
  });

  it('过滤非数字条目', () => {
    localStorage.setItem('photo_follows', '[1, "x", null]');
    const { result } = renderHook(() => useFollows(), { wrapper: followsWrapper });
    expect(result.current.followedIds).toEqual([1]);
  });
});
