import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@/components/atoms/Icon';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** 头像模式：加载失败时展示该文本（通常是名称首字），样式沿用 className */
  fallbackText?: string;
  /** 完全自定义的降级节点（覆盖内置降级） */
  fallback?: ReactNode;
}

/**
 * SmartImage — 带加载失败降级的 img
 *
 * - 默认降级：深色占位 + 图片图标 +「图片加载失败」（用于作品图）
 * - fallbackText：圆形首字占位（用于头像）
 * - fallback：自定义节点
 * src 切换时自动重置失败状态（Lightbox 翻页等场景）。
 */
export function SmartImage({
  src,
  alt,
  className,
  onError,
  fallback,
  fallbackText,
  ...rest
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    if (fallback) return <>{fallback}</>;

    if (fallbackText !== undefined) {
      return (
        <div
          aria-hidden="true"
          className={`${className ?? ''} flex items-center justify-center bg-bg-deep text-text-secondary font-medium select-none overflow-hidden`}
        >
          {fallbackText}
        </div>
      );
    }

    return (
      <div
        role="img"
        aria-label={`图片加载失败：${typeof alt === 'string' ? alt : ''}`.trim()}
        className={`${className ?? ''} flex flex-col items-center justify-center gap-2 bg-bg-deep text-text-muted select-none overflow-hidden`}
      >
        <Icon name="image" size={32} className="opacity-40" />
        <span className="text-caption">图片加载失败</span>
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        onError?.(event);
        setFailed(true);
      }}
    />
  );
}
