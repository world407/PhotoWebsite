/**
 * ProfileEditModal — 个人资料编辑弹窗
 *
 * 展示/交互层：头像本地裁剪压缩、昵称与简介收集，保存调 updateProfile。
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Icon } from '@/components/atoms/Icon';
import { ModalTransition, StaggerItems, StaggerItem } from '@/components/react-bits/custom';
import { useAuth } from '@/lib/auth';
import { compressAvatar } from '@/lib/image';
import { useToast } from '@/lib/toast';

const NAME_MAX = 20;
const BIO_MAX = 120;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full bg-bg-card border border-border-subtle rounded-btn py-3 px-4 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all';

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarProcessing, setAvatarProcessing] = useState(false);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  // 打开时以当前资料初始化
  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName);
      setBio(user.bio);
      setAvatarPreview(user.avatarDataUrl ?? null);
      setNameError('');
      setSaving(false);
    }
  }, [isOpen, user]);

  const handleAvatarFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('仅支持图片文件');
      return;
    }
    setAvatarProcessing(true);
    try {
      const dataUrl = await compressAvatar(file);
      setAvatarPreview(dataUrl);
    } catch {
      toast('头像处理失败，请更换图片重试');
    } finally {
      setAvatarProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;
    const name = displayName.trim();
    if (!name) {
      setNameError('昵称不能为空');
      return;
    }
    setSaving(true);
    try {
      const originalAvatar = user.avatarDataUrl ?? null;
      await updateProfile({
        displayName: name,
        bio: bio.trim(),
        avatarDataUrl: avatarPreview === originalAvatar ? undefined : avatarPreview,
      });
      toast('资料已更新');
      onClose();
    } catch {
      toast('保存失败，请稍后重试');
      setSaving(false);
    }
  };

  return (
    <ModalTransition isOpen={isOpen} onClose={onClose} labelledBy="profile-edit-title">
      <div className="p-6 sm:p-8">
        <div className="mb-6 pr-10">
          <h2 id="profile-edit-title" className="text-h3 text-text-primary">
            编辑资料
          </h2>
          <p className="text-caption text-text-muted mt-1.5">更新你的头像、昵称与个人简介</p>
        </div>
        <IconButton
          aria-label="关闭编辑窗口"
          size="sm"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </IconButton>

        <form onSubmit={handleSubmit}>
          <StaggerItems className="space-y-5">
            {/* 头像 */}
            <StaggerItem>
              <span className="block text-body-sm font-medium text-text-secondary mb-3">头像</span>
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-bg-deep border border-border-subtle flex-shrink-0">
                  {avatarProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw size={20} className="animate-spin text-accent" aria-hidden="true" />
                    </div>
                  ) : avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="头像预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-accent bg-accent/10">
                      {(displayName || user?.username || '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarProcessing}
                    onClick={() => fileRef.current?.click()}
                  >
                    更换头像
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={avatarProcessing}
                      onClick={() => setAvatarPreview(null)}
                    >
                      移除
                    </Button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    void handleAvatarFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
            </StaggerItem>

            {/* 昵称 */}
            <StaggerItem>
              <label htmlFor="profile-name" className="block text-body-sm font-medium text-text-secondary">
                昵称
              </label>
              <input
                id="profile-name"
                type="text"
                value={displayName}
                maxLength={NAME_MAX}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError('');
                }}
                aria-invalid={Boolean(nameError)}
                className={`${inputClass} mt-1.5 ${nameError ? 'border-accent/60' : ''}`}
              />
              <div className="flex justify-between mt-1.5">
                {nameError ? <p className="text-xs text-accent">{nameError}</p> : <span />}
                <span className="text-xs text-text-muted">
                  {displayName.length}/{NAME_MAX}
                </span>
              </div>
            </StaggerItem>

            {/* 简介 */}
            <StaggerItem>
              <label htmlFor="profile-bio" className="block text-body-sm font-medium text-text-secondary">
                简介 <span className="text-text-muted font-normal">（选填）</span>
              </label>
              <textarea
                id="profile-bio"
                value={bio}
                maxLength={BIO_MAX}
                rows={3}
                placeholder="介绍一下你自己，比如擅长的题材与使用的器材…"
                onChange={(e) => setBio(e.target.value)}
                className={`${inputClass} mt-1.5 resize-none`}
              />
              <div className="text-right mt-1.5">
                <span className="text-xs text-text-muted">
                  {bio.length}/{BIO_MAX}
                </span>
              </div>
            </StaggerItem>
          </StaggerItems>

          <div className="flex justify-end gap-3 mt-7">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              取消
            </Button>
            <Button type="submit" variant="accent" disabled={saving || avatarProcessing}>
              {saving ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  保存中…
                </>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </form>
      </div>
    </ModalTransition>
  );
}
