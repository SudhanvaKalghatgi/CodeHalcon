/**
 * API client — all requests go through Next.js /api/proxy/* routes.
 * The actual backend URL and API key never leave the server.
 */

export interface Review {
  id: string;
  pull_request_id: string;
  total_issues: string | number;
  critical_count: string | number;
  warning_count: string | number;
  suggestion_count: string | number;
  files_reviewed: string | number;
  overall_summary: string;
  skipped: boolean;
  created_at: string;
  pull_number: string | number;
  pr_title: string | null;
  owner: string | null;
  repo: string | null;
}

export interface DashboardStats {
  totalRepositories: string | number;
  totalReviews: string | number;
  totalIssues: string | number;
  totalCritical: string | number;
  totalWarnings: string | number;
  totalSuggestions: string | number;
  recentReviews?: Review[];
}

export interface Repository {
  id: string;
  installation_id: string;
  owner: string;
  repo: string;
  created_at: string;
  updated_at: string;
}

export interface RepoStats {
  total_reviews: string | number;
  total_issues_found: string | number;
  total_critical: string | number;
  total_warnings: string | number;
  total_suggestions: string | number;
  avg_issues_per_pr: string | number;
}

async function proxyFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  const json = await res.json();
  return json.data;
}

export const api = {
  getDashboardStats(): Promise<DashboardStats> {
    return proxyFetch<DashboardStats>('/dashboard');
  },
  getRepositories(): Promise<Repository[]> {
    return proxyFetch<Repository[]>('/repositories');
  },
  getReviews(limit = 20): Promise<Review[]> {
    return proxyFetch<Review[]>(`/reviews?limit=${limit}`);
  },
  getRepoReviews(owner: string, repo: string, limit = 20): Promise<Review[]> {
    return proxyFetch<Review[]>(`/repos/${owner}/${repo}/reviews?limit=${limit}`);
  },
  getRepoStats(owner: string, repo: string): Promise<RepoStats> {
    return proxyFetch<RepoStats>(`/repos/${owner}/${repo}/stats`);
  },
};