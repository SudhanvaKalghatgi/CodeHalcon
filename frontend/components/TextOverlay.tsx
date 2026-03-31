'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextBlock {
  text: string;
  subtext?: string;
  startFrame: number;
  endFrame: number;
  scrub: number;
}

const TOTAL_FRAMES = 192;

const textBlocks: TextBlock[] = [
  { 
    text: 'SILENT. OBSERVING. ALWAYS RUNNING.', 
    subtext: 'CodeHalcon — AI Code Review', 
    startFrame: 3, endFrame: 35, scrub: 1.2 
  },
  { 
    text: 'EVERY PATTERN MATTERS.', 
    subtext: 'Security. Performance. Correctness.', 
    startFrame: 45, endFrame: 80, scrub: 1.1 
  },
  { 
    text: 'PRECISION OVER GUESSWORK.', 
    subtext: 'Critical issues flagged before they reach production.', 
    startFrame: 115, endFrame: 155, scrub: 0.5 
  },
  { 
    text: 'NOTHING ESCAPES.', 
    startFrame: 165, endFrame: 186, scrub: 0.6 
  },
];

function frameToPercent(frame: number): number {
  return (frame / (TOTAL_FRAMES - 1)) * 100;
}

interface TextOverlayProps {
  scrollContainerId: string;
}

export default function TextOverlay({ scrollContainerId }: TextOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerEl = document.getElementById(scrollContainerId);
    if (!triggerEl || !containerRef.current) return;

    const triggers: ScrollTrigger[] = [];
    const els = containerRef.current.querySelectorAll<HTMLElement>('.text-block');

    els.forEach((el, i) => {
      const block = textBlocks[i];
      if (!block) return;

      gsap.set(el, { opacity: 0, y: 20 });

      const trigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: `${frameToPercent(block.startFrame)}% top`,
        end: `${frameToPercent(block.endFrame)}% top`,
        scrub: block.scrub,
        onUpdate: (self) => {
          const p = self.progress;
          let opacity: number;
          let y: number;

          if (p < 0.4) {
            const t = p / 0.4;
            opacity = t;
            y = 20 * (1 - t);
          } else if (p < 0.65) {
            opacity = 1;
            y = 0;
          } else {
            const t = (p - 0.65) / 0.35;
            opacity = 1 - t;
            y = -8 * t;
          }

          gsap.set(el, { opacity, y });
        },
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [scrollContainerId]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-10"
    >
      {textBlocks.map((block, i) => (
        <div
          key={i}
          className="text-block text-block-wrapper"
          style={{ opacity: 0 }}
        >
          <p className="text-overlay-text">{block.text}</p>
          {block.subtext && (
            <p 
              className="mt-4 font-bold tracking-widest uppercase text-white/60 text-center"
              style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1.1rem)' }}
            >
              {block.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
