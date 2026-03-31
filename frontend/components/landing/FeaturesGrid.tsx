import { Webhook, BrainCircuit, Bot, ShieldAlert, Settings, LineChart } from 'lucide-react';

export default function FeaturesGrid() {
  return (
    <section id="features" className="halcon-section pb-24">
      <h2 className="text-3xl md:text-5xl font-black mb-16 text-white tracking-tight text-center">Advanced Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <Webhook className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">Webhook Pipeline</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Receives GitHub events instantly via secure webhook integration with HMAC signature verification.
          </p>
        </div>

        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <BrainCircuit className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">Smart Diff Parsing</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Token-aware chunking splits large PRs intelligently, never exceeding LLM context limits.
          </p>
        </div>

        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <Bot className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">LLM-Powered Review</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Llama 3.3 70B analyzes code for security vulnerabilities, bugs, and performance issues.
          </p>
        </div>

        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <ShieldAlert className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">Severity Scoring</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Every file gets a 0-100 quality score. Critical, warning, and suggestion levels clearly labeled.
          </p>
        </div>

        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <Settings className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">Per-Repo Config</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Drop a .codehalcon.yml in your repo to customize review focus, ignored paths, and severity thresholds.
          </p>
        </div>

        <div className="halcon-card halcon-feature-card p-8 flex flex-col items-start">
          <LineChart className="w-6 h-6 text-[#C9A84C] mb-4" />
          <h3 className="text-lg font-bold mb-3 text-white">Review Analytics</h3>
          <p className="text-[#6b6b6b] text-sm leading-relaxed">
            Track code quality trends over time. See which files generate the most issues.
          </p>
        </div>

      </div>
    </section>
  );
}
