import { createContext, useContext } from 'react';

/**
 * 本地演示账号体系（非真实安全认证）：
 * 账号与会话保存在 localStorage（明文，仅 demo），头像大图存 IndexedDB。
 * 未来接入后端时只需替换 AuthProvider 内部实现。
 */
export interface User {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  avatarDataUrl?: string;
}

export interface ProfilePatch {
  displayName?: string;
  bio?: string;
  /** dataURL：更换头像；null：移除头像；undefined：不变 */
  avatarDataUrl?: string | null;
}

export interface AuthModalState {
  isOpen: boolean;
  /** 登录/注册成功后需要续跳的路径（如 /upload） */
  redirect: string | null;
}

export interface AuthContextValue {
  user: User | null;
  /** 会话恢复完成标志（避免首屏闪烁） */
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  openAuthModal: (redirect?: string) => void;
  closeAuthModal: () => void;
  authModal: AuthModalState;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
