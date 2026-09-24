const STORAGE_KEY = 'photo_detail_scroll_restore';

export function saveScrollPosition() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
}

export function restoreScrollPosition() {
  if (typeof window === 'undefined') return 0;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (value) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return value ? Number.parseInt(value, 10) || 0 : 0;
}
