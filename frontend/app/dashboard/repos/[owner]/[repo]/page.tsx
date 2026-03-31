'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { api, RepoStats, Review } from '@/lib/api';
import { useCountUp, formatRelativeTime } from '@/lib/utils';
import { 
  GitBranch, 
  ShieldAlert, 
  AlertTriangle,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

function RepoStatCard({ label, value, icon: Icon, color = '#C9A84C' }: { label: string; value: number | string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; color?: string }) {
  const count = useCountUp(value);
  const numericValue = Number(value) || 0;
  
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-30" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-3 mb-2">
        <Icon size={16} style={{ color }} className="opacity-80" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b]">{label}</span>
      </div>
      <div className="text-3xl font-bold tracking-tighter" style={{ color: numericValue > 0 && (label.includes('Critical') || label.includes('Issues')) ? color : '#ffffff' }}>
        {count}
      </div>
    </div>
  );
}

function ReviewRow({ review, owner, repo }: { review: Review; owner: string; repo: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)} 
        className={`border-b border-[#2a2a2a] cursor-pointer transition-colors ${expanded ? 'bg-[#1a1a1a]/80' : 'hover:bg-[#1a1a1a]'}`}
      >
        <td className="px-6 py-4">
          <span className="font-bold text-[#ededed]">PR #{review.pull_number ?? '—'}</span>
        </td>
        <td className="px-6 py-4 font-mono text-[10px] text-[#6b6b6b]">
          {review.id.substring(0, 8)}
        </td>
        <td className="px-6 py-4 text-center font-mono text-xs">{Number(review.files_reviewed) || 0}</td>
        <td className="px-6 py-4 text-center">
          <span className={`font-mono text-xs font-bold ${Number(review.total_issues) > 0 ? 'text-[#f97316]' : 'text-[#22c55e]'}`}>
            {Number(review.total_issues) || 0}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`font-mono text-xs font-bold ${Number(review.critical_count) > 0 ? 'text-[#dc2626]' : 'text-[#6b6b6b]'}`}>
            {Number(review.critical_count) || 0}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-xs text-[#6b6b6b] truncate max-w-[200px]">
            {review.overall_summary || 'No summary provided.'}
          </div>
        </td>
        <td className="px-6 py-4 text-right text-[10px] text-[#6b6b6b]">
          {formatRelativeTime(review.created_at)}
        </td>
        <td className="px-6 py-4 text-right">
          {expanded ? <ChevronUp size={14} className="text-[#C9A84C]" /> : <ChevronDown size={14} className="text-[#6b6b6b]" />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#1a1a1a]/40 animate-in fade-in duration-300">
          <td colSpan={8} className="px-8 py-6 border-b border-[#2a2a2a]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">In-Depth Analysis Summary</h4>
                <a 
                  href={`https://github.com/${owner}/${repo}/pull/${review.pull_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold text-[#6b6b6b] hover:text-white transition-colors"
                >
                  VIEW ON GITHUB <ExternalLink size={10} />
                </a>
              </div>
              <div className="text-sm leading-relaxed text-[#ededed] bg-black/40 p-4 rounded-lg border border-[#2a2a2a] font-medium italic">
                &quot;{review.overall_summary}&quot;
              </div>
              <div className="flex gap-10 pt-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b] mb-1">Warnings</p>
                  <div className="text-xl font-bold text-[#f97316]">{Number(review.warning_count) || 0}</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b] mb-1">Suggestions</p>
                  <div className="text-xl font-bold text-[#3b82f6]">{Number(review.suggestion_count) || 0}</div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RepoDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  
  const { data: stats, error: statsError } = useSWR<RepoStats>(`stats-${owner}-${repo}`, () => api.getRepoStats(owner, repo));
  const { data: reviews, error: reviewsError } = useSWR<Review[]>(`reviews-${owner}-${repo}`, () => api.getRepoReviews(owner, repo));

  if (statsError || reviewsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-[#dc2626] mb-4" />
        <h3 className="text-xl font-bold mb-2">TELEMETRY OFFLINE</h3>
        <p className="text-[#6b6b6b] mb-6">The system data feed for this repository is currently unreachable.</p>
        <Link 
          href="/dashboard/repos"
          className="px-6 py-2 bg-[#111111] border border-[#2a2a2a] text-[#C9A84C] font-bold rounded-lg hover:border-[#C9A84C] transition-all"
        >
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 selection:bg-[#C9A84C] selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2a2a2a]/40">
        <div className="space-y-2">
          <Link href="/dashboard/repos" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b] hover:text-[#C9A84C] transition-colors mb-4">
            <ArrowLeft size={12} /> BACK TO CLUSTER
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#111111] border border-[#2a2a2a] rounded-2xl text-[#C9A84C]">
              <GitBranch size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter text-[#ededed]">
                {owner}<span className="text-[#444444] px-1">/</span><span className="text-[#C9A84C]">{repo}</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-[#6b6b6b]">SYNC STATUS:</span>
                <span className="text-xs font-bold text-[#22c55e]">OPTIMIZED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#111111] border border-[#2a2a2a] rounded-lg text-xs font-bold hover:border-[#C9A84C]/50 transition-all">
            CONFIG
          </button>
          <button className="px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-xs font-bold hover:bg-amber-500 transition-all">
            MANUAL SCAN
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RepoStatCard label="Total Reviews" value={parseInt(String(stats?.total_reviews), 10) || 0} icon={FolderOpen} />
        <RepoStatCard label="Total Issues" value={parseInt(String(stats?.total_issues_found), 10) || 0} icon={Search} color="#f97316" />
        <RepoStatCard label="Critical" value={parseInt(String(stats?.total_critical), 10) || 0} icon={ShieldAlert} color="#dc2626" />
        <RepoStatCard label="Warnings" value={parseInt(String(stats?.total_warnings), 10) || 0} icon={AlertTriangle} color="#f59e0b" />
      </div>

      {/* Activity Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Automated Audit History
            <div className="h-[2px] w-12 bg-[#C9A84C] ml-2" />
          </h3>
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]/30 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b]">
                <th className="px-6 py-5">PR #</th>
                <th className="px-6 py-5">SHA</th>
                <th className="px-6 py-5 text-center">Files</th>
                <th className="px-6 py-5 text-center">Issues</th>
                <th className="px-6 py-5 text-center">Critical</th>
                <th className="px-6 py-5">Expert Summary</th>
                <th className="px-6 py-5 text-right">Age</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!reviews || reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center opacity-30">
                    <p className="text-xs uppercase font-bold tracking-widest">No audit data available for this cluster.</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <ReviewRow key={review.id} review={review} owner={owner} repo={repo} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
