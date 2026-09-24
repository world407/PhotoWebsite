import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from 'ogl';
import './RippleDistortion.css';

const MAX_WAVES = 100;
const START_SCALE = 1.5;
const LIFE_CONSTANT = Math.log(500);
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

type RippleQuality = 'low' | 'medium' | 'high';

const QUALITY_SCALE: Record<RippleQuality, number> = { low: 0.4, medium: 0.7, high: 1 };

const waveVertex = `
precision highp float;

attribute vec2 position;
attribute vec2 uv;
attribute vec2 iOffset;
attribute vec2 iScale;
attribute float iOpacity;

varying vec2 vUv;
varying float vOpacity;

void main() {
  vUv = uv;
  vOpacity = iOpacity;
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);
}
`;

const waveFragment = `
precision highp float;

varying vec2 vUv;
varying float vOpacity;

uniform float uRings;

const float PI = 3.141592653589793;
const float EDGE = 0.006737947;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = dot(p, p);
  if (r > 1.0) discard;

  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);

  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);

  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);
}
`;

const screenVertex = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const compositeFragment = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uTexel;
uniform vec3 uTint;
uniform vec3 uHighlight;
uniform float uStrength;
uniform float uSwirl;
uniform float uDispersion;
uniform float uGlint;
uniform float uTintAmount;
uniform float uGrayscale;

const float TAU = 6.283185307179586;

vec2 coverUV(vec2 uv) {
  vec2 safe = max(uTextureSize, vec2(1.0));
  vec2 s = uResolution / safe;
  vec2 scaledSize = safe * max(s.x, s.y);
  vec2 offset = (uResolution - scaledSize) * 0.5;
  return (uv * uResolution - offset) / scaledSize;
}

