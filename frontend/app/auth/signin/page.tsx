'use client';

import { signIn } from 'next-auth/react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function SignInPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden selection:bg-[#C9A84C] selection:text-black">
      {/* Background Layers */}
      <div className="absolute inset-0 ambient-grid opacity-20 pointer-events-none" />
      
      {/* Hawk Silhouette Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <svg 
          viewBox="0 0 200 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-[80%] max-w-[800px] h-auto text-[#C9A84C]"
          style={{ opacity: 0.04 }}
        >
          <path d="M10,60 Q30,20 60,30 Q80,35 90,25 Q110,10 140,15 Q170,20 190,40 Q170,45 150,40 Q130,50 120,60 Q110,80 90,85 Q70,90 50,80 Q30,85 10,60 Z" fill="currentColor" />
          <path d="M90,85 Q95,100 100,110 Q95,105 85,100 Q80,90 90,85 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-10 md:p-12 mx-4 bg-[#111111] border border-[#2a2a2a] rounded-[16px] shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-2 tracking-tighter">
            CodeHalcon 🦅
          </div>
          <p className="text-[#6b6b6b] uppercase tracking-[0.2em] text-xs font-semibold mb-8">
            Nothing escapes.
          </p>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent mb-8" />

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="group relative w-full flex items-center justify-center gap-3 bg-[#C9A84C] hover:bg-[#d4b75a] text-[#0a0a0a] font-semibold py-3.5 px-6 rounded-[8px] transition-all duration-300 shadow-lg shadow-amber-900/10"
          >
            <GithubIcon className="w-5 h-5" />
            <span>Sign in with GitHub</span>
          </button>

          <p className="mt-8 text-[11px] text-[#6b6b6b] max-w-[240px] leading-relaxed">
            By signing in, you agree to connect your GitHub account to CodeHalcon.
          </p>
        </div>
      </div>
    </main>
  );
}
