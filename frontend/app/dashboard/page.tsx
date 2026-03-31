'use client';

import useSWR from 'swr';
import { api, DashboardStats, Review, Repository } from '@/lib/api';
import { useCountUp, formatRelativeTime } from '@/lib/utils';
import { 
  GitBranch, 
  Eye, 
  ShieldAlert, 
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = '#C9A84C',
  isCritical = false 
}: { 
  label: string; 
  value: number; 
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; 
  color?: string;
  isCritical?: boolean;
}) {
  const count = useCountUp(value);
  
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-6 relative overflow-hidden group hover:border-[#C9A84C]/30 transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start mb-4">
        <Icon size={20} style={{ color }} className="opacity-80" />
      </div>
      <div 
        className="text-4xl font-bold tracking-tighter mb-1"
        style={{ color: isCritical ? '#dc2626' : (color === '#f97316' ? '#f97316' : '#ffffff') }}
      >
        {count}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b]">
        {label}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, error: statsError } = useSWR<DashboardStats>('dashboard-stats', api.getDashboardStats);
  const { data: reviews, error: reviewsError } = useSWR<Review[]>('recent-reviews', () => api.getReviews(8));
  const { data: repos, error: reposError } = useSWR<Repository[]>('connected-repos', api.getRepositories);

  if (statsError || reviewsError || reposError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-[#dc2626] mb-4" />
        <h3 className="text-xl font-bold mb-2">System Error</h3>
        <p className="text-[#6b6b6b] mb-6">Failed to synchronize with the CodeHalcon telemetry.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#C9A84C] text-black font-bold rounded-lg hover:bg-amber-500 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 selection:bg-[#C9A84C] selection:text-black">
      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Repositories" 
          value={Number(stats?.totalRepositories || 0)} 
          icon={GitBranch} 
        />
        <StatCard 
          label="Total Reviews" 
          value={Number(stats?.totalReviews || 0)} 
          icon={Eye} 
        />
        <StatCard 
          label="Critical Issues" 
          value={Number(stats?.totalCritical || 0)} 
          icon={ShieldAlert} 
          color="#dc2626"
          isCritical
        />
        <StatCard 
          label="Warnings Found" 
          value={Number(stats?.totalWarnings || 0)} 
          icon={AlertTriangle} 
          color="#f97316"
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Reviews Table */}
        <section className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Recent Reviews
              <div className="h-[2px] w-12 bg-[#C9A84C] ml-2" />
            </h2>
            <Link href="/dashboard/reviews" className="text-xs font-semibold text-[#6b6b6b] hover:text-[#C9A84C] transition-colors">
              VIEW ALL
            </Link>
          </div>

          <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]/50 text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b]">
                  <th className="px-6 py-4">Repository</th>
                  <th className="px-6 py-4 text-center">Issues</th>
                  <th className="px-6 py-4 text-center">Critical</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!reviews || reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <svg viewBox="0 0 200 120" className="w-24 h-auto mb-4 text-[#C9A84C]">
                          <path d="M10,60 Q30,20 60,30 Q80,35 90,25 Q110,10 140,15 Q170,20 190,40 Q170,45 150,40 Q130,50 120,60 Q110,80 90,85 Q70,90 50,80 Q30,85 10,60 Z" fill="currentColor" />
                        </svg>
                        <p className="text-xs font-bold uppercase tracking-widest">No reviews yet. CodeHalcon is watching.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#ededed] group-hover:text-[#C9A84C] transition-colors">
                          {review.owner && review.repo ? `${review.owner}/${review.repo}` : 'Unknown repo'}
                        </div>
                        <div className="text-[10px] text-[#6b6b6b]">PR #{review.pull_number ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono font-bold ${Number(review.total_issues) > 0 ? 'text-[#f97316]' : 'text-[#22c55e]'}`}>
                          {Number(review.total_issues) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono font-bold ${Number(review.critical_count) > 0 ? 'text-[#dc2626]' : 'text-[#6b6b6b]'}`}>
                          {Number(review.critical_count) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-[#6b6b6b]">
                        {formatRelativeTime(review.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Repositories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Active Repos
              <div className="h-[2px] w-8 bg-[#C9A84C] ml-2" />
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {!repos || repos.length === 0 ? (
              <div className="bg-[#111111] border border-[#2a2a2a] border-dashed rounded-[12px] p-8 text-center opacity-50">
                <p className="text-xs uppercase font-bold tracking-widest text-[#6b6b6b]">None Connected</p>
              </div>
            ) : (
              repos.slice(0, 5).map((repo) => (
                <Link 
                  key={repo.id} 
                  href={`/dashboard/repos/${repo.owner}/${repo.repo}`}
                  className="halcon-card p-5 group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#6b6b6b]" />
                    <div>
                      <div className="text-sm font-bold truncate max-w-[150px]">{repo.owner}/{repo.repo}</div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase tracking-tighter">
                        Last Sync: {formatRelativeTime(repo.updated_at)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#6b6b6b] group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
