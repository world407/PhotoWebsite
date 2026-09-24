import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { LikesContext, type LikesContextValue } from './likes';

const STORAGE_KEY = 'photo_likes';

function readLikes(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<number[]>(readLikes);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(likedIds));
    } catch {
      // localStorage unavailable (e.g. private mode) — state still works in-memory
    }
  }, [likedIds]);

  const isLiked = useCallback((id: number) => likedIds.includes(id), [likedIds]);

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value = useMemo<LikesContextValue>(
    () => ({ likedIds, isLiked, toggleLike }),
    [likedIds, isLiked, toggleLike]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}
