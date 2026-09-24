import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import { useRef } from 'react';
import {
  useSwipe,
  useMediaQuery,
  useBodyScrollLock,
  saveScrollPosition,
  restoreScrollPosition,
} from './index';

/* ---------- useSwipe ---------- */

// jsdom 未实现 TouchEvent，用普通 Event + 定义 touches/changedTouches 派发
function dispatchTouch(
  el: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  point: { x: number; y: number },
) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  const touch = { clientX: point.x, clientY: point.y };
  const key = type === 'touchend' ? 'changedTouches' : 'touches';
  Object.defineProperty(ev, key, { value: [touch] });
  el.dispatchEvent(ev);
}

interface SwipeHarnessProps {
  onLeft?: () => void;
  onRight?: () => void;
  threshold?: number;
  maxVerticalDelta?: number;
  ignoreInteractive?: boolean;
}

function SwipeHarness(props: SwipeHarnessProps) {
  const ref = useRef<HTMLDivElement>(null);
  useSwipe(ref, {
    onSwipeLeft: props.onLeft,
    onSwipeRight: props.onRight,
    threshold: props.threshold,
    maxVerticalDelta: props.maxVerticalDelta,
    ignoreInteractive: props.ignoreInteractive,
  });
  return (
    <div ref={ref} data-testid="swipe">
      <button type="button" data-testid="child-btn">
        内嵌按钮
      </button>
    </div>
  );
}

function swipe(el: Element, from: { x: number; y: number }, to: { x: number; y: number }) {
  dispatchTouch(el, 'touchstart', from);
  dispatchTouch(el, 'touchmove', to);
  dispatchTouch(el, 'touchend', to);
}

describe('useSwipe', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('水平左滑超过阈值触发 onSwipeLeft', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { getByTestId } = render(<SwipeHarness onLeft={onLeft} onRight={onRight} />);
    swipe(getByTestId('swipe'), { x: 200, y: 100 }, { x: 120, y: 100 });
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();
  });

  it('水平右滑超过阈值触发 onSwipeRight', () => {
    const onRight = vi.fn();
    const { getByTestId } = render(<SwipeHarness onRight={onRight} />);
    swipe(getByTestId('swipe'), { x: 100, y: 100 }, { x: 190, y: 100 });
    expect(onRight).toHaveBeenCalledTimes(1);
  });

  it('水平位移不足阈值不触发', () => {
    const onLeft = vi.fn();
    const { getByTestId } = render(<SwipeHarness onLeft={onLeft} threshold={50} />);
    swipe(getByTestId('swipe'), { x: 100, y: 100 }, { x: 130, y: 100 });
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('垂直位移过大视为纵向滚动，不触发', () => {
    const onLeft = vi.fn();
    const { getByTestId } = render(<SwipeHarness onLeft={onLeft} maxVerticalDelta={80} />);
    swipe(getByTestId('swipe'), { x: 200, y: 100 }, { x: 100, y: 200 });
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('默认忽略从按钮等交互元素起滑的手势', () => {
    const onLeft = vi.fn();
    const { getByTestId } = render(<SwipeHarness onLeft={onLeft} />);
    const root = getByTestId('swipe');
    const btn = getByTestId('child-btn');
    dispatchTouch(btn, 'touchstart', { x: 200, y: 100 });
    dispatchTouch(root, 'touchend', { x: 50, y: 100 });
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('ignoreInteractive=false 时交互元素起滑也触发', () => {
    const onLeft = vi.fn();
    const { getByTestId } = render(<SwipeHarness onLeft={onLeft} ignoreInteractive={false} />);
    const root = getByTestId('swipe');
    const btn = getByTestId('child-btn');
    dispatchTouch(btn, 'touchstart', { x: 200, y: 100 });
    dispatchTouch(root, 'touchend', { x: 50, y: 100 });
    expect(onLeft).toHaveBeenCalledTimes(1);
  });
});

/* ---------- 滚动位置恢复（sessionStorage，一次性读取） ---------- */

describe('saveScrollPosition / restoreScrollPosition', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('保存后恢复一次，再次读取返回 0（消费即删）', () => {
    Object.defineProperty(window, 'scrollY', { value: 432, configurable: true });
    saveScrollPosition();
    expect(restoreScrollPosition()).toBe(432);
    expect(restoreScrollPosition()).toBe(0);
  });

  it('未保存过时恢复为 0', () => {
    expect(restoreScrollPosition()).toBe(0);
  });

  it('存储值损坏时恢复为 0', () => {
    sessionStorage.setItem('photo_detail_scroll_restore', 'not-a-number');
    expect(restoreScrollPosition()).toBe(0);
  });
});

/* ---------- useMediaQuery ---------- */

interface MockMql {
  matches: boolean;
  listeners: Set<(e: { matches: boolean }) => void>;
}

function stubMatchMedia(initial: boolean): MockMql {
  const mql: MockMql = {
    matches: initial,
    listeners: new Set(),
  };
  const mock = vi.fn().mockReturnValue({
    get matches() {
      return mql.matches;
    },
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => mql.listeners.add(fn),
    removeEventListener: (_: string, fn: (e: { matches: boolean }) => void) =>
      mql.listeners.delete(fn),
  });
  vi.stubGlobal('matchMedia', mock);
  return mql;
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('初始不匹配返回 false，收到 change 后更新', () => {
    const mql = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);

    act(() => {
      mql.matches = true;
      mql.listeners.forEach((fn) => fn({ matches: true }));
    });
    expect(result.current).toBe(true);
  });

  it('初始匹配返回 true', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(true);
  });
});

/* ---------- useBodyScrollLock ---------- */

function LockHarness({ locked }: { locked: boolean }) {
  useBodyScrollLock(locked);
  return null;
}

describe('useBodyScrollLock', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('locked 切换时锁定/恢复 body overflow，卸载后还原', () => {
    const { rerender, unmount } = render(<LockHarness locked={false} />);
    expect(document.body.style.overflow).toBe('');

    rerender(<LockHarness locked={true} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<LockHarness locked={false} />);
    expect(document.body.style.overflow).toBe('');

    rerender(<LockHarness locked={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
