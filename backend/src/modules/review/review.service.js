import { fetchAndParseDiff } from "../diff/diff.service.js"
import { reviewPullRequest } from "../llm/llm.service.js"
import { postReviewComment, postSummaryComment } from "../github/github.service.js"
import { upsertRepository } from "../../db/queries/repositories.js"
import { ApiError } from "../../utils/ApiError.js"
import sql from "../../db/index.js"

const formatReviewComments = (fileReviews) => {
  const comments = []

  for (const file of fileReviews) {
    for (const issue of file.issues) {
      if (!issue.line || !issue.comment) continue

      const sev = (issue.severity || "unknown").toString().toLowerCase()

      const severityEmoji = {
        critical: "🔴",
        warning: "🟡",
        suggestion: "🔵",
      }[sev] || "⚪"

      comments.push({
        path: file.filename,
        line: issue.line,
        body: `${severityEmoji} **${sev.toUpperCase()}${issue.title ? ` — ${issue.title}` : ""}**\n\n${issue.comment}`,
      })
    }
  }

  return comments
}

const formatSummaryComment = (reviewResult) => {
  const { files, totalIssues, criticalCount, overallSummary } = reviewResult

  const scoreSection = files
    .filter((f) => f.score !== null)
    .map((f) => `| \`${f.filename}\` | ${f.score}/100 |`)
    .join("\n")

  const allIssues = files.flatMap((f) => f.issues)
  const issueBreakdown = { critical: 0, warning: 0, suggestion: 0 }

  for (const issue of allIssues) {
    const sev = issue.severity?.toLowerCase()
    if (sev === "critical") issueBreakdown.critical++
    else if (sev === "warning") issueBreakdown.warning++
    else if (sev === "suggestion") issueBreakdown.suggestion++
  }

  return `## 🦅 CodeHalcon Review

${overallSummary}

### Issue Breakdown
| Severity | Count |
|----------|-------|
| 🔴 Critical | ${issueBreakdown.critical} |
| 🟡 Warning | ${issueBreakdown.warning} |
| 🔵 Suggestion | ${issueBreakdown.suggestion} |

${
  scoreSection
    ? `### File Scores
| File | Score |
|------|-------|
${scoreSection}`
    : ""
}

${
  totalIssues === 0
    ? "✅ **No issues found. Great work!**"
    : `⚠️ **${totalIssues} issue(s) found${criticalCount > 0 ? ` — ${criticalCount} critical` : ""}. Please review the inline comments.**`
}

---
*Reviewed by [CodeHalcon](https://github.com/SudhanvaKalghatgi/CodeHalcon) — AI powered code review*`
}

export const orchestrateReview = async ({ installationId, owner, repo, pullNumber, sha }) => {
  if (!installationId || !owner || !repo || !pullNumber) {
    throw new ApiError(400, "Missing required parameters for review orchestration")
  }

  const reviewStartTime = Date.now()

  // Step 1 — Upsert repository
  const repository = await upsertRepository(installationId, owner, repo)

  // Step 2 — Fetch and parse diff
  const parsedFiles = await fetchAndParseDiff(installationId, owner, repo, pullNumber)

  if (parsedFiles.length === 0) {
    await sql.begin(async (trx) => {
      const [pr] = await trx`
        INSERT INTO pull_requests (repo_id, pull_number, sha, title, action)
        VALUES (${repository.id}, ${pullNumber}, ${sha || "unknown"}, ${null}, ${"skipped"})
        ON CONFLICT (repo_id, pull_number, sha)
        DO UPDATE SET action = EXCLUDED.action
        RETURNING *
      `
      await trx`
        INSERT INTO reviews (pull_request_id, skipped)
        VALUES (${pr.id}, ${true})
        ON CONFLICT (pull_request_id)
        DO UPDATE SET skipped = EXCLUDED.skipped
      `
    })

    await postSummaryComment(
      installationId,
      owner,
      repo,
      pullNumber,
      "## 🦅 CodeHalcon Review\n\nNo reviewable files found in this pull request."
    )
    return { skipped: true }
  }

  // Step 3 — Run LLM review
  const reviewResult = await reviewPullRequest(parsedFiles)

  // Step 4 — Save to database in a single transaction
  await sql.begin(async (trx) => {
    const [pr] = await trx`
      INSERT INTO pull_requests (repo_id, pull_number, sha, title, action)
      VALUES (${repository.id}, ${pullNumber}, ${sha || "unknown"}, ${null}, ${"reviewed"})
      ON CONFLICT (repo_id, pull_number, sha)
      DO UPDATE SET action = EXCLUDED.action
      RETURNING *
    `

    const allIssues = reviewResult.files.flatMap((f) => f.issues)
    const warningCount = allIssues.filter((i) => i.severity?.toLowerCase() === "warning").length
    const suggestionCount = allIssues.filter((i) => i.severity?.toLowerCase() === "suggestion").length

    const [review] = await trx`
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
        ${pr.id},
        ${reviewResult.totalIssues || 0},
        ${reviewResult.criticalCount || 0},
        ${warningCount},
        ${suggestionCount},
        ${parsedFiles.length},
        ${reviewResult.overallSummary || null},
        ${false}
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

    const issues = reviewResult.files.flatMap((file) =>
      file.issues
        .filter((issue) => issue.comment)
        .map((issue) => ({
          review_id: review.id,
          filename: file.filename,
          line_number: issue.line || null,
          severity: issue.severity || "suggestion",
          title: issue.title || null,
          comment: issue.comment,
          language: file.language || null,
        }))
    )

    if (issues.length > 0) {
      await trx`DELETE FROM review_issues WHERE review_id = ${review.id}`
      await trx`INSERT INTO review_issues ${trx(issues)}`
    }
  })

  // Step 5 — Post inline comments
  const reviewComments = formatReviewComments(reviewResult.files)

  if (reviewComments.length > 0) {
    try {
      await postReviewComment(installationId, owner, repo, pullNumber, reviewComments)
    } catch (err) {
      console.error("Failed to post inline review comments:", err.message)
    }
  }

  // Step 6 — Post summary comment
  try {
    const summaryComment = formatSummaryComment(reviewResult)
    await postSummaryComment(installationId, owner, repo, pullNumber, summaryComment)
  } catch (err) {
    console.error("Failed to post summary comment:", err.message)
  }

  const reviewLatency = Date.now() - reviewStartTime

  console.log(JSON.stringify({
    level: "info",
    event: "review_completed",
    owner,
    repo,
    pullNumber,
    latencyMs: reviewLatency,
    totalIssues: reviewResult.totalIssues,
    criticalCount: reviewResult.criticalCount,
    filesReviewed: parsedFiles.length,
  }))

  return {
    skipped: false,
    totalIssues: reviewResult.totalIssues,
    criticalCount: reviewResult.criticalCount,
    filesReviewed: parsedFiles.length,
  }
}