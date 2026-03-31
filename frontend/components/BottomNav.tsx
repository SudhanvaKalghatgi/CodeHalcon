'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const heroContainer = document.getElementById('halcon-scroll-container');
    if (!heroContainer) {
      nav.style.opacity = '0.95';
      return;
    }

    const heroHeight = heroContainer.offsetHeight;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroEnd = heroHeight - window.innerHeight;

      if (heroEnd <= 0) {
        nav.style.opacity = '0.95';
        return;
      }

      const fadeStart = heroEnd * 0.8;
      let opacity: number;

      if (scrollY < fadeStart) {
        opacity = 0.45;
      } else if (scrollY >= heroEnd) {
        opacity = 0.95;
      } else {
        const t = (scrollY - fadeStart) / (heroEnd - fadeStart);
        opacity = 0.45 + t * 0.5;
      }

      nav.style.opacity = String(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    requestAnimationFrame(handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide nav on dashboard or auth routes
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      className="bottom-nav"
      style={{ opacity: 0.95 }}
    >
      <div className="bottom-nav-inner flex items-center gap-6 md:gap-8">
        <Link href="/" className="bottom-nav-link text-white font-bold opacity-100 mr-2 md:mr-4 !text-[0.95rem]">
          CodeHalcon 🦅
        </Link>
        <button
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bottom-nav-link"
        >
          Features
        </button>
        <a 
          href="https://github.com/SudhanvaKalghatgi/CodeHalcon" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bottom-nav-link"
        >
          GitHub
        </a>
        <Link href="/auth/signin" className="bottom-nav-link">
          Install App
        </Link>
        <Link 
          href={session ? "/dashboard" : "/auth/signin"}
          className="bottom-nav-link text-[#C9A84C] font-semibold hover:text-[#C9A84C] hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)] transition-all ml-2"
        >
          {session ? "Dashboard" : "Sign in"}
        </Link>
      </div>
    </nav>
  );
}
