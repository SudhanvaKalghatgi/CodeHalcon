const EXTENSION_MAP = {
  // JavaScript
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  // TypeScript
  ts: "typescript",
  tsx: "typescript",
  // Python
  py: "python",
  // Java
  java: "java",
  // C/C++
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  h: "c",
  hpp: "cpp",
  // Go
  go: "go",
  // Rust
  rs: "rust",
  // Ruby
  rb: "ruby",
  // PHP
  php: "php",
  // Swift
  swift: "swift",
  // Kotlin
  kt: "kotlin",
  // CSS
  css: "css",
  scss: "scss",
  less: "less",
  // HTML
  html: "html",
  htm: "html",
  // Shell
  sh: "shell",
  bash: "shell",
  // Config
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  // Markdown
  md: "markdown",
  // SQL
  sql: "sql",
}

export const detectLanguage = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase()
  return EXTENSION_MAP[ext] || "plaintext"
}