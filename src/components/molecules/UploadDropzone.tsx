/**
 * UploadDropzone — 上传页第 1 步投放区
 *
 * 纯展示/交互层：拖拽或点击选择文件 → 本地压缩 → 预览。
 * 压缩完成后通过 onImageSelected 回传，不触碰业务数据流。
 */
import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { ShimmerPlaceholder } from '@/components/atoms/ShimmerPlaceholder';
import { DropzoneGlow } from '@/components/react-bits/custom';
import { compressImage, type CompressedImage } from '@/lib/image';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export interface UploadDropzoneProps {
  image: CompressedImage | null;
  onImageSelected: (image: CompressedImage) => void;
  onClear: () => void;
}

export function UploadDropzone({ image, onImageSelected, onClear }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('仅支持图片文件（JPG / PNG / WebP 等）');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('图片不能超过 20MB');
      return;
    }
    setError(null);
    setProcessing(true);
    try {
      const result = await compressImage(file);
      onImageSelected(result);
    } catch {
      setError('图片处理失败，请更换图片重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(false);
    void handleFile(e.dataTransfer.files?.[0]);
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      onChange={(e) => {
        void handleFile(e.target.files?.[0]);
        // 允许重复选择同一文件
        e.target.value = '';
      }}
    />
  );

  // 处理中：骨架占位
  if (processing) {
    return (
      <div>
        <div className="relative w-full h-64 sm:h-80 rounded-img overflow-hidden bg-bg-card">
          <ShimmerPlaceholder />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <RefreshCw size={22} className="animate-spin text-accent" aria-hidden="true" />
            <p className="text-body-sm">正在处理图片…</p>
          </div>
        </div>
        {input}
      </div>
    );
  }

  // 已选图：预览
  if (image) {
    return (
      <>
      <div className="relative rounded-img overflow-hidden bg-bg-card border border-border-subtle">
        <div className="flex items-center justify-center max-h-[420px]">
          <img
            src={image.dataUrl}
            alt="待发布作品预览"
            className="w-full max-h-[420px] object-contain"
          />
        </div>
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs bg-bg-deep/80 backdrop-blur-sm text-text-secondary border border-border-subtle">
            {image.width} × {image.height}
          </span>
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={openPicker}>
            重新选择
          </Button>
          <IconButton
            variant="card"
            size="sm"
            aria-label="移除图片"
            onClick={onClear}
          >
            <X size={16} />
          </IconButton>
        </div>
        {input}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-accent">
          {error}
        </p>
      )}
      </>
    );
  }

  // 空态：投放区（拖拽事件挂外层容器，DropzoneGlow 仅负责视觉与点击/键盘激活）
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragover(true);
      }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      <DropzoneGlow
        active={dragover}
        onActivate={openPicker}
        className="min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center text-center px-6 py-12"
      >
        <div
          className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <ImagePlus size={24} className="text-accent" />
        </div>
        <p className="text-body text-text-primary font-medium">
          {dragover ? '松开即可上传' : '点击选择图片，或将图片拖拽到此处'}
        </p>
        <p className="text-caption text-text-muted mt-2">
          支持 JPG / PNG / WebP，单张不超过 20MB，长边将自动压缩至 1600px
        </p>
      </DropzoneGlow>
      {error && (
        <p role="alert" className="mt-3 text-xs text-accent">
          {error}
        </p>
      )}
      {input}
    </div>
  );
}
