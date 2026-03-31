/**
 * Canvas Renderer — handles all canvas drawing and post-processing.
 * 
 * PERFORMANCE NOTES:
 * - ctx.filter blur is extremely expensive (CPU-bound, ~8-16ms per frame).
 *   We simulate the blur/darken transition with a black overlay + globalAlpha
 *   which is GPU-composited and costs <1ms.
 * - Cached dimensions & gradient avoid recalculation per draw.
 * - Minimal context state changes per frame.
 */

import { EffectValues } from './transitionEffects';

export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  cachedDims: { w: number; h: number; x: number; y: number } | null;
  cachedGradient: CanvasGradient | null;
  displayWidth: number;
  displayHeight: number;
}

/**
 * Initialize canvas for HiDPI rendering.
 */
export function initCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement
): CanvasContext {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for perf

  const rect = container.getBoundingClientRect();
  const displayWidth = rect.width;
  const displayHeight = rect.height;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  ctx.scale(dpr, dpr);

  return {
    canvas,
    ctx,
    dpr,
    cachedDims: null,
    cachedGradient: null,
    displayWidth,
    displayHeight,
  };
}

/**
 * Handle window resize — update canvas dimensions.
 */
export function handleResize(
  canvasCtx: CanvasContext,
  container: HTMLElement
): void {
  const { canvas, ctx } = canvasCtx;
  const dpr = canvasCtx.dpr;
  const rect = container.getBoundingClientRect();

  canvasCtx.displayWidth = rect.width;
  canvasCtx.displayHeight = rect.height;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Invalidate caches
  canvasCtx.cachedDims = null;
  canvasCtx.cachedGradient = null;
}

/**
 * Draw a frame to the canvas with effect post-processing.
 * 
 * KEY OPTIMIZATION: Instead of using ctx.filter for blur (which is ~10ms CPU),
 * we use a simple black overlay with varying opacity to simulate the 
 * blur-to-black transition. This achieves the same cinematic effect at <1ms cost.
 */
export function drawFrame(
  canvasCtx: CanvasContext,
  frame: HTMLImageElement,
  effects: EffectValues
): void {
  const { ctx, dpr } = canvasCtx;
  const displayWidth = canvasCtx.displayWidth;
  const displayHeight = canvasCtx.displayHeight;

  // 1. Calculate or use cached draw dimensions (cover fit)
  if (!canvasCtx.cachedDims) {
    const imgAspect = frame.naturalWidth / frame.naturalHeight;
    const canvasAspect = displayWidth / displayHeight;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (imgAspect > canvasAspect) {
      drawH = displayHeight;
      drawW = displayHeight * imgAspect;
      drawX = (displayWidth - drawW) / 2;
      drawY = 0;
    } else {
      drawW = displayWidth;
      drawH = displayWidth / imgAspect;
      drawX = 0;
      drawY = (displayHeight - drawH) / 2;
    }

    canvasCtx.cachedDims = { w: drawW, h: drawH, x: drawX, y: drawY };
  }

  const { w: drawW, h: drawH, x: drawX, y: drawY } = canvasCtx.cachedDims;

  // 2. Clear + draw image
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Apply scale effect around center if needed
  const hasScale = effects.scale !== 1;
  if (hasScale) {
    const cx = displayWidth / 2;
    const cy = displayHeight / 2;
    ctx.translate(cx, cy);
    ctx.scale(effects.scale, effects.scale);
    ctx.translate(-cx, -cy);
  }

  // Fill black first then draw frame
  ctx.fillStyle = '#000';
  ctx.fillRect(
    hasScale ? -displayWidth : 0,
    hasScale ? -displayHeight : 0,
    displayWidth * (hasScale ? 3 : 1),
    displayHeight * (hasScale ? 3 : 1)
  );

  ctx.drawImage(frame, drawX, drawY, drawW, drawH);

  // 3. Brightness/darken overlay — replaces expensive ctx.filter brightness
  //    When brightness < 1, overlay a semi-transparent black rect
  if (effects.brightness < 0.99) {
    // Reset transform for overlay
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.globalAlpha = 1 - effects.brightness;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.globalAlpha = 1.0;
  }

  // 4. Radial vignette overlay (cached gradient)
  if (effects.radialDarken > 0.01) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (!canvasCtx.cachedGradient) {
      const cx = displayWidth / 2;
      const cy = displayHeight / 2;
      const outerRadius = Math.hypot(cx, cy);

      const gradient = ctx.createRadialGradient(
        cx, cy, outerRadius * 0.15,
        cx, cy, outerRadius
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

      canvasCtx.cachedGradient = gradient;
    }

    ctx.globalAlpha = effects.radialDarken;
    ctx.fillStyle = canvasCtx.cachedGradient;
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.globalAlpha = 1.0;
  }
}
