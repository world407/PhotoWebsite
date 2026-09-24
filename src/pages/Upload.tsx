import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lock, MapPin } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { TagChip } from '@/components/atoms/TagChip';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { UploadDropzone } from '@/components/molecules/UploadDropzone';
import {
  WorkMetadataForm,
  type WorkFormValues,
  type WorkFormErrors,
} from '@/components/molecules/WorkMetadataForm';
import { StepTransition } from '@/components/react-bits/custom';
import { useAuth } from '@/lib/auth';
import { useWorks } from '@/lib/works';
import { useToast } from '@/lib/toast';
import { tagLabels } from '@/data/mockData';
import type { CompressedImage } from '@/lib/image';

const STEP_LABELS = ['选择图片', '填写信息', '预览发布'];

const initialForm: WorkFormValues = {
  title: '',
  description: '',
  tags: [],
  location: '',
  tag: 'landscape',
  exif: {},
};

export function Upload() {
  const navigate = useNavigate();
  const { user, ready, openAuthModal } = useAuth();
  const { addWork } = useWorks();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [form, setForm] = useState<WorkFormValues>(initialForm);
  const [errors, setErrors] = useState<WorkFormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const patchForm = (patch: Partial<WorkFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined && showErrors) {
      setErrors({ title: patch.title.trim() ? undefined : '请填写作品标题' });
    }
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const validateStep1 = (): boolean => {
    const next: WorkFormErrors = {};
    if (!form.title.trim()) next.title = '请填写作品标题';
    setErrors(next);
    setShowErrors(true);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && image) goTo(1);
    else if (step === 1 && validateStep1()) goTo(2);
  };

  const handlePublish = async () => {
    if (!image || publishing) return;
    if (!validateStep1()) {
      goTo(1);
      return;
    }
    setPublishing(true);
    try {
      const work = await addWork({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        tags: form.tags,
        location: form.location.trim() || undefined,
        tag: form.tag,
        exif: form.exif,
        image,
      });
      toast('发布成功，作品已上架');
      navigate(`/photo/${work.id}`);
    } catch (err) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'WritableStreamError');
      toast(isQuota ? '浏览器存储空间不足，请压缩后重试' : '发布失败，请稍后重试');
      setPublishing(false);
    }
  };

  // 认证状态初始化中：不渲染内容避免闪烁
  if (!ready) return <main className="pt-32 pb-20 md:pt-40" aria-busy="true" />;

  return (
    <main className="pt-32 pb-20 md:pt-40">
      <div className="container-main max-w-4xl">
        <SectionHeader title="上传作品" description="分享你的光影瞬间，三步即可发布" />

        {/* 游客引导：不自动弹窗，由用户主动触发 */}
        {!user ? (
          <div className="mt-10 rounded-card border border-border-subtle bg-bg-card/50 p-10 sm:p-14 text-center">
            <div
              className="mx-auto w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-5"
              aria-hidden="true"
            >
              <Lock size={22} className="text-accent" />
            </div>
            <h2 className="text-h3 text-text-primary">登录后即可发布作品</h2>
            <p className="text-body-sm text-text-muted mt-2 max-w-sm mx-auto">
              登录账号后可以上传作品、管理个人主页。账号为本地演示账号，信息仅保存在当前浏览器。
            </p>
            <Button
              variant="accent"
              size="lg"
              className="mt-6"
              onClick={() => openAuthModal('/upload')}
            >
              登录 / 注册
            </Button>
          </div>
        ) : (
          <>
            {/* 步骤条 */}
            <ol className="mt-10 flex items-center gap-2 sm:gap-4" aria-label="上传步骤">
              {STEP_LABELS.map((label, index) => {
                const state = index < step ? 'done' : index === step ? 'current' : 'todo';
                const clickable = index < step;
                return (
                  <li key={label} className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && goTo(index)}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-body-sm whitespace-nowrap transition-all duration-200 ${
                        state === 'current'
                          ? 'bg-accent/10 text-accent border border-accent/40'
                          : state === 'done'
                            ? 'text-accent border border-accent/25 hover:border-accent/50'
                            : 'text-text-muted border border-border-subtle cursor-default'
                      } ${clickable ? '' : 'cursor-default'}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          state === 'done'
                            ? 'bg-accent text-bg-deep'
                            : state === 'current'
                              ? 'border border-accent text-accent'
                              : 'border border-border-subtle'
                        }`}
                        aria-hidden="true"
                      >
                        {state === 'done' ? <Check size={11} strokeWidth={3} /> : index + 1}
                      </span>
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                    {index < STEP_LABELS.length - 1 && (
                      <span
                        className={`w-4 sm:w-8 h-px ${index < step ? 'bg-accent/50' : 'bg-border-subtle'}`}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>

            {/* 步骤内容（key 重播淡入位移转场） */}
            <div className="mt-8">
              <StepTransition stepKey={step} direction={direction}>
                {step === 0 && (
                  <UploadDropzone
                    image={image}
                    onImageSelected={setImage}
                    onClear={() => setImage(null)}
                  />
                )}
                {step === 1 && image && (
                  <WorkMetadataForm
                    image={image}
                    value={form}
                    errors={errors}
                    showErrors={showErrors}
                    onChange={patchForm}
                    onReplaceImage={() => goTo(0)}
                  />
                )}
                {step === 2 && image && (
                  <PublishPreview image={image} form={form} displayName={user.displayName || user.username} avatar={user.avatarDataUrl} />
                )}
              </StepTransition>
            </div>

            {/* 底部操作行 */}
            <div className="mt-10 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button variant="outline" onClick={() => goTo(step - 1)} disabled={publishing}>
                  <ArrowLeft size={16} />
                  {step === 2 ? '返回修改' : '上一步'}
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/gallery')}>
                  取消
                </Button>
              )}

              {step < 2 ? (
                <Button variant="accent" onClick={handleNext} disabled={step === 0 && !image}>
                  下一步
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="accent" size="lg" onClick={handlePublish} disabled={publishing}>
                  {publishing ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                      />
                      发布中…
                    </>
                  ) : (
                    <>
                      <Icon name="upload" size={16} />
                      发布作品
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/** 第 3 步：发布前预览 */
function PublishPreview({
  image,
  form,
  displayName,
  avatar,
}: {
  image: CompressedImage;
  form: WorkFormValues;
  displayName: string;
  avatar?: string;
}) {
  const exifParts = [
    form.exif.camera,
    form.exif.lens,
    [form.exif.aperture, form.exif.shutterSpeed, form.exif.iso ? `ISO ${form.exif.iso}` : undefined]
      .filter(Boolean)
      .join(' '),
    form.exif.focalLength,
  ].filter(Boolean);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 rounded-img overflow-hidden border border-border-subtle bg-bg-card">
        <img
          src={image.dataUrl}
          alt={form.title || '待发布作品预览'}
          className="w-full max-h-[70vh] object-contain"
        />
      </div>

      <aside className="lg:col-span-4 space-y-5">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-body-sm font-medium">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-body-sm text-text-primary font-medium truncate">{displayName}</p>
            <p className="text-xs text-text-muted">即将发布到你的主页</p>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-4 space-y-4">
          <div>
            <h3 className="text-body font-semibold text-text-primary break-words">{form.title || '未命名作品'}</h3>
            {form.description && (
              <p className="text-body-sm text-text-secondary mt-2 leading-relaxed whitespace-pre-wrap break-words">
                {form.description}
              </p>
            )}
          </div>

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <TagChip key={tag} label={`#${tag}`} interactive={false} />
              ))}
            </div>
          )}

          <div className="space-y-2 text-body-sm text-text-secondary">
            <p className="flex items-center gap-2">
              <span className="text-text-muted">分类</span>
              <span className="text-accent">{tagLabels[form.tag]}</span>
            </p>
            {form.location && (
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-text-muted" aria-hidden="true" />
                {form.location}
              </p>
            )}
          </div>

          {exifParts.length > 0 && (
            <dl className="border-t border-border-subtle pt-4 space-y-1.5">
              {exifParts.map((part, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <dd className="text-text-secondary">{part}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}
