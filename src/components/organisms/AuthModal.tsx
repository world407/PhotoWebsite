import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Icon } from '@/components/atoms/Icon';
import { ModalTransition } from '@/components/react-bits/custom';
import { StaggerItems, StaggerItem } from '@/components/react-bits/custom';
import { useAuth } from '@/lib/auth';

type AuthMode = 'login' | 'register';

type FieldErrors = Partial<Record<'username' | 'password' | 'displayName', string>>;

const USERNAME_HINT = '2-20 位中英文、数字或下划线';

const inputBaseClass =
  'w-full bg-bg-card border border-border-subtle rounded-btn py-3 pl-11 pr-4 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all';

export function AuthModal() {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const isOpen = authModal.isOpen;

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [topError, setTopError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 弹窗关闭后重置表单（延迟到关闭动画后也无妨，下次打开前清空即可）
  useEffect(() => {
    if (!isOpen) {
      const t = window.setTimeout(() => {
        setMode('login');
        setUsername('');
        setDisplayName('');
        setPassword('');
        setShowPassword(false);
        setErrors({});
        setTopError('');
        setSubmitting(false);
      }, 250);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setTopError('');
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!username.trim()) {
      next.username = '请输入用户名';
    } else if (mode === 'register' && !/^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/.test(username.trim())) {
      next.username = USERNAME_HINT;
    }
    if (!password) {
      next.password = '请输入密码';
    } else if (mode === 'register' && password.length < 6) {
      next.password = '密码至少 6 位';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setTopError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password, displayName);
      }
      // 成功：AuthProvider 负责关闭弹窗与续跳
    } catch (err) {
      setTopError(err instanceof Error ? err.message : '操作失败，请重试');
      setSubmitting(false);
    }
  };

  return (
    <ModalTransition isOpen={isOpen} onClose={closeAuthModal} labelledBy="auth-dialog-title">
      <div className="p-6 sm:p-8">
        {/* 头部 */}
        <div className="mb-6 pr-10">
          <h2 id="auth-dialog-title" className="text-h3 text-text-primary">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="text-caption text-text-muted mt-1.5">
            {mode === 'login' ? '登录后即可发布作品与管理主页' : '注册后即可上传你的摄影作品'}
          </p>
        </div>
        <IconButton
          aria-label="关闭登录窗口"
          size="sm"
          className="absolute right-4 top-4"
          onClick={closeAuthModal}
        >
          <Icon name="close" size={18} />
        </IconButton>

        {/* 登录 / 注册分段器 */}
        <div className="flex bg-bg-deep/70 border border-border-subtle rounded-btn p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={`flex-1 py-2 rounded-md text-body-sm font-medium transition-all duration-200 ease-out ${
                mode === m ? 'bg-accent text-bg-deep' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <StaggerItems key={mode} className="space-y-4">
            {/* 用户名 */}
            <StaggerItem>
              <FieldLabel htmlFor="auth-username">用户名</FieldLabel>
              <div className="relative mt-1.5">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={validate}
                  placeholder={mode === 'register' ? USERNAME_HINT : '请输入用户名'}
                  maxLength={20}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? 'auth-username-error' : undefined}
                  className={`${inputBaseClass} ${errors.username ? 'border-accent/60' : ''}`}
                />
              </div>
              {errors.username && <FieldError id="auth-username-error">{errors.username}</FieldError>}
            </StaggerItem>

            {/* 昵称（仅注册） */}
            {mode === 'register' && (
              <StaggerItem>
                <FieldLabel htmlFor="auth-display-name">
                  昵称 <span className="text-text-muted font-normal">（选填）</span>
                </FieldLabel>
                <div className="relative mt-1.5">
                  <UserPlus
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                  <input
                    id="auth-display-name"
                    type="text"
                    autoComplete="nickname"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="展示在作品与主页上的名字"
                    maxLength={20}
                    className={inputBaseClass}
                  />
                </div>
              </StaggerItem>
            )}

            {/* 密码 */}
            <StaggerItem>
              <FieldLabel htmlFor="auth-password">密码</FieldLabel>
              <div className="relative mt-1.5">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={validate}
                  placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
                  maxLength={64}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'auth-password-error' : undefined}
                  className={`${inputBaseClass} pr-11 ${errors.password ? 'border-accent/60' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <FieldError id="auth-password-error">{errors.password}</FieldError>}
            </StaggerItem>
          </StaggerItems>

          {/* 服务端/业务级错误（金色提示，不使用刺眼红色） */}
          {topError && (
            <p
              role="alert"
              className="mt-3 text-xs text-accent bg-accent/5 border border-accent/20 rounded-btn px-3 py-2"
            >
              {topError}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" disabled={submitting} className="mt-6">
            {submitting ? (
              <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                {mode === 'login' ? '登录中…' : '注册中…'}
              </>
            ) : mode === 'login' ? (
              '登录'
            ) : (
              '注册并登录'
            )}
          </Button>

          <p className="mt-4 text-center text-caption text-text-muted">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-accent hover:text-accent-hover transition-colors"
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>

          <p className="mt-5 text-center text-xs text-text-muted/70 leading-relaxed">
            本地演示账号，信息仅保存在当前浏览器，非真实安全认证
          </p>
        </form>
      </div>
    </ModalTransition>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-body-sm font-medium text-text-secondary">
      {children}
    </label>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs text-accent">
      {children}
    </p>
  );
}
