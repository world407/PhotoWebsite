import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { ToastProvider } from './ToastProvider';
import { useToast } from './toast';

function ToastHarness() {
  const { toast } = useToast();
  return (
    <div>
      <button type="button" onClick={() => toast('操作成功')}>
        触发
      </button>
      <button type="button" onClick={() => toast('第二条')}>
        再触发
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it('toast() 后消息出现在 status 区域，2500ms 后自动消失', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole('button', { name: '触发' }).click();
    });
    expect(screen.getByRole('status')).toHaveTextContent('操作成功');

    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(screen.getByRole('status')).toHaveTextContent('操作成功');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('status')).not.toHaveTextContent('操作成功');
  });

  it('多条 toast 并存，各自按自己的计时消失', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole('button', { name: '触发' }).click();
      vi.advanceTimersByTime(1000);
      screen.getByRole('button', { name: '再触发' }).click();
    });
    expect(screen.getByRole('status')).toHaveTextContent('操作成功');
    expect(screen.getByRole('status')).toHaveTextContent('第二条');

    // 第一条到 2500ms（总时间），第二条还剩 1000ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('status')).not.toHaveTextContent('操作成功');
    expect(screen.getByRole('status')).toHaveTextContent('第二条');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('status')).not.toHaveTextContent('第二条');
  });

  it('缺少 Provider 时 useToast 抛错', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToastHarness />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });
});
