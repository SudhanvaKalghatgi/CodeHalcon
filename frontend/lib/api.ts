const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const API_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY || ""

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
}

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

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/api/v1/dashboard`, { headers })
    if (!res.ok) throw new Error("Failed to fetch dashboard stats")
    const json = await res.json()
    return json.data
  },

  async getRepositories(): Promise<Repository[]> {
    const res = await fetch(`${API_URL}/api/v1/repositories`, { headers })
    if (!res.ok) throw new Error("Failed to fetch repositories")
    const json = await res.json()
    return json.data
  },

  async getReviews(limit = 20): Promise<Review[]> {
    const res = await fetch(`${API_URL}/api/v1/reviews?limit=${limit}`, { headers })
    if (!res.ok) throw new Error("Failed to fetch reviews")
    const json = await res.json()
    return json.data
  },

  async getRepoReviews(owner: string, repo: string, limit = 20): Promise<Review[]> {
    const res = await fetch(`${API_URL}/api/v1/repos/${owner}/${repo}/reviews?limit=${limit}`, { headers })
    if (!res.ok) throw new Error("Failed to fetch repo reviews")
    const json = await res.json()
    return json.data
  },

  async getRepoStats(owner: string, repo: string): Promise<RepoStats> {
    const res = await fetch(`${API_URL}/api/v1/repos/${owner}/${repo}/stats`, { headers })
    if (!res.ok) throw new Error("Failed to fetch repo stats")
    const json = await res.json()
    return json.data
  },
}
