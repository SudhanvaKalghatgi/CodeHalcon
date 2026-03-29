import sql from "../index.js"

export const createPullRequest = async (repoId, pullNumber, sha, title, action) => {
  const [pr] = await sql`
    INSERT INTO pull_requests (repo_id, pull_number, sha, title, action)
    VALUES (${repoId}, ${pullNumber}, ${sha}, ${title || null}, ${action})
    ON CONFLICT (repo_id, pull_number, sha)
    DO UPDATE SET action = EXCLUDED.action
    RETURNING *
  `
  return pr
}

export const createReview = async (pullRequestId, reviewData) => {
  const {
    totalIssues,
    criticalCount,
    warningCount,
    suggestionCount,
    filesReviewed,
    overallSummary,
    skipped,
  } = reviewData

  const [review] = await sql`
    INSERT INTO reviews (
      pull_request_id,
      total_issues,
      critical_count,
      warning_count,
      suggestion_count,
      files_reviewed,
      overall_summary,
      skipped
    )
    VALUES (
      ${pullRequestId},
      ${totalIssues || 0},
      ${criticalCount || 0},
      ${warningCount || 0},
      ${suggestionCount || 0},
      ${filesReviewed || 0},
      ${overallSummary || null},
      ${skipped || false}
    )
    ON CONFLICT (pull_request_id)
    DO UPDATE SET
      total_issues = EXCLUDED.total_issues,
      critical_count = EXCLUDED.critical_count,
      warning_count = EXCLUDED.warning_count,
      suggestion_count = EXCLUDED.suggestion_count,
      files_reviewed = EXCLUDED.files_reviewed,
      overall_summary = EXCLUDED.overall_summary,
      skipped = EXCLUDED.skipped
    RETURNING *
  `
  return review
}

export const createReviewIssues = async (reviewId, files) => {
  if (!files || files.length === 0) return []

  const issues = files.flatMap((file) =>
    file.issues
      .filter((issue) => issue.comment)
      .map((issue) => ({
        review_id: reviewId,
        filename: file.filename,
        line_number: issue.line || null,
        severity: issue.severity || "suggestion",
        title: issue.title || null,
        comment: issue.comment,
        language: file.language || null,
      }))
  )

  if (issues.length === 0) return []

  // Delete existing issues for this review then reinsert — idempotent on retry
  const inserted = await sql.begin(async (trx) => {
    await trx`DELETE FROM review_issues WHERE review_id = ${reviewId}`
    const rows = await trx`INSERT INTO review_issues ${trx(issues)} RETURNING *`
    return rows
  })

  return inserted
}

export const getReviewsByRepo = async (owner, repo, limit = 20) => {
  const reviews = await sql`
    SELECT
      r.*,
      pr.pull_number,
      pr.sha,
      pr.title as pr_title,
      pr.action,
      pr.created_at as pr_created_at
    FROM reviews r
    JOIN pull_requests pr ON pr.id = r.pull_request_id
    JOIN repositories rep ON rep.id = pr.repo_id
    WHERE rep.owner = ${owner} AND rep.repo = ${repo}
    ORDER BY r.created_at DESC
    LIMIT ${limit}
  `
  return reviews
}

export const getReviewStats = async (owner, repo) => {
  const [stats] = await sql`
    SELECT
      COUNT(r.id) as total_reviews,
      SUM(r.total_issues) as total_issues_found,
      SUM(r.critical_count) as total_critical,
      SUM(r.warning_count) as total_warnings,
      SUM(r.suggestion_count) as total_suggestions,
      AVG(r.total_issues) as avg_issues_per_pr
    FROM reviews r
    JOIN pull_requests pr ON pr.id = r.pull_request_id
    JOIN repositories rep ON rep.id = pr.repo_id
    WHERE rep.owner = ${owner} AND rep.repo = ${repo}
  `
  return stats
}

export const getAllReviews = async (limit = 50) => {
  const reviews = await sql`
    SELECT
      r.*,
      pr.pull_number,
      pr.title as pr_title,
      rep.owner,
      rep.repo
    FROM reviews r
    JOIN pull_requests pr ON pr.id = r.pull_request_id
    JOIN repositories rep ON rep.id = pr.repo_id
    ORDER BY r.created_at DESC
    LIMIT ${limit}
  `
  return reviews
}