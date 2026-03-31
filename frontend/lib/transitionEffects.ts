/**
 * Transition Effects — computes visual effect parameters based on scroll progress.
 * Implements 5-phase cinematic transition between Scene 1 and Scene 2.
 * 
 * PERF: All math is pure arithmetic, no allocations. The returned object is 
 * reused via the same structure shape to allow V8 inline caching.
 */

const TOTAL_FRAMES = 192;

// Phase boundaries (frame-based)
const SCENE1_FADE_START = 86;
const SCENE1_FADE_END = 95;
const HOLD_END = 97;
const EYE_ENTRY_END = 100;
const BLACK_BRIDGE_END = 103;
const SCENE2_REVEAL_END = 118;

export interface EffectValues {
  frameIndex: number;
  brightness: number;
  blur: number;       // kept for API compat but not used for canvas filter
  scale: number;
  radialDarken: number;
}

/** Power2 ease in-out */
function easeInOut(t: number): number {
  if (t < 0.5) {
    return 2 * t * t;
  }
  return 1 - (-2 * t + 2) * (-2 * t + 2) * 0.5; // avoid Math.pow
}

/** Clamp value between 0 and 1 */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map a value from one range to 0–1, clamped */
function mapRange(value: number, inMin: number, inMax: number): number {
  return clamp01((value - inMin) / (inMax - inMin));
}

/**
 * Compute all visual effect values for a given scroll progress (0–1).
 */
export function computeEffects(progress: number): EffectValues {
  const rawFrame = progress * (TOTAL_FRAMES - 1);
  const frameIndex = (rawFrame + 0.5) | 0; // faster Math.round for positive numbers

  let brightness = 1;
  let blur = 0;
  let scale = 1;
  let radialDarken = 0;

  // Phase 1: Scene 1 fadeout (frames 86–95)
  if (rawFrame >= SCENE1_FADE_START && rawFrame <= SCENE1_FADE_END) {
    const t = easeInOut(mapRange(rawFrame, SCENE1_FADE_START, SCENE1_FADE_END));
    brightness = lerp(1, 0.15, t);
    blur = lerp(0, 6, t);
    scale = lerp(1, 1.05, t);
    radialDarken = lerp(0, 0.3, t);
  }
  // Phase 2: Hold at darkness (frames 95–97)
  else if (rawFrame > SCENE1_FADE_END && rawFrame <= HOLD_END) {
    brightness = 0.15;
    blur = 6;
    scale = 1.05;
    radialDarken = 0.3;
  }
  // Phase 3: Eye entry (frames 97–100)
  else if (rawFrame > HOLD_END && rawFrame <= EYE_ENTRY_END) {
    const t = easeInOut(mapRange(rawFrame, HOLD_END, EYE_ENTRY_END));
    brightness = lerp(0.15, 0.05, t);
    blur = lerp(6, 8, t);
    scale = lerp(1.05, 1.08, t);
    radialDarken = lerp(0.3, 0.8, t);
  }
  // Phase 4: Near-black bridge (frames 100–103)
  else if (rawFrame > EYE_ENTRY_END && rawFrame <= BLACK_BRIDGE_END) {
    brightness = 0.05;
    blur = 8;
    scale = 1.08;
    radialDarken = 0.8;
  }
  // Phase 5: Scene 2 reveal (frames 103–118)
  else if (rawFrame > BLACK_BRIDGE_END && rawFrame <= SCENE2_REVEAL_END) {
    const t = easeInOut(mapRange(rawFrame, BLACK_BRIDGE_END, SCENE2_REVEAL_END));
    brightness = lerp(0.05, 1, t);
    blur = lerp(8, 0, t);
    scale = lerp(1.08, 1, t);
    radialDarken = lerp(0.8, 0, t);
  }

  return { frameIndex, brightness, blur, scale, radialDarken };
}
