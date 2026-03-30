// Escape special regex characters including '?'
const escapeRegex = (str) =>
  str.replace(/[.+^${}()|[\]\\?]/g, "\\$&")

const globToRegex = (pattern) => {
  // Auto-prefix bare patterns (no '/' or '**') to match in any subdirectory
  let normalized = pattern
  if (!pattern.includes("/") && !pattern.includes("**")) {
    normalized = `**/${pattern}`
  }

  const escaped = escapeRegex(normalized)
    .replace(/\\\*/g, "STAR")
    .replace(/STARSTAR\//g, "(?:.+/)?")
    .replace(/STAR/g, "[^/]*")

  return new RegExp(`^${escaped}$`)
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