void main() {
  float amount = texture2D(uDisplacement, vUv).r;
  vec2 base = coverUV(vUv);

  float theta = amount * uSwirl * TAU;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 push = dir * amount * uStrength;

  vec3 color;
  if (uDispersion > 0.001) {
    float split = uDispersion * 0.25;
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;
    color.g = texture2D(uTexture, base + push).g;
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;
  } else {
    color = texture2D(uTexture, base + push).rgb;
  }

  if (uGrayscale > 0.001) {
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);
  }

  if (uTintAmount > 0.001) {
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);
  }

  if (uGlint > 0.001) {
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
    float raw = pow(max(dot(normal, light), 0.0), 22.0);
    float flatSpec = pow(max(light.z, 0.0), 22.0);
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

interface RippleDistortionProps {
  /** 涟漪层绘制的图片 URL（需支持 CORS） */
  src: string;
  /** 涟漪笔刷直径（CSS 像素） */
  brushSize?: number;
  /** 扭曲强度 */
  strength?: number;
  /** 漩涡扭曲量 */
  swirl?: number;
  /** 涟漪环数 */
  rings?: number;
  /** 扩散倍率 */
  spread?: number;
  /** 消散时长（秒） */
  fade?: number;
  /** 触发涟漪的最小指针位移 */
  spacing?: number;
  /** 色散强度 */
  dispersion?: number;
  /** 高光闪亮度 */
  glint?: number;
  /** 涟漪区域染色（默认品牌金） */
  tint?: string;
  /** 染色强度（默认克制） */
  tintAmount?: number;
  /** 是否去色 */
  grayscale?: boolean;
  /** 高光颜色 */
  highlightColor?: string;
  /** 位移场渲染精度 */
  quality?: RippleQuality;
  /** 总开关 */
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface UniformBox<T> {
  value: T;
}

interface WaveUniforms {
  uRings: UniformBox<number>;
}

interface CompositeUniforms {
  uTexture: UniformBox<Texture>;
  uDisplacement: UniformBox<Texture>;
  uResolution: UniformBox<[number, number]>;
  uTextureSize: UniformBox<[number, number]>;
  uTexel: UniformBox<[number, number]>;
  uTint: UniformBox<[number, number, number]>;
  uHighlight: UniformBox<[number, number, number]>;
  uStrength: UniformBox<number>;
  uSwirl: UniformBox<number>;
  uDispersion: UniformBox<number>;
  uGlint: UniformBox<number>;
  uTintAmount: UniformBox<number>;
  uGrayscale: UniformBox<number>;
}

interface WaveState {
  x: number;
  y: number;
  scale: number;
  target: number;
  size: number;
  opacity: number;
}

const hexToRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function RippleDistortion({
  src,
  brushSize = 150,
  strength = 0.2,
  swirl = 1,
  rings = 4,
  spread = 5,
  fade = 3,
  spacing = 15,
  dispersion = 0,
  glint = 0,
  tint = '#d4a853',
  tintAmount = 0.15,
  grayscale = false,
  highlightColor = '#ffffff',
  quality = 'low',
  enabled = true,
  className = '',
  style,
}: RippleDistortionProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{ wave: WaveUniforms; composite: CompositeUniforms } | null>(null);

  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const configRef = useRef({ brushSize, spread, fade, spacing, enabled });
  configRef.current = { brushSize, spread, fade, spacing, enabled };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || reduceMotion || !enabled) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      // GL 上下文创建失败：静默降级，不渲染 canvas，原图自然显示
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    const canvas = gl.canvas;
    mount.appendChild(canvas);

    let disposed = false;
    let textureReady = false;

    const imageTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    const offsets = new Float32Array(MAX_WAVES * 2);
    const scales = new Float32Array(MAX_WAVES * 2);
    const opacities = new Float32Array(MAX_WAVES);

    const waves: WaveState[] = Array.from({ length: MAX_WAVES }, () => ({
      x: 0,
      y: 0,
      scale: START_SCALE,
      target: START_SCALE,
      size: 1,
      opacity: 0,
    }));
    let current = 0;

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },
      iOffset: { instanced: 1, size: 2, data: offsets },
      iScale: { instanced: 1, size: 2, data: scales },
      iOpacity: { instanced: 1, size: 1, data: opacities },
    });

    const waveUniforms: WaveUniforms = { uRings: { value: 0 } };
    const waveProgram = new Program(gl, {
      vertex: waveVertex,
      fragment: waveFragment,
      uniforms: waveUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);
    const waveMesh = new Mesh(gl, { geometry, program: waveProgram, frustumCulled: false });

    const displacementTarget = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    // 初始为中性值，实际参数由下方 uniform 同步 effect 在挂载后立即写入
    const compositeUniforms: CompositeUniforms = {
      uTexture: { value: imageTexture },
      uDisplacement: { value: displacementTarget.texture },
      uResolution: { value: [1, 1] },
      uTextureSize: { value: [1, 1] },
      uTexel: { value: [1, 1] },
      uTint: { value: [1, 1, 1] },
      uHighlight: { value: [1, 1, 1] },
      uStrength: { value: 0 },
      uSwirl: { value: 0 },
      uDispersion: { value: 0 },
      uGlint: { value: 0 },
      uTintAmount: { value: 0 },
      uGrayscale: { value: 0 },
    };

    const compositeGeometry = new Triangle(gl);
    const compositeProgram = new Program(gl, {
      vertex: screenVertex,
      fragment: compositeFragment,
      uniforms: compositeUniforms,
      depthTest: false,
      depthWrite: false,
    });
    const compositeMesh = new Mesh(gl, { geometry: compositeGeometry, program: compositeProgram });

    uniformsRef.current = { wave: waveUniforms, composite: compositeUniforms };

    let width = 1;
    let height = 1;

    const resize = () => {
      width = Math.max(1, mount.clientWidth);
      height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height);
      compositeUniforms.uResolution.value = [width, height];

      const scale = QUALITY_SCALE[quality];
      const fieldW = Math.max(2, Math.round(width * scale));
      const fieldH = Math.max(2, Math.round(height * scale));
      displacementTarget.setSize(fieldW, fieldH);
      compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const setNewWave = (x: number, y: number) => {
      const cfg = configRef.current;
      const wave = waves[current];
      current = (current + 1) % MAX_WAVES;
      wave.x = x;
      wave.y = y;
      wave.scale = START_SCALE;
      wave.target = START_SCALE * Math.max(1, cfg.spread);
      wave.size = Math.max(1, cfg.brushSize);
      wave.opacity = 1;
    };

    const localPoint = (clientX: number, clientY: number): [number, number] | null => {
      const rect = mount.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return null;
      }
      return [clientX - rect.left, rect.height - (clientY - rect.top)];
    };

    let previousX = 0;
    let previousY = 0;

    const spawnAt = (clientX: number, clientY: number, force: boolean) => {
      const cfg = configRef.current;
      if (!cfg.enabled || !textureReady) return;
      const point = localPoint(clientX, clientY);
      if (!point) return;
      const step = Math.max(1, cfg.spacing);
      if (force || Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {
        setNewWave(point[0], point[1]);
        previousX = point[0];
        previousY = point[1];
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      spawnAt(event.clientX, event.clientY, false);
    };

    const onPointerEnter = (event: PointerEvent) => {
      spawnAt(event.clientX, event.clientY, true);
    };

    const onPointerLeave = () => {
      previousX = 0;
      previousY = 0;
    };

    mount.addEventListener('pointermove', onPointerMove, { passive: true });
    mount.addEventListener('pointerenter', onPointerEnter, { passive: true });
    mount.addEventListener('pointerleave', onPointerLeave, { passive: true });

    let raf = 0;
    let running = false;
    let inView = true;
    let pageVisible = true;
    let previousTime = 0;
    let lastRenderTime = 0;

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - lastRenderTime < FRAME_MS) return;
      lastRenderTime = now;

      const delta = previousTime ? Math.min(0.05, (now - previousTime) / 1000) : 0;
      previousTime = now;
      const cfg = configRef.current;

      const growth = 1 - Math.exp(-delta * 1.09);
      const decay = Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));

      for (let i = 0; i < MAX_WAVES; i += 1) {
        const wave = waves[i];
        if (wave.opacity <= 0) {
          opacities[i] = 0;
          continue;
        }

        wave.opacity *= decay;
        wave.scale += (wave.target - wave.scale) * growth;

        if (wave.opacity < 0.002) {
          wave.opacity = 0;
          opacities[i] = 0;
          continue;
        }

        const half = (wave.scale * wave.size) / 2;
        offsets[i * 2] = (wave.x / width) * 2 - 1;
        offsets[i * 2 + 1] = (wave.y / height) * 2 - 1;
        scales[i * 2] = (half / width) * 2;
        scales[i * 2 + 1] = (half / height) * 2;
        opacities[i] = wave.opacity;
      }

      geometry.attributes.iOffset.needsUpdate = true;
      geometry.attributes.iScale.needsUpdate = true;
      geometry.attributes.iOpacity.needsUpdate = true;

      renderer.render({ scene: waveMesh, target: displacementTarget, clear: true });
      renderer.render({ scene: compositeMesh });
    };

    const start = () => {
      if (running || disposed || !textureReady || !inView || !pageVisible) return;
      running = true;
      previousTime = 0;
      lastRenderTime = 0;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // 纹理加载：crossOrigin 允许采样 unsplash；就绪前 canvas 保持隐藏，不渲染涟漪
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      if (disposed) return;
      imageTexture.image = image;
      compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];
      textureReady = true;
      mount.classList.add('is-ready');
      start();
    };
    image.onerror = () => {
      // 纹理加载失败：canvas 保持透明，原图自然显示
    };
    image.src = src;

    const io = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView) {
        start();
      } else {
        stop();
      }
    });
    io.observe(mount);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        start();
      } else {
        stop();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerenter', onPointerEnter);
      mount.removeEventListener('pointerleave', onPointerLeave);
      image.onload = null;
      image.onerror = null;
      uniformsRef.current = null;
      mount.classList.remove('is-ready');
      if (canvas.parentNode === mount) mount.removeChild(canvas);
      waveProgram.remove();
      compositeProgram.remove();
      geometry.remove();
      compositeGeometry.remove();
      const ext = gl.getExtension('WEBGL_lose_context') as { loseContext(): void } | null;
      if (ext) ext.loseContext();
    };
  }, [src, quality, reduceMotion, enabled]);

  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.wave.uRings.value = rings;
    u.composite.uStrength.value = strength;
    u.composite.uSwirl.value = swirl;
    u.composite.uDispersion.value = dispersion;
    u.composite.uGlint.value = glint;
    u.composite.uTintAmount.value = tintAmount;
    u.composite.uGrayscale.value = grayscale ? 1 : 0;
    u.composite.uHighlight.value = hexToRGB(highlightColor);
    u.composite.uTint.value = hexToRGB(tint);
  }, [rings, strength, swirl, dispersion, glint, tintAmount, grayscale, highlightColor, tint]);

  if (reduceMotion || !enabled) return null;

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`ripple-distortion${className ? ` ${className}` : ''}`}
      style={style}
    />
  );
}
