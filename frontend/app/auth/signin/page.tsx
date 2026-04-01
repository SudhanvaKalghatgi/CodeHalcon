'use client';

import { signIn } from 'next-auth/react';
import { LogIn, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-2">
        <Link href="/" className="text-4xl font-bold text-[#C9A84C] tracking-tighter hover:opacity-80 transition-opacity">
          CodeHalcon 🦅
        </Link>
        <p className="text-[#6b6b6b] text-xs font-bold uppercase tracking-[0.3em] mt-4">
          Secure Access Terminal
        </p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
        
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-[#2a2a2a] rounded-xl bg-black/40">
            <ShieldCheck size={32} className="text-[#C9A84C] mb-3 opacity-50" />
            <h3 className="text-sm font-bold text-[#ededed]">Identity Verification</h3>
            <p className="text-[10px] text-[#6b6b6b] text-center mt-1">Connect your GitHub account to initialize the AI analysis cluster.</p>
          </div>

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 bg-[#ededed] text-black py-4 rounded-xl font-bold hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
          >
            <LogIn size={20} />
            <span>CONTINUE WITH GITHUB</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-1.5 grayscale opacity-30">
            <Activity size={12} className="text-[#C9A84C]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">System: Operational</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-[#444] font-medium leading-relaxed">
        By continuing, you authorize CodeHalcon to access your public repositories<br /> 
        for AI-driven security auditing and optimization.
      </p>
    </div>
  );
}
