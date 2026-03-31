/**
 * Frame Loader — handles loading and caching of WEBP frame sequences.
 * 
 * PERFORMANCE:
 * - Uses img.decode() to ensure frames are GPU-ready before first paint
 * - Larger batches (8) for faster total load, with requestIdleCallback yielding
 * - Priority loading: critical first 20 frames block startup,
 *   remaining load in background without blocking main thread
 */

const FRAME_COUNT = 96;
const CRITICAL_PRELOAD_COUNT = 20;
const BATCH_SIZE = 8;

export interface FrameStore {
  frames: (HTMLImageElement | null)[];
  totalFrames: number;
  isLoaded: (index: number) => boolean;
  getFrame: (index: number) => HTMLImageElement | null;
}

function zeroPad(num: number, size: number = 3): string {
  return String(num).padStart(size, '0');
}

function buildFramePaths(scene: 1 | 2): string[] {
  const folder = scene === 1 ? 'Scene1_WEBP' : 'Scene2_WEBP';
  return Array.from({ length: FRAME_COUNT }, (_, i) =>
    `/portfolio/${folder}/ezgif-frame-${zeroPad(i + 1)}.webp`
  );
}

async function loadSingleFrame(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      img.decode()
        .then(() => resolve(img))
        .catch(() => resolve(img));
    };
    img.onerror = reject;
  });
}

async function loadBatch(
  paths: string[],
  startIndex: number,
  store: (HTMLImageElement | null)[],
  offset: number
): Promise<void> {
  const promises = paths.map(async (path, i) => {
    try {
      const img = await loadSingleFrame(path);
      store[offset + startIndex + i] = img;
    } catch {
      // Silent fail for individual frames — animation will skip them
    }
  });
  await Promise.all(promises);
}

/** Yield to main thread using requestIdleCallback if available, else setTimeout */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => resolve(), { timeout: 100 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export function createFrameStore(): FrameStore {
  const totalFrames = FRAME_COUNT * 2;
  const frames: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);

  return {
    frames,
    totalFrames,
    isLoaded: (index: number) => frames[index] !== null,
    getFrame: (index: number) => frames[index],
  };
}

/**
 * Preload critical first frames of Scene 1 (frames 0–19).
 */
export async function preloadCritical(store: FrameStore): Promise<void> {
  const scene1Paths = buildFramePaths(1);
  const criticalPaths = scene1Paths.slice(0, CRITICAL_PRELOAD_COUNT);
  await loadBatch(criticalPaths, 0, store.frames, 0);
}

/**
 * Lazy-load remaining frames in the background.
 * Uses larger batches and requestIdleCallback for smoother main thread.
 */
export async function preloadRemaining(store: FrameStore): Promise<void> {
  const scene1Paths = buildFramePaths(1);
  const scene2Paths = buildFramePaths(2);

  // Load remaining Scene 1 frames
  const remaining1 = scene1Paths.slice(CRITICAL_PRELOAD_COUNT);
  for (let i = 0; i < remaining1.length; i += BATCH_SIZE) {
    const batch = remaining1.slice(i, i + BATCH_SIZE);
    await loadBatch(batch, CRITICAL_PRELOAD_COUNT + i, store.frames, 0);
    await yieldToMain();
  }

  // Load all Scene 2 frames
  for (let i = 0; i < scene2Paths.length; i += BATCH_SIZE) {
    const batch = scene2Paths.slice(i, i + BATCH_SIZE);
    await loadBatch(batch, i, store.frames, FRAME_COUNT);
    await yieldToMain();
  }
}
