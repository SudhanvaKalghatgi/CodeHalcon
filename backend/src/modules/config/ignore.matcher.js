const escapeRegex = (str) =>
  str.replace(/[.+^${}()|[\]\\?]/g, "\\$&")

const globToRegex = (pattern) => {
  // Auto-prefix bare patterns (no '/' or '**') to match in any subdirectory
  let normalized = pattern
  if (!pattern.includes("/") && !pattern.includes("**")) {
    normalized = `**/${pattern}`
  }

  // Split on ** first, then handle * within each segment
  const parts = normalized.split("**")
  const escapedParts = parts.map((part) => {
    return part.split("*").map(escapeRegex).join("[^/]*")
  })

  // ** joins become .* (match anything including slashes)
  const regexStr = escapedParts.join(".*")

  return new RegExp(`^${regexStr}$`)
}

export const shouldIgnoreByConfig = (filename, ignorePatterns = []) => {
  return ignorePatterns.some((pattern) => {
    try {
      const regex = globToRegex(pattern)
      return regex.test(filename)
    } catch {
      return false
    }
  })
}