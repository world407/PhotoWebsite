import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextValue, type ProfilePatch, type User } from './auth';
import { idbGet, idbPut, STORE_AVATARS } from './storage';

const USERS_KEY = 'photo_users';
const SESSION_KEY = 'photo_session';
/** 新用户 id 从 1000 起，避开 mock 摄影师 1..N */
const FIRST_USER_ID = 1000;

// ⚠️ 本地演示存储，明文密码仅用于 demo，绝非安全认证方案
interface StoredAccount {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  password: string;
}

interface AvatarRecord {
  id: number;
  dataUrl: string;
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function readSessionUserId(): number | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const id = raw === null ? NaN : Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

const USERNAME_RE = /^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [authModal, setAuthModal] = useState<AuthContextValue['authModal']>({
    isOpen: false,
    redirect: null,
  });

  // 启动：恢复会话（账号元数据在 localStorage，头像在 IndexedDB）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessionId = readSessionUserId();
      if (sessionId === null) {
        setReady(true);
        return;
      }
      const account = readAccounts().find((a) => a.id === sessionId);
      if (!account) {
        localStorage.removeItem(SESSION_KEY);
        setReady(true);
        return;
      }
      let avatarDataUrl: string | undefined;
      try {
        const avatar = await idbGet<AvatarRecord>(STORE_AVATARS, account.id);
        avatarDataUrl = avatar?.dataUrl;
      } catch {
        // IDB 不可用仅意味着头像无法恢复，不影响登录态
      }
      if (!cancelled) {
        setUser({
          id: account.id,
          username: account.username,
          displayName: account.displayName,
          bio: account.bio,
          avatarDataUrl,
        });
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAuthModal = useCallback((redirect?: string) => {
    setAuthModal({ isOpen: true, redirect: redirect ?? null });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal({ isOpen: false, redirect: null });
  }, []);

  const persistSession = useCallback((account: StoredAccount, avatarDataUrl?: string) => {
    localStorage.setItem(SESSION_KEY, String(account.id));
    setUser({
      id: account.id,
      username: account.username,
      displayName: account.displayName,
      bio: account.bio,
      avatarDataUrl,
    });
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const trimmed = username.trim();
      const account = readAccounts().find((a) => a.username === trimmed);
      if (!account || account.password !== password) {
        throw new Error('用户名或密码不正确');
      }
      let avatarDataUrl: string | undefined;
      try {
        const avatar = await idbGet<AvatarRecord>(STORE_AVATARS, account.id);
        avatarDataUrl = avatar?.dataUrl;
      } catch {
        // 忽略头像读取失败
      }
      persistSession(account, avatarDataUrl);
    },
    [persistSession],
  );

  const register = useCallback(
    async (username: string, password: string, displayName: string) => {
      const trimmed = username.trim();
      if (!USERNAME_RE.test(trimmed)) {
        throw new Error('用户名需为 2-20 位中英文、数字或下划线');
      }
      if (password.length < 6) {
        throw new Error('密码至少 6 位');
      }
      const accounts = readAccounts();
      if (accounts.some((a) => a.username === trimmed)) {
        throw new Error('该用户名已被注册');
      }
      const id = accounts.reduce((max, a) => Math.max(max, a.id), FIRST_USER_ID - 1) + 1;
      const account: StoredAccount = {
        id,
        username: trimmed,
        displayName: displayName.trim() || trimmed,
        bio: '这位摄影师还没有简介',
        password,
      };
      writeAccounts([...accounts, account]);
      persistSession(account);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUser(null);
    navigate('/');
  }, [navigate]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      const current = user;
      if (!current) throw new Error('未登录');
      const accounts = readAccounts();
      const index = accounts.findIndex((a) => a.id === current.id);
      if (index < 0) throw new Error('账号数据异常');

      const nextAccount: StoredAccount = {
        ...accounts[index],
        displayName:
          patch.displayName !== undefined ? patch.displayName.trim() || current.username : accounts[index].displayName,
        bio: patch.bio !== undefined ? patch.bio.trim() : accounts[index].bio,
      };
      accounts[index] = nextAccount;
      writeAccounts(accounts);

      let avatarDataUrl = current.avatarDataUrl;
      if (patch.avatarDataUrl !== undefined) {
        if (patch.avatarDataUrl === null) {
          avatarDataUrl = undefined;
        } else {
          avatarDataUrl = patch.avatarDataUrl;
          try {
            await idbPut(STORE_AVATARS, { id: current.id, dataUrl: avatarDataUrl } satisfies AvatarRecord);
          } catch {
            // IDB 写入失败（隐私模式/配额）：头像仅在本次会话生效
          }
        }
      }

      setUser({
        id: nextAccount.id,
        username: nextAccount.username,
        displayName: nextAccount.displayName,
        bio: nextAccount.bio,
        avatarDataUrl,
      });
    },
    [user],
  );

  // 登录/注册成功后：始终关闭弹窗，有 redirect 则续跳（如 /upload）
  useEffect(() => {
    if (user && authModal.isOpen) {
      const target = authModal.redirect;
      setAuthModal({ isOpen: false, redirect: null });
      if (target) navigate(target);
    }
  }, [user, authModal, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      updateProfile,
      openAuthModal,
      closeAuthModal,
      authModal,
    }),
    [user, ready, login, register, logout, updateProfile, openAuthModal, closeAuthModal, authModal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
