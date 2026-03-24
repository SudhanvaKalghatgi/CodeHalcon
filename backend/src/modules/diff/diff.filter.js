const IGNORED_EXTENSIONS = [
  "lock",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "pdf",
  "zip",
  "tar",
  "gz",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "mp4",
  "mp3",
  "wav",
]

const IGNORED_FILENAMES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Gemfile.lock",
  ".gitignore",
  ".prettierrc",
  ".eslintrc",
  "eslint.config.js",
]

const IGNORED_PATTERNS = [
  /^dist\//,
  /^build\//,
  /^\.next\//,
  /^coverage\//,
  /^node_modules\//,
  /^vendor\//,
  /\.min\.js$/,
  /\.generated\./,
]

export const shouldIgnoreFile = (filename) => {
  // Check ignored extensions
  const ext = filename.split(".").pop()?.toLowerCase()
  if (IGNORED_EXTENSIONS.includes(ext)) return true

  // Check ignored filenames
  const basename = filename.split("/").pop()
  if (IGNORED_FILENAMES.includes(basename)) return true

  // Check ignored patterns
  if (IGNORED_PATTERNS.some((pattern) => pattern.test(filename))) return true

  return false
}