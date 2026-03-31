import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function FinalCTA() {
  return (
    <section className="halcon-section py-32 flex flex-col items-center text-center">
      <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
        Start reviewing smarter.
      </h2>
      <p className="text-xl md:text-2xl text-[#6b6b6b] mb-12 max-w-2xl">
        CodeHalcon watches every line so you don&apos;t have to.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link 
          href="/auth/signin" 
          className="flex items-center gap-2 px-8 py-4 bg-[#C9A84C] text-[#0a0a0a] font-bold rounded-lg hover:bg-[#d4b55a] transition-all amber-glow"
        >
          Install GitHub App
          <ArrowRight className="w-5 h-5" />
        </Link>
        <a 
          href="https://github.com/SudhanvaKalghatgi/CodeHalcon" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-[#C9A84C] text-[#C9A84C] font-bold rounded-lg hover:bg-[#C9A84C]/10 transition-all"
        >
          <GithubIcon className="w-5 h-5" />
          View on GitHub
        </a>
      </div>

      <p className="text-sm font-medium text-[#6b6b6b] tracking-wide">
        Free forever. Open source. No credit card.
      </p>
    </section>
  );
}
