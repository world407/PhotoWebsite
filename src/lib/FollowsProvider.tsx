import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { FollowsContext, type FollowsContextValue } from './follows';

const STORAGE_KEY = 'photo_follows';

function readFollows(): number[] {
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

export function FollowsProvider({ children }: { children: ReactNode }) {
  const [followedIds, setFollowedIds] = useState<number[]>(readFollows);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(followedIds));
    } catch {
      // localStorage unavailable (e.g. private mode) — state still works in-memory
    }
  }, [followedIds]);

  const isFollowed = useCallback((id: number) => followedIds.includes(id), [followedIds]);

  const toggleFollow = useCallback((id: number) => {
    setFollowedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value = useMemo<FollowsContextValue>(
    () => ({ followedIds, isFollowed, toggleFollow }),
    [followedIds, isFollowed, toggleFollow]
  );

  return <FollowsContext.Provider value={value}>{children}</FollowsContext.Provider>;
}
