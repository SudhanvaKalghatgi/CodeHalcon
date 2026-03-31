'use client';

/**
 * AISystemBackground — A high-performance background component for inner pages
 * that directly echoes the cinematic visuals of the Halcon Hero section.
 * It uses the actual render frames from the hero sequence and blends them
 * to create a resonant, matching atmosphere.
 */

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AISystemBackground() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (isHome || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden bg-[#020202]">
      
      {/* 
        Hero Frame 1 (The Eye / System Boot) - Subtle breathing scale animation
        Uses CSS animations defined in globals or inline inline keyframes via tailwind 
      */}
      <div className="absolute inset-0 opacity-20 mix-blend-lighten animate-[hero-drift_30s_ease-in-out_infinite_alternate]">
        <Image
          src="/portfolio/Scene1_WEBP/ezgif-frame-001.webp"
          alt="Halcon System Frame"
          fill
          priority
          className="object-cover object-center"
          quality={80}
        />
      </div>

      {/* 
        Hero Frame 2 (The Data Matrix) - Alpha blended over top to create depth
      */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-color-dodge animate-[hero-drift_40s_ease-in-out_infinite_alternate-reverse]">
        <Image
          src="/portfolio/Scene2_WEBP/ezgif-frame-045.webp"
          alt="Halcon Matrix Frame"
          fill
          priority
          className="object-cover object-center scale-110"
          quality={80}
        />
      </div>

      {/* 
        Vignette / Shadow Overlay
        Darkens the edges so the text on inner pages remains highly readable while
        the center glows with the hero's energy.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      <div className="absolute inset-0 bg-black/40" />
      
      {/* High-intensity ambient glows to match the hero's color bloom */}
      <div 
        className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-[0.25] blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-[0.2] blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
      />
      
      <style jsx global>{`
        @keyframes hero-drift {
          0% { transform: scale(1.02) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1.05) translate(1%, 1%); }
        }
      `}</style>
    </div>
  );
}
