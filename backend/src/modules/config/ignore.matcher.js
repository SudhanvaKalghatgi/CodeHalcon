// Simple glob matcher for ignore patterns
const escapeRegex = (str) => str.replace(/[.+^${}()|[\]\\]/g, "\\$&")

const globToRegex = (pattern) => {
  const escaped = escapeRegex(pattern)
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