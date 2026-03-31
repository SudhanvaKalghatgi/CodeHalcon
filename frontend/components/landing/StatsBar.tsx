export default function StatsBar() {
  return (
    <div className="w-full bg-[#111111] border-y border-[#2a2a2a] py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#2a2a2a]">
        
        <div className="flex flex-col items-center justify-center text-center pb-8 md:pb-0 md:px-4">
          <span className="text-4xl font-black text-white mb-2">&lt; 30s</span>
          <span className="text-[#6b6b6b] text-sm font-medium uppercase tracking-wider">Average review time</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-8 md:py-0 md:px-4">
          <span className="text-4xl font-black text-white mb-2">0 Config</span>
          <span className="text-[#6b6b6b] text-sm font-medium uppercase tracking-wider">Required to get started</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-8 md:py-0 md:px-4">
          <span className="text-4xl font-black text-white mb-2">6</span>
          <span className="text-[#6b6b6b] text-sm font-medium uppercase tracking-wider">Severity levels</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center pt-8 md:pt-0 md:px-4">
          <span className="text-4xl font-black text-white mb-2">100%</span>
          <span className="text-[#6b6b6b] text-sm font-medium uppercase tracking-wider">Open source</span>
        </div>

      </div>
    </div>
  );
}
