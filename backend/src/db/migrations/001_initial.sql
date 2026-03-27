-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id BIGSERIAL PRIMARY KEY,
  installation_id BIGINT NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner, repo)
);

-- Pull requests table
CREATE TABLE IF NOT EXISTS pull_requests (
  id BIGSERIAL PRIMARY KEY,
  repo_id BIGINT REFERENCES repositories(id) ON DELETE CASCADE,
  pull_number INTEGER NOT NULL,
  sha TEXT NOT NULL,
  title TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_id, pull_number, sha)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  pull_request_id BIGINT REFERENCES pull_requests(id) ON DELETE CASCADE,
  total_issues INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  suggestion_count INTEGER DEFAULT 0,
  files_reviewed INTEGER DEFAULT 0,
  overall_summary TEXT,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review issues table
CREATE TABLE IF NOT EXISTS review_issues (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  line_number INTEGER,
  severity TEXT NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repositories_owner_repo ON repositories(owner, repo);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo_id ON pull_requests(repo_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pull_request_id ON reviews(pull_request_id);
CREATE INDEX IF NOT EXISTS idx_review_issues_review_id ON review_issues(review_id);
CREATE INDEX IF NOT EXISTS idx_review_issues_severity ON review_issues(severity);