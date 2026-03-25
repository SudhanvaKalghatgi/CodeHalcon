import { getInstallationClient } from "../github/github.service.js"
import { parseDiff } from "./diff.parser.js"
import { get_encoding } from "tiktoken"

const MAX_TOKENS_PER_CHUNK = 3000

// Cache encoder at module scope — avoid recreating on every call
const encoder = get_encoding("cl100k_base")

const countTokens = (text) => {
  return encoder.encode(text).length
}

const chunkHunks = (hunks) => {
  const chunks = []
  let currentChunk = ""
  let currentTokens = 0

  for (const hunk of hunks) {
    const hunkTokens = countTokens(hunk.rawChunk)

    if (currentTokens + hunkTokens > MAX_TOKENS_PER_CHUNK && currentChunk) {
      chunks.push(currentChunk)
      currentChunk = hunk.rawChunk
      currentTokens = hunkTokens
    } else {
      currentChunk += hunk.rawChunk
      currentTokens += hunkTokens
    }
  }

  if (currentChunk) chunks.push(currentChunk)

  return chunks
}

export const fetchAndParseDiff = async (installationId, owner, repo, pullNumber) => {
  const octokit = await getInstallationClient(installationId)

  const response = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner,
    repo,
    pull_number: pullNumber,
    headers: {
      accept: "application/vnd.github.v3.diff",
    },
  })

  const rawDiff = response.data
  const parsedFiles = parseDiff(rawDiff)

  const chunkedFiles = parsedFiles.map((file) => ({
    filename: file.filename,
    language: file.language,
    chunks: chunkHunks(file.hunks),
    totalChanges: file.hunks.reduce((acc, h) => acc + h.changes.length, 0),
  }))

  return chunkedFiles.filter((f) => f.chunks.length > 0)
}