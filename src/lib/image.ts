/**
 * image.ts — 本地图片处理工具（原生 canvas，零依赖）
 *
 * - compressImage: 作品图长边压缩至 maxEdge，JPEG 输出，返回实际像素尺寸用于 aspectRatio
 * - compressAvatar: 头像居中裁剪为正方形后缩放
 *
 * 注意：aspectRatio 一律 width / height（历史教训：宽高反转曾导致瀑布流布局错误）。
 */

export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('图片读取失败'));
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片解码失败'));
    img.src = src;
  });
}

/** JPEG 不支持透明通道，先铺白底避免透明 PNG 压缩后变黑 */
function drawToJpeg(canvas: HTMLCanvasElement, quality: number): string {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressImage(
  file: File,
  maxEdge = 1600,
  quality = 0.85,
): Promise<CompressedImage> {
  const original = await fileToDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('浏览器不支持 canvas 处理');
  ctx.drawImage(img, 0, 0, width, height);

  return { dataUrl: drawToJpeg(canvas, quality), width, height };
}

export async function compressAvatar(file: File, size = 256, quality = 0.85): Promise<string> {
  const original = await fileToDataUrl(file);
  const img = await loadImage(original);

  // 居中正方形裁剪
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('浏览器不支持 canvas 处理');
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  return drawToJpeg(canvas, quality);
}
