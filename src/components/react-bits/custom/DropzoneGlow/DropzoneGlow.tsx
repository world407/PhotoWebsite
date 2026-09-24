/**
 * DropzoneGlow — 自主实现，非 React Bits 源码组件
 *
 * 对标 React Bits「Hover Preview」：拖拽进入时边缘金色微光 + 背景微染，
 * 明确"可投放"状态。纯展示容器，文件选择与拖拽事件由上层 UploadDropzone 管理。
 * - 180ms ease-out，仅 border-color / background-color 过渡
 * - prefers-reduced-motion 由全局规则自动降级
 */
import type { ReactNode } from 'react';
import './DropzoneGlow.css';

export interface DropzoneGlowProps {
  /** 拖拽文件悬停中 */
  active?: boolean;
  children: ReactNode;
  className?: string;
  /** 点击 / 键盘激活打开文件选择器 */
  onActivate?: () => void;
}

export function DropzoneGlow({ active = false, children, className = '', onActivate }: DropzoneGlowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="选择或拖拽图片到此处"
      data-dragover={active ? 'true' : undefined}
      className={`dropzone-glow ${active ? 'is-dragover' : ''} ${className}`}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      }}
    >
      {children}
    </div>
  );
}
