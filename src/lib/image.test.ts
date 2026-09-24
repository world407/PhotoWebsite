import { describe, it, expect, vi, afterEach } from 'vitest';
import { compressAvatar, compressImage, fileToDataUrl } from './image';

// jsdom 不做真实图片解码，用可控尺寸的 MockImage 替换
let mockDims = { width: 0, height: 0 };
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = mockDims.width;
  naturalHeight = mockDims.height;
  private _src = '';
  set src(value: string) {
    this._src = value;
    // loadImage 先挂 onload 再赋 src，微任务触发即可
    queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}

// canvas 2d 上下文调用记录
const drawImage = vi.fn();
const fillRect = vi.fn();
const save = vi.fn();
const restore = vi.fn();
const ctxMock = {
  drawImage,
  fillRect,
  save,
  restore,
  globalCompositeOperation: '',
  fillStyle: '',
} as unknown as CanvasRenderingContext2D;

function makeFile(): File {
  return new File([new Uint8Array([1, 2, 3, 4])], 'photo.jpg', { type: 'image/jpeg' });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  drawImage.mockClear();
  fillRect.mockClear();
  save.mockClear();
  restore.mockClear();
});

describe('fileToDataUrl', () => {
  it('读出 data URL 前缀', async () => {
    const url = await fileToDataUrl(makeFile());
    expect(url).toMatch(/^data:image\/jpeg;base64,/);
  });
});

describe('compressImage', () => {
  it('长边超过 1600 时等比缩小，aspectRatio 维度不反转', async () => {
    mockDims = { width: 2000, height: 1000 };
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,MOCK');

    const result = await compressImage(makeFile());

    expect(result.width).toBe(1600);
    expect(result.height).toBe(800);
    expect(result.dataUrl).toBe('data:image/jpeg;base64,MOCK');
    expect(drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, 1600, 800);
  });

  it('小图不放大（scale 上限为 1）', async () => {
    mockDims = { width: 400, height: 300 };
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,S');

    const result = await compressImage(makeFile(), 1600);
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });

  it('竖图按高度边缩小', async () => {
    mockDims = { width: 1000, height: 2000 };
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,S');

    const result = await compressImage(makeFile());
    expect(result.width).toBe(800);
    expect(result.height).toBe(1600);
    expect(drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, 800, 1600);
  });

  it('JPEG 输出前在底层铺白底（透明 PNG 防变黑）', async () => {
    mockDims = { width: 100, height: 100 };
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,S');

    await compressImage(makeFile());

    expect(save).toHaveBeenCalled();
    expect(ctxMock.globalCompositeOperation).toBe('destination-over');
    expect(ctxMock.fillStyle).toBe('#ffffff');
    expect(fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(restore).toHaveBeenCalled();
  });
});

describe('compressAvatar', () => {
  it('横图居中正方裁剪后缩放到 256', async () => {
    mockDims = { width: 400, height: 200 };
    vi.stubGlobal('Image', MockImage as unknown as typeof Image);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxMock);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,AVATAR');

    const url = await compressAvatar(makeFile());

    expect(url).toBe('data:image/jpeg;base64,AVATAR');
    // side=200, sx=(400-200)/2=100, sy=0 → drawImage(img, 100, 0, 200, 200, 0, 0, 256, 256)
    expect(drawImage).toHaveBeenCalledWith(expect.any(MockImage), 100, 0, 200, 200, 0, 0, 256, 256);
  });
});
