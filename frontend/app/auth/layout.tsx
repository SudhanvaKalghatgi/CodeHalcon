'use client';

import AISystemBackground from '@/components/AISystemBackground';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <AISystemBackground />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold text-[#6b6b6b] hover:text-white transition-opacity uppercase tracking-[0.2em] z-20 group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        ESC_HUB
      </Link>

      <main className="relative z-10 w-full px-6 flex flex-col items-center">
        {children}
      </main>

      <footer className="absolute bottom-8 text-[10px] text-[#444] font-bold uppercase tracking-[0.1em] z-20">
        CodeHalcon Security Cluster — 2026.1
      </footer>
    </div>
  );
}
