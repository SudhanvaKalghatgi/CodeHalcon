import { fetchAndParseDiff } from "../diff/diff.service.js"
import { reviewPullRequest } from "../llm/llm.service.js"
import { postReviewComment, postSummaryComment } from "../github/github.service.js"
import { ApiError } from "../../utils/ApiError.js"

// Format issues into GitHub review comments
const formatReviewComments = (fileReviews) => {
  const comments = []

  for (const file of fileReviews) {
    for (const issue of file.issues) {
      if (!issue.line || !issue.comment) continue

      const severityEmoji = {
        critical: "🔴",
        warning: "🟡",
        suggestion: "🔵",
      }[issue.severity] || "⚪"

      comments.push({
        path: file.filename,
        line: issue.line,
        body: `${severityEmoji} **${issue.severity.toUpperCase()}${issue.title ? ` — ${issue.title}` : ""}**\n\n${issue.comment}`,
      })
    }
  }

  return comments
}

// Format summary comment for the PR
const formatSummaryComment = (reviewResult) => {
  const { files, totalIssues, criticalCount, overallSummary } = reviewResult

  const scoreSection = files
    .filter((f) => f.score !== null)
    .map((f) => `| \`${f.filename}\` | ${f.score}/100 |`)
    .join("\n")

  const issueBreakdown = {
    critical: files.flatMap((f) => f.issues).filter((i) => i.severity === "critical").length,
    warning: files.flatMap((f) => f.issues).filter((i) => i.severity === "warning").length,
    suggestion: files.flatMap((f) => f.issues).filter((i) => i.severity === "suggestion").length,
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
*Reviewed by [CodeHalcon](https://github.com/SudhanvaKalghatgi/CodeHalcon-) — AI powered code review*`
}

// Main orchestrator function
export const orchestrateReview = async ({ installationId, owner, repo, pullNumber, _sha }) => {
  if (!installationId || !owner || !repo || !pullNumber) {
    throw new ApiError(400, "Missing required parameters for review orchestration")
  }

  // Step 1 — Fetch and parse the diff
  const parsedFiles = await fetchAndParseDiff(installationId, owner, repo, pullNumber)

  if (parsedFiles.length === 0) {
    await postSummaryComment(
      installationId,
      owner,
      repo,
      pullNumber,
      "## 🦅 CodeHalcon Review\n\nNo reviewable files found in this pull request."
    )
    return { skipped: true }
  }

  // Step 2 — Run LLM review
  const reviewResult = await reviewPullRequest(parsedFiles)

  // Step 3 — Format and post inline comments
  const reviewComments = formatReviewComments(reviewResult.files)

  if (reviewComments.length > 0) {
    await postReviewComment(installationId, owner, repo, pullNumber, reviewComments)
  }

  // Step 4 — Post summary comment
  const summaryComment = formatSummaryComment(reviewResult)
  await postSummaryComment(installationId, owner, repo, pullNumber, summaryComment)

  return {
    skipped: false,
    totalIssues: reviewResult.totalIssues,
    criticalCount: reviewResult.criticalCount,
    filesReviewed: parsedFiles.length,
  }
}