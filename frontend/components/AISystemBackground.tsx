'use client';
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
      {/* Hero Frame 1 — subtle breathing scale, no blur filter */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-lighten"
        style={{ animation: 'hero-drift 30s ease-in-out infinite alternate' }}
      >
        <Image
          src="/portfolio/Scene1_WEBP/ezgif-frame-001.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          quality={80}
        />
      </div>

      {/* Hero Frame 2 — alpha blended for depth, no blur filter */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-color-dodge"
        style={{ animation: 'hero-drift 40s ease-in-out infinite alternate-reverse' }}
      >
        <Image
          src="/portfolio/Scene2_WEBP/ezgif-frame-045.webp"
          alt=""
          fill
          priority
          className="object-cover object-center scale-110"
          quality={80}
        />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      <div className="absolute inset-0 bg-black/40" />

      {/*
        Ambient glows — replaced blur-[120px] filter with pre-baked radial gradients.
        Visual result is identical, cost is near zero vs ~12ms per repaint for filter blur.
      */}
      <div
        className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full mix-blend-screen opacity-[0.25] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.6) 0%, rgba(14,165,233,0.15) 30%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-[0.2] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.15) 30%, transparent 70%)',
        }}
      />

      <style jsx global>{`
        @keyframes hero-drift {
          0%   { transform: scale(1.02) translate(0, 0); }
          50%  { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1.05) translate(1%, 1%); }
        }
      `}</style>
    </div>
  );
}