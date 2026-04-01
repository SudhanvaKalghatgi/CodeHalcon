'use client';

import useSWR from 'swr';
import { api, Repository } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { 
  ChevronRight,
  Database,
  Search as SearchIcon,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function RepositoriesPage() {
  const { data: repos, error } = useSWR<Repository[]>('repositories-list', api.getRepositories);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-[#dc2626] mb-4" />
        <h3 className="text-xl font-bold mb-2">Sync Failure</h3>
        <p className="text-[#6b6b6b] mb-6">Failed to retrieve connected repositories.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#C9A84C] text-black font-bold rounded-lg hover:bg-amber-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 selection:bg-[#C9A84C] selection:text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Connected Repositories</h2>
          <div className="text-[#6b6b6b] text-sm mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
            System Scan Complete
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
        </div>
        
        <div className="relative group max-w-sm">
          <input 
            type="text" 
            placeholder="Search clusters..."
            className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-all"
          />
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] group-focus-within:text-[#C9A84C] transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {!repos || repos.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center opacity-30">
            <svg viewBox="0 0 200 120" className="w-48 h-auto mb-6 text-[#C9A84C]">
              <path d="M10,60 Q30,20 60,30 Q80,35 90,25 Q110,10 140,15 Q170,20 190,40 Q170,45 150,40 Q130,50 120,60 Q110,80 90,85 Q70,90 50,80 Q30,85 10,60 Z" fill="currentColor" />
            </svg>
            <p className="text-sm font-bold uppercase tracking-[0.2em]">No repositories connected. Initialize system.</p>
          </div>
        ) : (
          repos.map((repo) => (
            <Link 
              key={repo.id}
              href={`/dashboard/repos/${repo.owner}/${repo.repo}`}
              className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-[12px] flex flex-col justify-between min-h-[180px] group transition-all hover:border-[#444]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#6b6b6b] group-hover:text-[#C9A84C] group-hover:border-[#C9A84C]/30 transition-colors">
                    <Database size={20} />
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-[#2a2a2a] text-[#6b6b6b]">
                    Connected
                  </div>
                </div>
                
                <h3 className="mt-6 font-bold text-lg text-[#ededed] truncate group-hover:text-white transition-colors">
                  {repo.owner}/{repo.repo}
                </h3>
                <p className="text-[10px] font-mono text-[#6b6b6b] mt-1 space-x-2">
                  <span>ID: {repo.installation_id}</span>
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#444444] uppercase tracking-tighter">
                  Last Sync: {formatRelativeTime(repo.updated_at)}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW CLUSTER <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
