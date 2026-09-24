/**
 * WorkMetadataForm — 上传页第 2 步元数据表单
 *
 * 受控表单，状态由 Upload 页面持有；仅负责收集与即时校验展示。
 */
import { useState, type KeyboardEvent } from 'react';
import { ChevronDown, MapPin, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { TagChip } from '@/components/atoms/TagChip';
import { ChipPop } from '@/components/react-bits/custom';
import { tagLabels } from '@/data/mockData';
import type { ExifData, WorkTag } from '@/types';
import type { CompressedImage } from '@/lib/image';

const TITLE_MAX = 40;
const DESC_MAX = 500;
const TAG_MAX_COUNT = 8;
const TAG_MAX_LEN = 12;

/** 可选分类：排除 all */
const CATEGORY_TAGS: WorkTag[] = [
  'portrait',
  'landscape',
  'street',
  'architecture',
  'still',
  'nature',
  'travel',
  'blackwhite',
];

export interface WorkFormValues {
  title: string;
  description: string;
  tags: string[];
  location: string;
  tag: WorkTag;
  exif: ExifData;
}

export interface WorkFormErrors {
  title?: string;
  tags?: string;
}

interface WorkMetadataFormProps {
  image: CompressedImage;
  value: WorkFormValues;
  errors: WorkFormErrors;
  showErrors: boolean;
  onChange: (patch: Partial<WorkFormValues>) => void;
  onReplaceImage: () => void;
}

const inputClass =
  'w-full bg-bg-card border border-border-subtle rounded-btn py-3 px-4 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all';
const exifInputClass =
  'w-full bg-bg-card border border-border-subtle rounded-btn py-2.5 px-3 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all';

export function WorkMetadataForm({
  image,
  value,
  errors,
  showErrors,
  onChange,
  onReplaceImage,
}: WorkMetadataFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [exifOpen, setExifOpen] = useState(false);

  const patchExif = (patch: Partial<ExifData>) => {
    onChange({ exif: { ...value.exif, ...patch } });
  };

  const commitTags = (raw: string) => {
    // 支持一次粘贴多个逗号分隔的标签
    const parts = raw
      .split(/[,，]/)
      .map((s) => s.trim().slice(0, TAG_MAX_LEN))
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value.tags];
    for (const part of parts) {
      if (next.length >= TAG_MAX_COUNT) break;
      if (!next.includes(part)) next.push(part);
    }
    if (next.length !== value.tags.length) onChange({ tags: next });
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault();
      commitTags(tagInput);
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && value.tags.length) {
      onChange({ tags: value.tags.slice(0, -1) });
    }
  };

  const removeTag = (index: number) => {
    onChange({ tags: value.tags.filter((_, i) => i !== index) });
  };

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      {/* 左侧：图片预览 */}
      <div>
        <div className="rounded-img overflow-hidden border border-border-subtle bg-bg-card">
          <img
            src={image.dataUrl}
            alt={value.title || '待发布作品预览'}
            className="w-full object-contain max-h-[360px]"
          />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          {image.width} × {image.height} · 已自动压缩
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onReplaceImage}>
          <RefreshCw size={14} />
          重新选择
        </Button>
      </div>

      {/* 右侧：表单 */}
      <div className="space-y-5">
        {/* 标题 */}
        <div>
          <label htmlFor="work-title" className="block text-body-sm font-medium text-text-secondary">
            标题 <span className="text-accent">*</span>
          </label>
          <input
            id="work-title"
            type="text"
            value={value.title}
            maxLength={TITLE_MAX}
            placeholder="给作品起个名字"
            aria-invalid={showErrors && Boolean(errors.title)}
            onChange={(e) => onChange({ title: e.target.value })}
            className={`${inputClass} mt-1.5 ${showErrors && errors.title ? 'border-accent/60' : ''}`}
          />
          <div className="flex justify-between mt-1.5">
            {showErrors && errors.title ? (
              <p className="text-xs text-accent">{errors.title}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-text-muted">
              {value.title.length}/{TITLE_MAX}
            </span>
          </div>
        </div>

        {/* 描述 */}
        <div>
          <label
            htmlFor="work-description"
            className="block text-body-sm font-medium text-text-secondary"
          >
            作品描述 <span className="text-text-muted font-normal">（选填）</span>
          </label>
          <textarea
            id="work-description"
            value={value.description}
            maxLength={DESC_MAX}
            rows={3}
            placeholder="记录这张照片背后的故事、参数或心情…"
            onChange={(e) => onChange({ description: e.target.value })}
            className={`${inputClass} mt-1.5 resize-none`}
          />
          <div className="text-right mt-1.5">
            <span className="text-xs text-text-muted">
              {value.description.length}/{DESC_MAX}
            </span>
          </div>
        </div>

        {/* 标签 */}
        <div>
          <span className="block text-body-sm font-medium text-text-secondary">
            标签 <span className="text-text-muted font-normal">（回车或逗号添加，最多 {TAG_MAX_COUNT} 个）</span>
          </span>
          <div
            className={`mt-1.5 w-full bg-bg-card border rounded-btn px-3 py-2.5 flex flex-wrap items-center gap-2 transition-all focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 ${
              showErrors && errors.tags ? 'border-accent/60' : 'border-border-subtle'
            }`}
          >
            {value.tags.map((tag, index) => (
              <ChipPop key={tag}>
                <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full text-caption bg-accent/10 text-accent border border-accent/25">
                  {tag}
                  <button
                    type="button"
                    aria-label={`移除标签 ${tag}`}
                    onClick={() => removeTag(index)}
                    className="p-0.5 rounded-full hover:bg-accent/20 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              </ChipPop>
            ))}
            <input
              type="text"
              value={tagInput}
              placeholder={value.tags.length ? '' : '如：光影、城市、50mm'}
              aria-label="添加标签"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => {
                if (tagInput.trim()) {
                  commitTags(tagInput);
                  setTagInput('');
                }
              }}
              disabled={value.tags.length >= TAG_MAX_COUNT}
              className="flex-1 min-w-[120px] bg-transparent border-0 py-1 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0"
            />
          </div>
          {showErrors && errors.tags && <p className="mt-1.5 text-xs text-accent">{errors.tags}</p>}
        </div>

        {/* 地点 */}
        <div>
          <label
            htmlFor="work-location"
            className="block text-body-sm font-medium text-text-secondary"
          >
            拍摄地点 <span className="text-text-muted font-normal">（选填）</span>
          </label>
          <div className="relative mt-1.5">
            <MapPin
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="work-location"
              type="text"
              value={value.location}
              maxLength={30}
              placeholder="城市或具体地点"
              onChange={(e) => onChange({ location: e.target.value })}
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* 分类 */}
        <div>
          <span className="block text-body-sm font-medium text-text-secondary mb-2.5">分类</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TAGS.map((t) => (
              <TagChip
                key={t}
                label={tagLabels[t]}
                isActive={value.tag === t}
                onClick={() => onChange({ tag: t })}
              />
            ))}
          </div>
        </div>

        {/* EXIF 折叠区 */}
        <div className="border-t border-border-subtle pt-4">
          <button
            type="button"
            aria-expanded={exifOpen}
            onClick={() => setExifOpen((v) => !v)}
            className="flex items-center gap-2 text-body-sm font-medium text-text-secondary hover:text-accent transition-colors"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${exifOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
            EXIF 拍摄参数 <span className="text-text-muted font-normal">（选填）</span>
          </button>
          <div
            className={`grid transition-all duration-200 ease-out ${
              exifOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExifField label="相机" value={value.exif.camera ?? ''} placeholder="如 Sony A7M4"
                  onChange={(v) => patchExif({ camera: v || undefined })} />
                <ExifField label="镜头" value={value.exif.lens ?? ''} placeholder="如 FE 50mm F1.8"
                  onChange={(v) => patchExif({ lens: v || undefined })} />
                <ExifField label="光圈" value={value.exif.aperture ?? ''} placeholder="如 f/1.8"
                  onChange={(v) => patchExif({ aperture: v || undefined })} />
                <ExifField label="快门" value={value.exif.shutterSpeed ?? ''} placeholder="如 1/200s"
                  onChange={(v) => patchExif({ shutterSpeed: v || undefined })} />
                <ExifField label="ISO" type="number" value={value.exif.iso?.toString() ?? ''} placeholder="如 400"
                  onChange={(v) => {
                    const n = Number.parseInt(v, 10);
                    patchExif({ iso: Number.isFinite(n) && n >= 0 ? n : undefined });
                  }} />
                <ExifField label="焦段" value={value.exif.focalLength ?? ''} placeholder="如 50mm"
                  onChange={(v) => patchExif({ focalLength: v || undefined })} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExifFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: 'text' | 'number';
  onChange: (value: string) => void;
}

function ExifField({ label, value, placeholder, type = 'text', onChange }: ExifFieldProps) {
  return (
    <label className="block">
      <span className="block text-xs text-text-muted mb-1">{label}</span>
      <input
        type={type}
        value={value}
        min={type === 'number' ? 0 : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={exifInputClass}
      />
    </label>
  );
}
