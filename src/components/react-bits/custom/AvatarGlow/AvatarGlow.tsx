/**
 * AvatarGlow — 自主实现，非 React Bits 源码组件
 *
 * 个人主页头像外围装饰：极简金色呼吸光晕。
 * 粒子方案（OrbitImages）对单头像场景过重，这里仅用静态 box-shadow +
 * opacity 呼吸（不动画 box-shadow，保证合成层 60fps）。
 * 强度压至最低：opacity 0.3 ~ 0.65，prefers-reduced-motion 时静止。
 */
import type { ReactNode } from 'react';
import './AvatarGlow.css';

export interface AvatarGlowProps {
  children: ReactNode;
  className?: string;
}

export function AvatarGlow({ children, className = '' }: AvatarGlowProps) {
  return <span className={`avatar-glow ${className}`}>{children}</span>;
}
