import Groq from "groq-sdk"
import { config } from "../../config/env.js"
import { buildSystemPrompt, buildReviewPrompt } from "./prompts.js"
import { ApiError } from "../../utils/ApiError.js"

const groq = new Groq({
  apiKey: config.groq.apiKey,
})

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Determine if an error is transient and worth retrying
const isTransientError = (err) => {
  // Network level errors
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED") {
    return true
  }
  // Timeout by name
  if (err.name === "TimeoutError" || err.name === "AbortError") {
    return true
  }
  // HTTP status based — 429 rate limit and 5xx server errors are transient
  const status = err.response?.status || err.status
  if (status === 429 || (status >= 500 && status <= 599)) {
    return true
  }
  return false
}

// Parse LLM response safely
const parseReviewResponse = (content) => {
  try {
    // Strip markdown code fences — case insensitive, with optional metadata
    const cleaned = content
      .replace(/^```[a-z]*\s*/im, "")
      .replace(/```\s*$/im, "")
      .trim()

    const parsed = JSON.parse(cleaned)

    return {
      issues: parsed.issues || [],
      summary: parsed.summary || "",
      score: typeof parsed.score === "number" ? parsed.score : null,
    }
  } catch {
    return {
      issues: [],
      summary: content,
      score: null,
    }
  }
}

// Review a single chunk with retry logic
const reviewChunk = async (filename, language, chunk, attempt = 1) => {
  try {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: buildReviewPrompt(filename, language, chunk),
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new ApiError(500, "Empty response from Groq")
    }

    return parseReviewResponse(content)
  } catch (err) {
    if (attempt < MAX_RETRIES && isTransientError(err)) {
      await sleep(RETRY_DELAY_MS * attempt)
      return reviewChunk(filename, language, chunk, attempt + 1)
    }
    throw new ApiError(
      500,
      `Groq review failed after ${attempt} attempt(s): ${err.message}`
    )
  }
}

// Review all chunks for a single file
const reviewFile = async (file) => {
  const chunkResults = []

  for (const chunk of file.chunks) {
    const result = await reviewChunk(file.filename, file.language, chunk)
    chunkResults.push(result)
  }

  const allIssues = chunkResults.flatMap((r) => r.issues)
  const summaries = chunkResults.map((r) => r.summary).filter(Boolean)
  const scores = chunkResults.map((r) => r.score).filter((s) => s !== null)
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

  return {
    filename: file.filename,
    language: file.language,
    issues: allIssues,
    summary: summaries.join(" "),
    score: avgScore,
  }
}

// Review all files in a PR
export const reviewPullRequest = async (parsedFiles) => {
  if (!parsedFiles || parsedFiles.length === 0) {
    return {
      files: [],
      totalIssues: 0,
      overallSummary: "No reviewable files found in this pull request.",
    }
  }

  const fileReviews = []

  for (const file of parsedFiles) {
    const review = await reviewFile(file)
    fileReviews.push(review)
  }

  const totalIssues = fileReviews.reduce((acc, f) => acc + f.issues.length, 0)
  const criticalCount = fileReviews
    .flatMap((f) => f.issues)
    .filter((i) => i.severity === "critical").length

  const overallSummary = `CodeHalcon reviewed ${fileReviews.length} file(s) and found ${totalIssues} issue(s)${criticalCount > 0 ? `, including ${criticalCount} critical issue(s)` : ""}.`

  return {
    files: fileReviews,
    totalIssues,
    criticalCount,
    overallSummary,
  }
}