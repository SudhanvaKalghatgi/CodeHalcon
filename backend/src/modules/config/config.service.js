import yaml from "js-yaml"
import { getInstallationClient } from "../github/github.service.js"
import { validateConfig } from "./config.validator.js"
import { defaultConfig } from "./config.defaults.js"

const CONFIG_FILE = ".codehalcon.yml"

export const fetchRepoConfig = async (installationId, owner, repo) => {
  try {
    const octokit = await getInstallationClient(installationId)

    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path: CONFIG_FILE,
      }
    )

    // GitHub returns base64 encoded content
    const content = Buffer.from(response.data.content, "base64").toString("utf8")
    const raw = yaml.load(content)

    return validateConfig(raw)
  } catch (err) {
    // File not found or parse error — use defaults
    if (err.status === 404) {
      return defaultConfig
    }
    console.error(`Failed to fetch repo config for ${owner}/${repo}:`, err.message)
    return defaultConfig
  }
}