import { defaultConfig } from "./config.defaults.js"

const VALID_SEVERITIES = ["critical", "warning", "suggestion"]
const VALID_FOCUS = ["security", "bugs", "performance", "error_handling", "maintainability"]

export const validateConfig = (raw) => {
  if (!raw || typeof raw !== "object") return defaultConfig

  const config = {
    version: 1,
    review: { ...defaultConfig.review },
  }

  const review = raw.review || {}

  // Validate min_severity
  if (review.min_severity && VALID_SEVERITIES.includes(review.min_severity)) {
    config.review.min_severity = review.min_severity
  }

  // Validate focus — only assign if filtered result is non-empty
  if (Array.isArray(review.focus) && review.focus.length > 0) {
    const filtered = review.focus.filter((f) => VALID_FOCUS.includes(f))
    if (filtered.length > 0) {
      config.review.focus = filtered
    }
  }

  // Validate ignore patterns
  if (Array.isArray(review.ignore)) {
    config.review.ignore = review.ignore
      .filter((p) => typeof p === "string")
      .slice(0, 50)
  }

  // Validate fail_on_critical
  if (typeof review.fail_on_critical === "boolean") {
    config.review.fail_on_critical = review.fail_on_critical
  }

  // Validate max_files
  if (typeof review.max_files === "number") {
    config.review.max_files = Math.min(Math.max(review.max_files, 1), 50)
  }

  // Validate custom_instructions
  if (typeof review.custom_instructions === "string") {
    config.review.custom_instructions = review.custom_instructions.slice(0, 500)
  }

  return config
}