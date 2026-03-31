'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Atmosphere() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hero section has its own colorful canvas. We only want this on sub-pages.
  const isHome = pathname === '/';

  useEffect(() => {
    if (!containerRef.current || isHome) return;

    const blobs = containerRef.current.querySelectorAll('.atmos-blob');
    
    // Kill existing animations first
    gsap.killTweensOf(blobs);

    blobs.forEach((blob, i) => {
      // Create random floating ambient movement
      gsap.to(blob, {
        x: 'random(-15vw, 15vw)',
        y: 'random(-15vh, 15vh)',
        scale: 'random(0.9, 1.2)',
        duration: 'random(12, 25)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * -2 // Offset starts
      });
    });

    return () => {
      gsap.killTweensOf(blobs);
    };
  }, [isHome]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden transition-opacity duration-[2000ms] ease-out"
      style={{ opacity: isHome ? 0 : 0.85 }} 
    >
      {/* 
        Using high-performance blurred elements.
        Instead of CSS filter: blur(), we use pre-blurred radial gradients.
      */}
      
      {/* Cyan/Teal Orb */}
      <div 
        className="atmos-blob absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full mix-blend-screen opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)', transform: 'translate3d(0,0,0)' }}
      />
      
      {/* Emerald/Green Orb */}
      <div 
        className="atmos-blob absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', transform: 'translate3d(0,0,0)' }}
      />
      
      {/* Deep Blue/Indigo Orb - Center fill */}
      <div 
        className="atmos-blob absolute top-1/4 left-1/4 w-[70vw] h-[70vw] max-w-[1200px] max-h-[1200px] rounded-full mix-blend-screen opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', transform: 'translate3d(0,0,0)' }}
      />

      {/* Amber/Gold Orb (Subtle touch matching the eye frame) */}
      <div 
        className="atmos-blob absolute top-1/3 right-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full mix-blend-screen opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', transform: 'translate3d(0,0,0)' }}
      />
    </div>
  );
}
