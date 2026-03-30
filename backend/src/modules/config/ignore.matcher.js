const escapeRegex = (str) =>
  str.replace(/[.+^${}()|[\]\\?]/g, "\\$&")

const globToRegex = (pattern) => {
  // Auto-prefix bare patterns (no '/' or '**') to match in any subdirectory
  let normalized = pattern
  if (!pattern.includes("/") && !pattern.includes("**")) {
    normalized = `**/${pattern}`
  }

  // Replace **/ with a placeholder for optional directory prefix
  // Then replace remaining ** with .*
  // Then replace * with [^/]*
  const regexStr = normalized
    .split("**/").map((segment) => {
      // Within each segment, escape then handle single *
      return segment.split("*").map(escapeRegex).join("[^/]*")
    })
    .join("(?:.*/)?")

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