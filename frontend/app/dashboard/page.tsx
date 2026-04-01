'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { api, DashboardStats, Repository } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  GitBranch,
  Eye,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Activity,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Single rAF-driven counter hook.
 * All StatCards share one animation pass via staggered delay.
 */
function useCountUp(endValue: number, duration = 1200, delay = 0): number {
  const [count, setCount] = useState(0);
  const end = typeof endValue === 'string' ? parseInt(endValue, 10) || 0 : endValue;

  useEffect(() => {
    if (end === 0) return;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, delay]);

  return count;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = '#C9A84C',
  isCritical = false,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  isCritical?: boolean;
  delay?: number;
}) {
  const count = useCountUp(value, 1200, delay);

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-6 relative overflow-hidden group hover:border-[#333] transition-colors">
      <div
        className="absolute top-0 left-0 w-full h-[2px] opacity-20 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-black/40 rounded-lg text-[#6b6b6b] group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        {isCritical && value > 0 && (
          <span className="text-[10px] font-bold text-[#dc2626] bg-[#dc2626]/10 px-2 py-0.5 rounded border border-[#dc2626]/20 animate-pulse">
            ACTION REQUIRED
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b]">
          {label}
        </p>
        <h3
          className="text-3xl font-bold tracking-tighter"
          style={{ color: isCritical && value > 0 ? '#dc2626' : '#ededed' }}
        >
          {count}
        </h3>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats } = useSWR<DashboardStats>(
    'dashboard-stats',
    api.getDashboardStats
  );
  const { data: repos } = useSWR<Repository[]>(
    'repositories-list',
    api.getRepositories
  );

  const reviews = stats?.recentReviews || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 selection:bg-[#C9A84C] selection:text-black">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2a2a2a]/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">
            <Activity size={12} /> SYSTEM OPERATIONAL
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">
            System Overview
            <span className="text-[#6b6b6b] font-light"> / </span>
            <span className="text-[#C9A84C]">
              {session?.user?.name ||
                (session?.user as { login?: string })?.login ||
                'User'}
            </span>
          </h1>
        </div>
        <div className="text-[10px] font-mono text-[#444444] hidden md:block">
          TEL-ID:{' '}
          {session?.user?.email?.split('@')[0].toUpperCase() || 'REF-HAL-01'}
        </div>
      </section>

      {/* Stats — staggered delays so all 4 rAF loops start offset, reducing frame contention */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Repositories"
          value={Number(stats?.totalRepositories || 0)}
          icon={GitBranch}
          delay={0}
        />
        <StatCard
          label="Total Reviews"
          value={Number(stats?.totalReviews || 0)}
          icon={Eye}
          delay={80}
        />
        <StatCard
          label="Critical Issues"
          value={Number(stats?.totalCritical || 0)}
          icon={ShieldAlert}
          color="#dc2626"
          isCritical
          delay={160}
        />
        <StatCard
          label="Warnings Found"
          value={Number(stats?.totalWarnings || 0)}
          icon={AlertTriangle}
          color="#f97316"
          delay={240}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity Table */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Recent Audits
              <div className="h-[2px] w-12 bg-[#C9A84C] ml-2" />
            </h2>
            <Link
              href="/dashboard/repos"
              className="text-[10px] font-bold text-[#6b6b6b] hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
            >
              View All Clusters
            </Link>
          </div>

          <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]/50 text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b]">
                  <th className="px-6 py-4">Repository cluster</th>
                  <th className="px-6 py-4 text-center">Issues</th>
                  <th className="px-6 py-4 text-center">Critical</th>
                  <th className="px-6 py-4 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {!reviews || reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <svg
                          viewBox="0 0 200 120"
                          className="w-24 h-auto mb-4 text-[#C9A84C]"
                        >
                          <path
                            d="M10,60 Q30,20 60,30 Q80,35 90,25 Q110,10 140,15 Q170,20 190,40 Q170,45 150,40 Q130,50 120,60 Q110,80 90,85 Q70,90 50,80 Q30,85 10,60 Z"
                            fill="currentColor"
                          />
                        </svg>
                        <p className="text-xs font-bold uppercase tracking-widest">
                          No reviews yet. CodeHalcon is watching.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#ededed] group-hover:text-[#C9A84C] transition-colors">
                          {review.owner && review.repo
                            ? `${review.owner}/${review.repo}`
                            : 'Unknown repo'}
                        </div>
                        <div className="text-[10px] text-[#6b6b6b]">
                          PR #{review.pull_number ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-mono font-bold ${
                            Number(review.total_issues) > 0
                              ? 'text-[#f97316]'
                              : 'text-[#22c55e]'
                          }`}
                        >
                          {Number(review.total_issues) || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-mono font-bold ${
                            Number(review.critical_count) > 0
                              ? 'text-[#dc2626]'
                              : 'text-[#6b6b6b]'
                          }`}
                        >
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
              <div className="py-12 text-center bg-[#111111] border border-dashed border-[#2a2a2a] rounded-[12px] opacity-40">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#6b6b6b]">
                  Zero clusters detected
                </p>
              </div>
            ) : (
              repos.slice(0, 5).map((repo) => (
                <Link
                  key={repo.id}
                  href={`/dashboard/repos/${repo.owner}/${repo.repo}`}
                  className="bg-[#111111] border border-[#2a2a2a] p-5 rounded-[12px] group flex items-center justify-between hover:border-[#444] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#6b6b6b]" />
                    <div>
                      <div className="text-sm font-bold truncate max-w-[150px]">
                        {repo.owner}/{repo.repo}
                      </div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase tracking-tighter">
                        Last Sync: {formatRelativeTime(repo.updated_at)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#6b6b6b] group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-all"
                  />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}