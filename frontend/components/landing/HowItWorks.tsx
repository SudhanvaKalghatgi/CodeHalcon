import { Puzzle, GitBranch, ScanSearch } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="halcon-section flex flex-col items-center">
      <h2 className="text-3xl md:text-5xl font-black mb-16 text-white tracking-tight">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="halcon-card p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-6">
            <Puzzle className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white">Install the GitHub App</h3>
          <p className="text-[#6b6b6b] leading-relaxed">
            Connect CodeHalcon to your repositories in one click. No configuration required.
          </p>
        </div>
        
        <div className="halcon-card p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-6">
            <GitBranch className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white">Open a Pull Request</h3>
          <p className="text-[#6b6b6b] leading-relaxed">
            Every PR triggers an automatic review. CodeHalcon analyzes every changed file.
          </p>
        </div>

        <div className="halcon-card p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-6">
            <ScanSearch className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-white">Review AI Insights</h3>
          <p className="text-[#6b6b6b] leading-relaxed">
            Inline comments with severity levels. Critical bugs, security issues, and suggestions — all ranked.
          </p>
        </div>
      </div>
    </section>
  );
}
