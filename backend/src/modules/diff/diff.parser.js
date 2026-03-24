import { detectLanguage } from "./lang.detector.js"
import { shouldIgnoreFile } from "./diff.filter.js"

// Parse hunk header like @@ -10,6 +10,8 @@ to get starting line number
const parseHunkHeader = (header) => {
  const match = header.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
  if (!match) return 1
  return parseInt(match[1], 10)
}

// Parse a single file diff block into structured format
const parseFileDiff = (fileDiff) => {
  const lines = fileDiff.split("\n")

  // Extract filename from diff --git a/... b/...
  const headerLine = lines[0]
  const filenameMatch = headerLine.match(/^diff --git a\/.+ b\/(.+)$/)
  if (!filenameMatch) return null

  const filename = filenameMatch[1]

  if (shouldIgnoreFile(filename)) return null

  const language = detectLanguage(filename)
  const hunks = []
  let currentHunk = null
  let currentLineNumber = 0

  for (const line of lines) {
    // New hunk starts
    if (line.startsWith("@@")) {
      if (currentHunk) hunks.push(currentHunk)

      currentLineNumber = parseHunkHeader(line)
      currentHunk = {
        header: line,
        changes: [],
        rawChunk: line + "\n",
      }
      continue
    }

    if (!currentHunk) continue

    currentHunk.rawChunk += line + "\n"

    if (line.startsWith("+") && !line.startsWith("+++")) {
      currentHunk.changes.push({
        type: "add",
        lineNumber: currentLineNumber,
        content: line.slice(1),
      })
      currentLineNumber++
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      currentHunk.changes.push({
        type: "remove",
        lineNumber: currentLineNumber,
        content: line.slice(1),
      })
      // removed lines don't increment new file line numbers
    } else if (!line.startsWith("---") && !line.startsWith("+++")) {
      // context line
      currentLineNumber++
    }
  }

  if (currentHunk) hunks.push(currentHunk)

  // Skip files with no changes
  if (hunks.length === 0) return null

  return {
    filename,
    language,
    hunks,
  }
}

// Parse full PR diff string into array of structured file diffs
export const parseDiff = (rawDiff) => {
  if (!rawDiff) return []

  // Split by diff --git to get individual file diffs
  const fileDiffs = rawDiff
    .split(/(?=diff --git )/)
    .filter((block) => block.trim().startsWith("diff --git"))

  const parsed = fileDiffs.map(parseFileDiff).filter(Boolean)

  return parsed
}