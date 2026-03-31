'use client';

/**
 * HalconHero — main cinematic scroll-driven canvas component.
 * 
 * PERFORMANCE ARCHITECTURE:
 * - rAF-gated rendering: scroll callbacks just set a dirty flag,
 *   actual canvas draws only happen inside requestAnimationFrame
 * - Debounced resize handler prevents layout thrashing
 * - No React re-renders during scroll (all refs, no state)
 * - Canvas draw skips redundant frames (same frame index check)
 */

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createFrameStore,
  preloadCritical,
  preloadRemaining,
  FrameStore,
} from '@/lib/frameLoader';
import {
  initCanvas,
  handleResize,
  drawFrame,
  CanvasContext,
} from '@/lib/canvasRenderer';
import { computeEffects } from '@/lib/transitionEffects';
import TextOverlay from './TextOverlay';

gsap.registerPlugin(ScrollTrigger);

const SCROLL_CONTAINER_ID = 'halcon-scroll-container';
const SCROLL_HEIGHT_VH = 600;

export default function HalconHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const canvasCtxRef = useRef<CanvasContext | null>(null);
  const frameStoreRef = useRef<FrameStore | null>(null);
  const lastFrameIndexRef = useRef<number>(-1);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const mountedRef = useRef(true);

  // rAF-gated rendering: scroll sets pending progress, rAF does the draw
  const pendingProgressRef = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);

  const scheduleRender = useCallback((progress: number) => {
    pendingProgressRef.current = progress;

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        const p = pendingProgressRef.current;
        if (p === null) return;
        pendingProgressRef.current = null;

        const canvasCtx = canvasCtxRef.current;
        const frameStore = frameStoreRef.current;
        if (!canvasCtx || !frameStore) return;

        const effects = computeEffects(p);
        const { frameIndex } = effects;

        // Skip redundant draws
        if (frameIndex === lastFrameIndexRef.current) return;
        lastFrameIndexRef.current = frameIndex;

        const frame = frameStore.getFrame(frameIndex);
        if (!frame) return;

        drawFrame(canvasCtx, frame, effects);
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    const fixedContainer = fixedRef.current;
    if (!canvas || !fixedContainer) return;

    // Init canvas with HiDPI
    canvasCtxRef.current = initCanvas(canvas, fixedContainer);

    // Init frame store
    const store = createFrameStore();
    frameStoreRef.current = store;

    // Preload critical frames, then set up animation
    preloadCritical(store).then(() => {
      if (!mountedRef.current) return;

      // Draw first frame immediately
      const firstFrame = store.getFrame(0);
      if (firstFrame && canvasCtxRef.current) {
        drawFrame(canvasCtxRef.current, firstFrame, computeEffects(0));
      }

      // GSAP ScrollTrigger — scrub drives progress, rAF gates draws
      const trigger = ScrollTrigger.create({
        trigger: `#${SCROLL_CONTAINER_ID}`,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,  // Reduced from 1.2 for snappier response
        onUpdate: (self) => {
          scheduleRender(self.progress);
        },
      });

      triggerRef.current = trigger;

      // Load remaining frames in background
      preloadRemaining(store);
    });

    // Debounced resize handler
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (canvasCtxRef.current && fixedContainer) {
          handleResize(canvasCtxRef.current, fixedContainer);
          // Redraw current frame after resize
          const store = frameStoreRef.current;
          if (store && lastFrameIndexRef.current >= 0) {
            const frame = store.getFrame(lastFrameIndexRef.current);
            if (frame) {
              drawFrame(
                canvasCtxRef.current,
                frame,
                computeEffects(lastFrameIndexRef.current / 191)
              );
            }
          }
        }
      }, 150);
    };

    window.addEventListener('resize', onResize);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      triggerRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (frameStoreRef.current) {
        frameStoreRef.current.frames.fill(null);
      }
    };
  }, [scheduleRender]);

  return (
    <>
      {/* Fixed viewport layer — canvas + text */}
      <div
        ref={fixedRef}
        className="fixed inset-0 z-0"
        style={{ width: '100vw', height: '100vh' }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
        />
      </div>

      {/* Scroll spacer — drives animation progress */}
      <div
        id={SCROLL_CONTAINER_ID}
        className="relative z-10 pointer-events-none"
        style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      />

      {/* Text overlay system */}
      <TextOverlay scrollContainerId={SCROLL_CONTAINER_ID} />
    </>
  );
}
